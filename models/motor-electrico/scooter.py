#!/usr/bin/env python3
"""Geometria 3D del scooter que mueve el motor, y el escenario por el que circula.

Sistema de coordenadas de la escena (mm): X hacia delante, Y hacia arriba,
Z lateral. El motor de `motor.py` se monta sin girarlo: su eje ya es Z, que aqui
es justo la direccion transversal del vehiculo.

La transmision es real: el pinon Ø30 del motor y una corona Ø151.5 (z=99) en la
rueda trasera dan la reduccion 5.5:1 que usa la simulacion, unidas por una cadena
cuyas tangentes se calculan entre las dos circunferencias primitivas.
"""

from __future__ import annotations

import math
import os
import sys
from dataclasses import dataclass, field

import motor as mt
import solids as s

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engrane-30mm"))
import gear  # noqa: E402

# --- Cotas del vehiculo (mm) ---------------------------------------------------

RADIO_RUEDA = 220.0          # radio con cubierta, rueda de 10 pulgadas
RADIO_LLANTA = 140.0
EJE_TRASERO = (-600.0, RADIO_RUEDA)
EJE_DELANTERO = (600.0, RADIO_RUEDA)
EJE_MOTOR = (-330.0, 330.0)
PLANO_TRANSMISION = -108.0   # z del pinon y la corona
DIENTES_CORONA = 99          # 99/18 = 5.5


@dataclass
class Parte:
    """Un solido de la escena, con como se mueve al rodar el scooter."""

    nombre: str
    color: str
    triangulos: list = field(repr=False, default_factory=list)
    pivote: tuple[float, float] | None = None   # centro de giro en el plano XY
    factor_giro: float = 0.0                    # vueltas por vuelta de rueda
    arrastre: float = 0.0                       # periodo de repeticion al desfilar (mm)


# --- Piezas del scooter --------------------------------------------------------


def _barra(desde: tuple[float, float], hasta: tuple[float, float],
           grueso: float, z0: float, z1: float) -> list:
    """Barra recta entre dos puntos del plano XY, con seccion rectangular."""
    dx, dy = hasta[0] - desde[0], hasta[1] - desde[1]
    largo = math.hypot(dx, dy)
    barra = s.box(0, largo, -grueso / 2, grueso / 2, z0, z1)
    return s.translate(s.rotate_z(barra, math.atan2(dy, dx)), dx=desde[0], dy=desde[1])


def rueda(centro: tuple[float, float]) -> list:
    """Llanta, cubo y cinco radios. El eje de giro es Z, como el del motor."""
    llanta = s.tube(RADIO_LLANTA - 12, RADIO_LLANTA, -28, 28, 48)
    cubo = s.tube(14, 34, -45, 45, 24)
    radio = s.box(30, RADIO_LLANTA - 10, -9, 9, -7, 7)
    conjunto = llanta + cubo + s.polar(s.rotate_z(radio, 0), 5)
    # `polar` gira alrededor de Z, que es justo el eje de la rueda.
    return s.translate(conjunto, dx=centro[0], dy=centro[1])


def neumatico(centro: tuple[float, float]) -> list:
    """Cubierta de perfil redondeado."""
    perfil = [
        (RADIO_LLANTA - 4, -30), (RADIO_RUEDA - 12, -34), (RADIO_RUEDA, -18),
        (RADIO_RUEDA, 18), (RADIO_RUEDA - 12, 34), (RADIO_LLANTA - 4, 30),
    ]
    return s.translate(s.revolve(perfil, 48), dx=centro[0], dy=centro[1])


def corona() -> list:
    """Corona de 99 dientes calada en la rueda trasera."""
    especificacion = gear.GearSpec(module=1.5, teeth=DIENTES_CORONA, width=8, bore=40,
                                   flank_steps=4, arc_steps=3)
    disco = gear.build_mesh(especificacion)
    return s.translate(disco, dx=EJE_TRASERO[0], dy=EJE_TRASERO[1], dz=PLANO_TRANSMISION)


