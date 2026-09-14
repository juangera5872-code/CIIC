#!/usr/bin/env python3
"""Motor asincrono trifasico de jaula de ardilla, modelado pieza a pieza.

Tamano IEC 80 (0.75 kW, 4 polos, 1400 rpm): carcasa con aletas, estator de 24
ranuras con su bobinado, rotor de jaula de 28 barras, eje escalonado sobre dos
rodamientos 6204, ventilador con su cubierta, caja de bornes y un pinon de
salida (el engrane de 30 mm de `models/engrane-30mm`, con barreno de 19 mm).

El eje de la maquina es Z. El lado de salida (accionamiento) esta en -Z y el
lado del ventilador en +Z; la vertical es +Y.

Uso:
    python3 motor.py              # motor.stl + piezas/*.stl
    python3 motor.py --lista      # resumen de piezas, masas y cotas
"""

from __future__ import annotations

import argparse
import math
import os
import sys
from dataclasses import dataclass, field

import solids as s

# --- Cotas principales (mm) ----------------------------------------------------

ENTREHIERRO = 0.3

ESTATOR_DE, ESTATOR_DI, PAQUETE, RANURAS = 120.0, 70.0, 90.0, 24
YUGO_DI = 96.0                      # diametro interior de la corona del estator
ROTOR_DE = ESTATOR_DI - 2 * ENTREHIERRO
BARRAS, EJE_D = 28, 24.0

CARCASA_DI, CARCASA_DE, ALETA = 120.0, 132.0, 152.0
CARCASA_Z0, CARCASA_Z1 = -20.0, 110.0

RODAMIENTO = dict(d=20.0, D=47.0, B=14.0, bolas=8)   # 6204
ROD_DELANTERO_Z, ROD_TRASERO_Z = -32.0, 122.0

# Densidades (g/cm3) para estimar la masa de cada pieza.
DENSIDAD = {"acero": 7.85, "chapa": 7.65, "cobre": 8.9, "aluminio": 2.70, "polimero": 1.15}


@dataclass
class Pieza:
    """Una pieza del motor: geometria, material y a donde se separa al explotar."""

    nombre: str
    material: str
    densidad: str
    color: str
    explosion: tuple[float, float, float]
    nota: str
    triangulos: list = field(repr=False, default_factory=list)

    @property
    def masa(self) -> float:
        """Masa en gramos a partir del volumen encerrado."""
        return abs(s.volume(self.triangulos)) / 1000 * DENSIDAD[self.densidad]


# --- Piezas --------------------------------------------------------------------


def carcasa() -> list:
    """Carcasa con aletas de refrigeracion y patas de fijacion."""
    cuerpo = s.tube(CARCASA_DI / 2, CARCASA_DE / 2, CARCASA_Z0, CARCASA_Z1, 96)
    aleta = s.box(CARCASA_DE / 2 - 1, ALETA / 2, -1.6, 1.6, CARCASA_Z0 + 4, CARCASA_Z1 - 4)
    aletas = s.polar(aleta, 12, math.radians(15))
    pata = lambda z0, z1: s.box(-30, 30, -78, -62, z0, z1)
    return cuerpo + aletas + pata(-8, 14) + pata(76, 98)


def tapa(delantera: bool) -> list:
    """Escudo porta-rodamiento: cubo, disco y pestana de centrado."""
    r_alojamiento = RODAMIENTO["D"] / 2
    perfil = [
        (r_alojamiento, -45.0), (31.0, -45.0), (31.0, -28.0),
        (CARCASA_DE / 2, -28.0), (CARCASA_DE / 2, -20.0), (r_alojamiento, -20.0),
    ]
    if not delantera:  # se refleja respecto al centro del paquete
        perfil = [(r, PAQUETE - z) for r, z in perfil]
    return s.revolve(perfil, 96)


def estator() -> list:
    """Paquete de chapa: corona exterior mas 24 dientes de flancos paralelos."""
    corona = s.tube(YUGO_DI / 2, ESTATOR_DE / 2, 0, PAQUETE, 96)

    r_i, r_y = ESTATOR_DI / 2, YUGO_DI / 2
    zapata, cuello = 3.5, 2.5  # semianchos del pie del diente y del cuerpo
    perfil = (
        s.arc(r_i, -math.asin(zapata / r_i), math.asin(zapata / r_i), 6)
        + [(r_i + 2.5, zapata), (r_i + 4.0, cuello), (r_y, cuello),
           (r_y, -cuello), (r_i + 4.0, -cuello), (r_i + 2.5, -zapata)]
    )
    dientes = s.polar(s.prism(perfil, 0, PAQUETE), RANURAS)
    return corona + dientes


