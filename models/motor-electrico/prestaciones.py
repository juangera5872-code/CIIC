#!/usr/bin/env python3
"""Prestaciones del motor y simulacion del scooter que moveria.

Dos partes independientes:

1. Curva par-velocidad de la maquina. Arranque directo a 50 Hz mediante la
   formula de Kloss, y envolvente con variador (par constante hasta la
   velocidad base, potencia constante por encima, debilitando campo).

2. Simulacion longitudinal de un scooter movido por ese motor: velocidad
   punta, aceleracion por integracion, rampa maxima y consumo.

Solo libreria estandar.
Uso:
    python3 prestaciones.py            # informe completo
    python3 prestaciones.py --json     # datos crudos para graficar
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import asdict, dataclass

G = 9.81


# --- 1. La maquina -------------------------------------------------------------


@dataclass
class Motor:
    """Datos de chapa del motor modelado (IEC 80, 0.75 kW, 4 polos)."""

    potencia: float = 750.0        # W nominales en el eje
    polos: int = 4
    frecuencia: float = 50.0       # Hz
    velocidad_nominal: float = 1400.0   # min-1 a plena carga
    par_max_rel: float = 2.9       # Tmax / Tn  (par de vuelco)
    par_arranque_rel: float = 2.3  # Ta / Tn
    corriente_arranque_rel: float = 5.5
    rendimiento: float = 0.78      # IE2 tipico en este tamano
    factor_potencia: float = 0.79
    tension: float = 400.0         # V entre fases
    velocidad_max_variador: float = 3000.0  # min-1 con debilitamiento 2:1

    @property
    def velocidad_sincrona(self) -> float:
        return 120 * self.frecuencia / self.polos

    @property
    def deslizamiento_nominal(self) -> float:
        return (self.velocidad_sincrona - self.velocidad_nominal) / self.velocidad_sincrona

    @property
    def par_nominal(self) -> float:
        """T = P / w, con w en rad/s."""
        return self.potencia / (self.velocidad_nominal * 2 * math.pi / 60)

    @property
    def par_maximo(self) -> float:
        return self.par_nominal * self.par_max_rel

    @property
    def par_arranque(self) -> float:
        return self.par_nominal * self.par_arranque_rel

    @property
    def corriente_nominal(self) -> float:
        return self.potencia / (
            math.sqrt(3) * self.tension * self.rendimiento * self.factor_potencia
        )

    @property
    def deslizamiento_critico(self) -> float:
        """Deslizamiento del par de vuelco, despejado de Kloss en el punto nominal.

        Kloss:  T/Tmax = 2 / (s/sc + sc/s).  Con T = Tn y s = sn queda una
        ecuacion de segundo grado en x = sn/sc; se toma la raiz con sc > sn.
        """
        k = 2 * self.par_max_rel                      # x + 1/x = 2 Tmax/Tn
        x = (k - math.sqrt(k * k - 4)) / 2
        return self.deslizamiento_nominal / x

    def par_kloss(self, velocidad: float) -> float:
        """Par en arranque directo a 50 Hz, para una velocidad en min-1."""
        s = (self.velocidad_sincrona - velocidad) / self.velocidad_sincrona
        if abs(s) < 1e-9:
            return 0.0
        sc = self.deslizamiento_critico
        return 2 * self.par_maximo / (s / sc + sc / s)

    def par_variador(self, velocidad: float) -> float:
        """Par disponible con variador: constante hasta la base, luego P constante."""
        if velocidad <= 0:
            return self.par_nominal
        if velocidad > self.velocidad_max_variador:
            return 0.0
        base = self.velocidad_nominal
        if velocidad <= base:
            return self.par_nominal
        return self.par_nominal * base / velocidad

    def potencia_en(self, velocidad: float, par: float) -> float:
        return par * velocidad * 2 * math.pi / 60


# --- 2. El scooter -------------------------------------------------------------


@dataclass
class Scooter:
    """Scooter urbano de dos plazas ligero movido por el motor anterior."""

    masa_vehiculo: float = 58.0    # kg en vacio, incluido el motor de 12 kg
    masa_conductor: float = 75.0   # kg
    radio_rueda: float = 0.22      # m, cubierta de 10 pulgadas
    resistencia_rodadura: float = 0.012
    area_frontal_cd: float = 0.60  # m2, Cd*A de un conductor erguido
    densidad_aire: float = 1.20    # kg/m3
    reduccion: float = 5.5         # pinon Ø30 (z=18) contra corona z=99
    rendimiento_transmision: float = 0.92
    inercia_equivalente: float = 1.08   # factor por las masas en rotacion
    bateria: float = 960.0         # Wh (48 V x 20 Ah)

    @property
    def masa(self) -> float:
        return self.masa_vehiculo + self.masa_conductor

    def velocidad(self, rpm_motor: float) -> float:
        """m/s a partir de las revoluciones del motor."""
        return rpm_motor / self.reduccion * 2 * math.pi / 60 * self.radio_rueda

    def rpm(self, velocidad: float) -> float:
        return velocidad / self.radio_rueda * 60 / (2 * math.pi) * self.reduccion

    def resistencia(self, velocidad: float, pendiente: float = 0.0) -> float:
        """Resistencia al avance en N: rodadura + aerodinamica + pendiente."""
        angulo = math.atan(pendiente)
        return (
            self.masa * G * self.resistencia_rodadura * math.cos(angulo)
            + 0.5 * self.densidad_aire * self.area_frontal_cd * velocidad**2
            + self.masa * G * math.sin(angulo)
        )

    def traccion(self, motor: Motor, velocidad: float) -> float:
        """Fuerza en la rueda a esa velocidad, con el motor gobernado por variador."""
        par = motor.par_variador(self.rpm(velocidad))
        return par * self.reduccion * self.rendimiento_transmision / self.radio_rueda


def velocidad_punta(motor: Motor, scooter: Scooter, pendiente: float = 0.0) -> float | None:
    """Velocidad de equilibrio traccion = resistencia, por biseccion.

    Devuelve None si el motor no puede ni arrancar en esa pendiente con su par
    continuo: ahi no hay punta que calcular, hace falta par de sobrecarga.
    """
    lo, hi = 0.0, scooter.velocidad(motor.velocidad_max_variador)
    if scooter.traccion(motor, 0.0) <= scooter.resistencia(0.0, pendiente):
        return None
    if scooter.traccion(motor, hi) > scooter.resistencia(hi, pendiente):
        return hi  # limitada por la velocidad maxima del variador
    for _ in range(80):
        medio = (lo + hi) / 2
        if scooter.traccion(motor, medio) > scooter.resistencia(medio, pendiente):
            lo = medio
        else:
            hi = medio
    return (lo + hi) / 2


def aceleracion(motor: Motor, scooter: Scooter, objetivo_kmh: float,
                paso: float = 0.005, limite: float = 120.0) -> tuple[float, list]:
    """Integra la ecuacion longitudinal hasta alcanzar la velocidad objetivo."""
    objetivo = objetivo_kmh / 3.6
    v, t, historia = 0.0, 0.0, [(0.0, 0.0, 0.0)]
    masa_efectiva = scooter.masa * scooter.inercia_equivalente
    while v < objetivo and t < limite:
        neta = scooter.traccion(motor, v) - scooter.resistencia(v)
        if neta <= 0:
            break  # ya no acelera mas
        v += neta / masa_efectiva * paso
        t += paso
        if len(historia) * 0.1 <= t:
            historia.append((t, v * 3.6, neta))
    return (t if v >= objetivo else float("inf")), historia


def rampa_maxima(motor: Motor, scooter: Scooter, par_relativo: float) -> float:
    """Pendiente (%) que el scooter sube a velocidad estable con ese par."""
    fuerza = (motor.par_nominal * par_relativo * scooter.reduccion
              * scooter.rendimiento_transmision / scooter.radio_rueda)
    velocidad = 3.0  # m/s, subiendo despacio
    disponible = fuerza - 0.5 * scooter.densidad_aire * scooter.area_frontal_cd * velocidad**2
    seno = (disponible - scooter.masa * G * scooter.resistencia_rodadura) / (scooter.masa * G)
    if seno >= 1:
        return float("inf")
    return math.tan(math.asin(max(seno, -1.0))) * 100


def consumo(motor: Motor, scooter: Scooter, velocidad_kmh: float) -> dict:
    """Consumo en llano a velocidad constante y autonomia con la bateria dada."""
    v = velocidad_kmh / 3.6
    potencia_rueda = scooter.resistencia(v) * v
    potencia_bateria = potencia_rueda / (scooter.rendimiento_transmision * motor.rendimiento)
    wh_km = potencia_bateria / velocidad_kmh
    return {
        "velocidad_kmh": velocidad_kmh,
        "potencia_rueda_W": potencia_rueda,
        "potencia_bateria_W": potencia_bateria,
        "consumo_Wh_km": wh_km,
        "autonomia_km": scooter.bateria / wh_km,
    }


# --- Informe -------------------------------------------------------------------


def curvas(motor: Motor, scooter: Scooter) -> dict:
    """Muestreo de las curvas para graficarlas fuera."""
    directo = [
        {"rpm": n, "par": motor.par_kloss(n), "potencia": motor.potencia_en(n, motor.par_kloss(n))}
        for n in range(0, int(motor.velocidad_sincrona) + 1, 25)
    ]
    variador = [
        {"rpm": n, "par": motor.par_variador(n), "potencia": motor.potencia_en(n, motor.par_variador(n))}
        for n in range(0, int(motor.velocidad_max_variador) + 1, 25)
    ]
    v_max = scooter.velocidad(motor.velocidad_max_variador)
    marcha = [
        {
            "kmh": v * 3.6,
            "traccion": scooter.traccion(motor, v),
            "resistencia_0": scooter.resistencia(v),
            "resistencia_5": scooter.resistencia(v, 0.05),
            "resistencia_10": scooter.resistencia(v, 0.10),
        }
        for v in [i * v_max / 120 for i in range(121)]
    ]
    return {"directo": directo, "variador": variador, "marcha": marcha}


def informe(motor: Motor, scooter: Scooter) -> dict:
    punta = velocidad_punta(motor, scooter)
    t25, historia = aceleracion(motor, scooter, 25)
    t30, _ = aceleracion(motor, scooter, 30)
    t35, _ = aceleracion(motor, scooter, 35)
    kmh = lambda v: None if v is None else v * 3.6
    return {
        "motor": {
            "potencia_W": motor.potencia,
            "velocidad_sincrona_rpm": motor.velocidad_sincrona,
            "velocidad_nominal_rpm": motor.velocidad_nominal,
            "deslizamiento_nominal_pct": motor.deslizamiento_nominal * 100,
            "deslizamiento_critico_pct": motor.deslizamiento_critico * 100,
            "par_nominal_Nm": motor.par_nominal,
            "par_maximo_Nm": motor.par_maximo,
            "par_arranque_Nm": motor.par_arranque,
            "corriente_nominal_A": motor.corriente_nominal,
            "corriente_arranque_A": motor.corriente_nominal * motor.corriente_arranque_rel,
            "rendimiento_pct": motor.rendimiento * 100,
        },
        "scooter": {
            "masa_total_kg": scooter.masa,
            "reduccion": scooter.reduccion,
            "par_rueda_Nm": motor.par_nominal * scooter.reduccion * scooter.rendimiento_transmision,
            "traccion_max_N": scooter.traccion(motor, 0),
            "velocidad_base_kmh": scooter.velocidad(motor.velocidad_nominal) * 3.6,
            "velocidad_punta_kmh": kmh(punta),
            "punta_rampa_5_kmh": kmh(velocidad_punta(motor, scooter, 0.05)),
            "punta_rampa_10_kmh": kmh(velocidad_punta(motor, scooter, 0.10)),
            "t_0_25_s": t25,
            "t_0_30_s": t30,
            "t_0_35_s": t35,
            "rampa_continua_pct": rampa_maxima(motor, scooter, 1.0),
            "rampa_puntual_pct": rampa_maxima(motor, scooter, motor.par_max_rel),
            "consumo_30": consumo(motor, scooter, 30),
            "consumo_40": consumo(motor, scooter, 40),
        },
        "aceleracion": [{"t": t, "kmh": v, "fuerza": f} for t, v, f in historia],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Prestaciones del motor y del scooter.")
    parser.add_argument("--json", action="store_true", help="volcar datos y curvas en JSON")
    args = parser.parse_args()

    motor, scooter = Motor(), Scooter()
    datos = informe(motor, scooter)

    if args.json:
        print(json.dumps({**datos, "curvas": curvas(motor, scooter),
                          "parametros": {"motor": asdict(motor), "scooter": asdict(scooter)}}))
        return

    m, v = datos["motor"], datos["scooter"]
    print("MAQUINA — asincrono trifasico 400 V / 50 Hz, 4 polos")
    print(f"  Potencia nominal .............. {m['potencia_W']:.0f} W")
    print(f"  Velocidad sincrona ............ {m['velocidad_sincrona_rpm']:.0f} min-1")
    print(f"  Velocidad a plena carga ....... {m['velocidad_nominal_rpm']:.0f} min-1"
          f"  (deslizamiento {m['deslizamiento_nominal_pct']:.1f} %)")
    print(f"  Par nominal ................... {m['par_nominal_Nm']:.2f} N·m")
    print(f"  Par de arranque ............... {m['par_arranque_Nm']:.2f} N·m"
          f"  ({motor.par_arranque_rel:.1f} x Tn)")
    print(f"  Par maximo (vuelco) ........... {m['par_maximo_Nm']:.2f} N·m"
          f"  ({motor.par_max_rel:.1f} x Tn, s = {m['deslizamiento_critico_pct']:.0f} %)")
    print(f"  Corriente nominal / arranque .. {m['corriente_nominal_A']:.2f} A"
          f" / {m['corriente_arranque_A']:.1f} A")
    print(f"  Rendimiento ................... {m['rendimiento_pct']:.0f} %")

    print("\nSCOOTER — motor con variador, reduccion "
          f"{v['reduccion']:.1f}:1, {v['masa_total_kg']:.0f} kg con conductor")
    print(f"  Par en la rueda ............... {v['par_rueda_Nm']:.0f} N·m"
          f"  ({v['traccion_max_N']:.0f} N de traccion)")
    print(f"  Velocidad base / punta ........ {v['velocidad_base_kmh']:.1f}"
          f" / {v['velocidad_punta_kmh']:.1f} km/h")
    rampa10 = (f"{v['punta_rampa_10_kmh']:.1f} km/h" if v["punta_rampa_10_kmh"]
               else "no la sube en continuo")
    print(f"  Punta en rampa 5 % ............ {v['punta_rampa_5_kmh']:.1f} km/h")
    print(f"  Punta en rampa 10 % ........... {rampa10}")
    print(f"  0-25 / 0-30 / 0-35 km/h ....... {v['t_0_25_s']:.1f} / {v['t_0_30_s']:.1f}"
          f" / {v['t_0_35_s']:.1f} s")
    print(f"  Rampa continua / puntual ...... {v['rampa_continua_pct']:.0f} %"
          f" / {v['rampa_puntual_pct']:.0f} %")
    for c in (v["consumo_30"], v["consumo_40"]):
        print(f"  A {c['velocidad_kmh']:.0f} km/h ................... "
              f"{c['potencia_bateria_W']:.0f} W  ·  {c['consumo_Wh_km']:.1f} Wh/km"
              f"  ·  {c['autonomia_km']:.0f} km con 960 Wh")


if __name__ == "__main__":
    main()