def cadena() -> list:
    """Los dos ramales rectos de la cadena, tangentes a las primitivas."""
    r1 = 1.5 * 18 / 2                    # primitiva del pinon
    r2 = 1.5 * DIENTES_CORONA / 2        # primitiva de la corona
    dx = EJE_TRASERO[0] - EJE_MOTOR[0]
    dy = EJE_TRASERO[1] - EJE_MOTOR[1]
    d = math.hypot(dx, dy)
    alfa = math.atan2(dy, dx)
    beta = math.asin((r2 - r1) / d)

    tramos = []
    for signo in (1, -1):
        theta = alfa + signo * (math.pi / 2 + signo * beta)
        p1 = (EJE_MOTOR[0] + r1 * math.cos(theta), EJE_MOTOR[1] + r1 * math.sin(theta))
        p2 = (EJE_TRASERO[0] + r2 * math.cos(theta), EJE_TRASERO[1] + r2 * math.sin(theta))
        tramos += _barra(p1, p2, 7, PLANO_TRANSMISION, PLANO_TRANSMISION + 8)
    return tramos


def chasis() -> list:
    """Plataforma, tubos, horquilla, manillar y tija."""
    plataforma = s.box(-500, 180, 118, 146, -140, 140)
    faldon = s.box(-500, 180, 96, 118, -120, 120)
    tunel = _barra((180, 132), (560, 430), 46, -55, 55)
    pipa = _barra((545, 400), (600, 640), 52, -40, 40)
    manillar = (_barra((600, 620), (588, 940), 34, -26, 26)
                + s.box(560, 600, 940, 972, -320, 320))
    puno = (s.box(555, 605, 936, 976, -320, -240) + s.box(555, 605, 936, 976, 240, 320))
    horquilla = (_barra((596, 620), (EJE_DELANTERO[0], EJE_DELANTERO[1]), 26, -70, -46)
                 + _barra((596, 620), (EJE_DELANTERO[0], EJE_DELANTERO[1]), 26, 46, 70))
    basculante = (_barra((-260, 200), EJE_TRASERO, 34, -78, -50)
                  + _barra((-260, 200), EJE_TRASERO, 34, 50, 78))
    soporte = _barra((-260, 210), EJE_MOTOR, 40, -30, 30)
    tija_asiento = _barra((-300, 140), (-330, 560), 44, -45, 45)
    return (plataforma + faldon + tunel + pipa + manillar + puno
            + horquilla + basculante + soporte + tija_asiento)


def asiento() -> list:
    perfil = [(-470, 556), (-120, 556), (-90, 580), (-110, 620), (-450, 620), (-480, 590)]
    return s.prism(perfil, -145, 145)


def bateria() -> list:
    """Bateria de 48 V bajo la plataforma, dentro del tunel."""
    return s.box(-190, 120, 150, 300, -110, 110)


def conductor() -> list:
    """Conductor esquematico: casco, tronco, brazos y piernas."""
    casco = s.translate(s.sphere(105, 20, 14), dx=-110, dy=1230)
    cuello = _barra((-150, 1075), (-115, 1145), 70, -50, 50)
    tronco = _barra((-330, 700), (-150, 1085), 165, -108, 108)
    cadera = s.box(-420, -230, 620, 720, -115, 115)
    brazo = _barra((-160, 1050), (580, 946), 46, 104, 150)
    brazo += _barra((-160, 1050), (580, 946), 46, -150, -104)
    muslo = _barra((-325, 655), (185, 560), 92, 58, 140)
    muslo += _barra((-325, 655), (185, 560), 92, -140, -58)
    pierna = _barra((190, 555), (120, 210), 78, 66, 136)
    pierna += _barra((190, 555), (120, 210), 78, -136, -66)
    pie = s.box(60, 210, 150, 200, 66, 136) + s.box(60, 210, 150, 200, -136, -66)
    return casco + cuello + tronco + cadera + brazo + muslo + pierna + pie


# --- Escenario -----------------------------------------------------------------

CALZADA = 12000.0     # largo del tramo modelado
MARCA_PASO = 3000.0   # separacion entre marcas viales
POSTE_PASO = 6000.0   # separacion entre postes


def calzada() -> list:
    asfalto = s.box(-CALZADA / 2, CALZADA / 2, -30, 0, -2600, 2600)
    bordillo = (s.box(-CALZADA / 2, CALZADA / 2, 0, 120, -2600, -2400)
                + s.box(-CALZADA / 2, CALZADA / 2, 0, 120, 2400, 2600))
    return asfalto + bordillo