def bobinado() -> list:
    """Conductores alojados en las 24 ranuras mas las dos cabezas de bobina."""
    r_i, r_y = ESTATOR_DI / 2, YUGO_DI / 2
    paso = math.pi / RANURAS  # semipaso angular de ranura
    hueco = lambda r: r * math.sin(paso) - 2.9
    ranura = [
        (r_i + 4.5, -hueco(r_i + 4.5)), (r_y - 0.5, -hueco(r_y - 0.5)),
        (r_y - 0.5, hueco(r_y - 0.5)), (r_i + 4.5, hueco(r_i + 4.5)),
    ]
    conductores = s.polar(s.prism(ranura, 0, PAQUETE), RANURAS, math.radians(7.5))

    # Cabezas de bobina: toro de seccion elipsoidal en cada extremo del paquete.
    def cabeza(z: float) -> list:
        seccion = [
            (43 + 9.5 * math.cos(t), z + 11 * math.sin(t))
            for t in [2 * math.pi * i / 20 for i in range(20)]
        ]
        return s.revolve(seccion, 72)

    return conductores + cabeza(-11) + cabeza(PAQUETE + 11)


def rotor() -> list:
    """Paquete de chapa del rotor, calado sobre el eje."""
    return s.tube(EJE_D / 2, ROTOR_DE / 2, 0, PAQUETE, 96)


def jaula() -> list:
    """Jaula de ardilla: 28 barras inyectadas y sus dos anillos de cortocircuito."""
    barra = s.translate(s.cylinder(2.2, -11, PAQUETE + 11, 16), dx=30.6)
    anillos = s.tube(25, 33.5, -13, -3, 96) + s.tube(25, 33.5, PAQUETE + 3, PAQUETE + 13, 96)
    return s.polar(barra, BARRAS) + anillos


def eje() -> list:
    """Eje escalonado: salida Ø19, asientos de rodamiento Ø20, nucleo Ø24."""
    perfil = [
        (0, -112), (9.5, -112), (9.5, -45), (10, -45), (10, -20), (EJE_D / 2, -20),
        (EJE_D / 2, 102), (10, 102), (10, 132), (7, 132), (7, 160), (0, 160),
    ]
    return s.revolve(perfil, 96)


def rodamiento(centro: float) -> list:
    """Rodamiento rigido de bolas 6204: dos aros y ocho bolas."""
    b, d, D = RODAMIENTO["B"], RODAMIENTO["d"], RODAMIENTO["D"]
    z0, z1 = centro - b / 2, centro + b / 2
    aros = s.tube(d / 2, d / 2 + 2.5, z0, z1, 72) + s.tube(D / 2 - 2, D / 2, z0, z1, 72)
    bola = s.translate(s.sphere(4.4, 16, 10), dx=(d / 2 + D / 2) / 2, dz=centro)
    return aros + s.polar(bola, RODAMIENTO["bolas"])


def ventilador() -> list:
    """Ventilador de refrigeracion: cubo y ocho alabes inclinados 28°."""
    cubo = s.tube(7, 13, 135, 155, 48)
    alabe = s.box(12, 31, -1.2, 1.2, -8, 8)
    alabe = s.translate(s.rotate_x(alabe, math.radians(28)), dz=145)
    return cubo + s.polar(alabe, 8)


def cubierta() -> list:
    """Cubierta del ventilador (deflector de aire)."""
    return s.tube(32, 34, 133, 168, 72) + s.tube(10, 34, 168, 172, 72)


def caja_bornes() -> list:
    """Caja de bornes sobre la carcasa, con su tapa."""
    return s.box(-30, 30, 58, 88, 20, 72) + s.box(-33, 33, 88, 92, 17, 75)


def pinon() -> list:
    """Pinon de salida: el engrane de 30 mm reutilizado, con barreno de 19 mm."""
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engrane-30mm"))
    import gear

    especificacion = gear.GearSpec(module=1.5, teeth=18, width=8, bore=19)
    return s.translate(gear.build_mesh(especificacion), dz=-108)