def marcas() -> list:
    """Linea discontinua; se desplaza en bucle con el periodo MARCA_PASO."""
    trazo = s.box(-700, 700, 0.5, 3, -80, 80)
    return [t for i in range(int(CALZADA / MARCA_PASO) + 2)
            for t in s.translate(trazo, dx=-CALZADA / 2 + i * MARCA_PASO)]


def postes() -> list:
    """Balizas laterales, con el mismo truco de bucle."""
    baliza = (s.box(-60, 60, 0, 900, -60, 60) + s.box(-70, 70, 900, 980, -70, 70))
    fila = []
    for i in range(int(CALZADA / POSTE_PASO) + 2):
        x = -CALZADA / 2 + i * POSTE_PASO
        fila += s.translate(baliza, dx=x, dz=-2500) + s.translate(baliza, dx=x, dz=2500)
    return fila


# --- Escena completa -----------------------------------------------------------

COLORES = dict(
    llanta="#b6bec6", neumatico="#20262c", chasis="#2f4756", asiento="#1c242b",
    bateria="#3f5a2f", conductor="#c2542f", cadena="#8b939b", corona="#a8823f",
    asfalto="#3b4148", marca="#d8dde2", poste="#c9ced3",
)


def escena() -> list[Parte]:
    """Todas las piezas de la escena, con su forma de moverse."""
    partes = [
        Parte("Calzada", COLORES["asfalto"], calzada()),
        Parte("Marcas viales", COLORES["marca"], marcas(), arrastre=MARCA_PASO),
        Parte("Balizas", COLORES["poste"], postes(), arrastre=POSTE_PASO),
        Parte("Chasis", COLORES["chasis"], chasis()),
        Parte("Asiento", COLORES["asiento"], asiento()),
        Parte("Bateria 48 V", COLORES["bateria"], bateria()),
        Parte("Conductor", COLORES["conductor"], conductor()),
        Parte("Llanta trasera", COLORES["llanta"], rueda(EJE_TRASERO), EJE_TRASERO, 1.0),
        Parte("Neumatico trasero", COLORES["neumatico"], neumatico(EJE_TRASERO), EJE_TRASERO, 1.0),
        Parte("Llanta delantera", COLORES["llanta"], rueda(EJE_DELANTERO), EJE_DELANTERO, 1.0),
        Parte("Neumatico delantero", COLORES["neumatico"], neumatico(EJE_DELANTERO), EJE_DELANTERO, 1.0),
        Parte("Corona z=99", COLORES["corona"], corona(), EJE_TRASERO, 1.0),
        Parte("Cadena", COLORES["cadena"], cadena()),
    ]

    # El motor entra entero, con los colores de cada una de sus piezas. Solo el
    # pinon gira: 5.5 vueltas por vuelta de rueda y en el mismo sentido, porque
    # la transmision es por cadena (con engrane directo seria al reves).
    for pieza in mt.construir():
        gira = pieza.nombre.startswith("Pinon")
        partes.append(Parte(
            f"Motor · {pieza.nombre}",
            pieza.color,
            s.translate(pieza.triangulos, dx=EJE_MOTOR[0], dy=EJE_MOTOR[1]),
            EJE_MOTOR if gira else None,
            DIENTES_CORONA / 18 if gira else 0.0,
        ))
    return partes


if __name__ == "__main__":
    partes = escena()
    total = sum(len(p.triangulos) for p in partes)
    print(f"{'Parte':30s} {'Triangulos':>11s}  giro")
    print("-" * 56)
    for p in partes:
        giro = f"x{p.factor_giro:g}" if p.factor_giro else ("desfila" if p.arrastre else "")
        print(f"{p.nombre:30s} {len(p.triangulos):11,d}  {giro}")
    print("-" * 56)
    print(f"{'TOTAL':30s} {total:11,d}")
    (x0, y0, z0), (x1, y1, z1) = s.bounds([t for p in partes if "Calzada" not in p.nombre
                                           and "Baliza" not in p.nombre and "Marcas" not in p.nombre
                                           for t in p.triangulos])
    print(f"\nScooter: {x1 - x0:.0f} x {y1 - y0:.0f} x {z1 - z0:.0f} mm")