def construir() -> list[Pieza]:
    """Devuelve todas las piezas del motor ya posicionadas en el montaje."""
    piezas = [
        Pieza("Carcasa", "Aluminio inyectado", "aluminio", "#4a5b68", (0, 215, 0),
              "Ø132 exterior, 12 aletas hasta Ø152, patas mecanizadas", carcasa()),
        Pieza("Escudo delantero", "Aluminio inyectado", "aluminio", "#56687a", (0, 0, -105),
              "Alojamiento del 6204 y pestana de centrado", tapa(True)),
        Pieza("Escudo trasero", "Aluminio inyectado", "aluminio", "#56687a", (0, 0, 105),
              "Alojamiento del 6204 lado ventilador", tapa(False)),
        Pieza("Estator", "Chapa magnetica M400-50A", "chapa", "#8a99a4", (0, 62, 0),
              f"{RANURAS} ranuras, Ø{ESTATOR_DE:g}/Ø{ESTATOR_DI:g}, paquete {PAQUETE:g} mm", estator()),
        Pieza("Bobinado", "Cobre esmaltado clase F", "cobre", "#b06a2c", (0, 140, 0),
              "Trifasico, 4 polos, conductores en ranura y cabezas de bobina", bobinado()),
        Pieza("Rotor", "Chapa magnetica M400-50A", "chapa", "#6d7883", (0, 0, 0),
              f"Ø{ROTOR_DE:g}, entrehierro {ENTREHIERRO:g} mm", rotor()),
        Pieza("Jaula de ardilla", "Aluminio inyectado", "aluminio", "#b9c2c8", (0, -95, 0),
              f"{BARRAS} barras y dos anillos de cortocircuito", jaula()),
        Pieza("Eje", "Acero C45 rectificado", "acero", "#98a2aa", (0, 0, -28),
              "Salida Ø19, asientos Ø20, nucleo Ø24", eje()),
        Pieza("Rodamiento delantero", "6204-2RS", "acero", "#7d858c", (0, 0, -68),
              "20 x 47 x 14, ocho bolas", rodamiento(ROD_DELANTERO_Z)),
        Pieza("Rodamiento trasero", "6204-2RS", "acero", "#7d858c", (0, 0, 68),
              "20 x 47 x 14, ocho bolas", rodamiento(ROD_TRASERO_Z)),
        Pieza("Ventilador", "Poliamida reforzada", "polimero", "#33393f", (0, 0, 150),
              "Ocho alabes inclinados 28°, bidireccional", ventilador()),
        Pieza("Cubierta del ventilador", "Chapa de acero", "acero", "#454d55", (0, 0, 195),
              "Deflector que canaliza el aire sobre las aletas", cubierta()),
        Pieza("Caja de bornes", "Aluminio inyectado", "aluminio", "#4a5b68", (0, 278, 0),
              "Placa de bornes de seis terminales", caja_bornes()),
        Pieza("Pinon de salida", "Acero cementado", "acero", "#a8823f", (0, 0, -155),
              "Engrane recto Ø30, m=1.5, z=18, barreno Ø19", pinon()),
    ]
    return piezas


def _archivo(nombre: str) -> str:
    """Nombre de archivo ASCII a partir del nombre de la pieza."""
    limpio = nombre.lower().translate(
        str.maketrans({"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ñ": "n", " ": "-"})
    )
    return limpio + ".stl"


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera el motor electrico en STL.")
    parser.add_argument("--salida", default="motor.stl", help="STL del conjunto")
    parser.add_argument("--piezas", default="piezas", help="carpeta para los STL individuales")
    parser.add_argument("--lista", action="store_true", help="solo mostrar el despiece")
    args = parser.parse_args()

    piezas = construir()
    total_tri = sum(len(p.triangulos) for p in piezas)
    total_masa = sum(p.masa for p in piezas)

    print(f"{'Pieza':26s} {'Material':30s} {'Triangulos':>11s} {'Masa':>9s}")
    print("-" * 80)
    for p in piezas:
        print(f"{p.nombre:26s} {p.material:30s} {len(p.triangulos):11,d} {p.masa:8.0f} g")
    print("-" * 80)
    print(f"{'CONJUNTO':26s} {len(piezas):>2d} piezas{'':21s} {total_tri:11,d} {total_masa:8.0f} g")

    if args.lista:
        return

    conjunto: list = []
    os.makedirs(args.piezas, exist_ok=True)
    for p in piezas:
        conjunto += p.triangulos
        s.write_stl(p.triangulos, os.path.join(args.piezas, _archivo(p.nombre)), p.nombre)
    s.write_stl(conjunto, args.salida, "motor-electrico")

    (x0, y0, z0), (x1, y1, z1) = s.bounds(conjunto)
    print(f"\nDimensiones del conjunto: {x1 - x0:.0f} x {y1 - y0:.0f} x {z1 - z0:.0f} mm")
    print(f"Conjunto: {args.salida}   Piezas sueltas: {args.piezas}/")


if __name__ == "__main__":
    main()
