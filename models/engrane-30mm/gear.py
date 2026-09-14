#!/usr/bin/env python3
"""Generador parametrico de engranes rectos (spur gears) con perfil de evolvente.

Construye la geometria 3D de un engrane recto y la exporta como STL binario
(malla cerrada, lista para impresion 3D o visualizacion).

Perfil de cada diente:
    arco de raiz -> filete -> flanco de evolvente -> arco de cabeza ->
    flanco de evolvente (espejo) -> filete (espejo)

Uso:
    python3 gear.py                       # engrane por defecto (Ø exterior 30 mm)
    python3 gear.py --modulo 1 --dientes 28 --ancho 6 --salida otro.stl
"""

from __future__ import annotations

import argparse
import math
import struct
from dataclasses import dataclass

Point = tuple[float, float]


@dataclass
class GearSpec:
    """Parametros normalizados de un engrane recto (ISO 53, perfil normal)."""

    module: float = 1.5           # modulo m [mm]
    teeth: int = 18               # numero de dientes z
    pressure_angle: float = 20.0  # angulo de presion alpha [grados]
    width: float = 8.0            # ancho de cara b [mm]
    bore: float = 5.0             # diametro del barreno [mm]
    backlash: float = 0.0         # juego circunferencial en el diametro primitivo [mm]
    addendum_coef: float = 1.0    # ha* (cabeza = ha* . m)
    dedendum_coef: float = 1.25   # hf* (raiz = hf* . m)
    fillet_coef: float = 0.38     # radio de filete de raiz = rho* . m
    flank_steps: int = 24         # resolucion del flanco de evolvente
    arc_steps: int = 8            # resolucion de arcos (cabeza, raiz, filete)
    bore_steps: int = 96          # resolucion minima del barreno

    # --- Dimensiones derivadas -------------------------------------------------

    @property
    def pitch_radius(self) -> float:
        """Radio primitivo r = m . z / 2."""
        return self.module * self.teeth / 2.0

    @property
    def base_radius(self) -> float:
        """Radio base rb = r . cos(alpha)."""
        return self.pitch_radius * math.cos(math.radians(self.pressure_angle))

    @property
    def tip_radius(self) -> float:
        """Radio de cabeza ra = r + ha* . m."""
        return self.pitch_radius + self.addendum_coef * self.module

    @property
    def root_radius(self) -> float:
        """Radio de raiz rf = r - hf* . m."""
        return self.pitch_radius - self.dedendum_coef * self.module

    @property
    def fillet_radius(self) -> float:
        return self.fillet_coef * self.module

    def describe(self) -> str:
        return "\n".join(
            [
                f"  Modulo (m).................. {self.module:g} mm",
                f"  Numero de dientes (z)....... {self.teeth}",
                f"  Angulo de presion (alpha)... {self.pressure_angle:g}°",
                f"  Diametro primitivo (d)...... {2 * self.pitch_radius:.3f} mm",
                f"  Diametro exterior (da)...... {2 * self.tip_radius:.3f} mm",
                f"  Diametro de raiz (df)....... {2 * self.root_radius:.3f} mm",
                f"  Diametro base (db).......... {2 * self.base_radius:.3f} mm",
                f"  Paso circular (p = pi.m).... {math.pi * self.module:.3f} mm",
                f"  Ancho de cara (b)........... {self.width:g} mm",
                f"  Barreno (Ø)................. {self.bore:g} mm",
            ]
        )


# --- Geometria 2D --------------------------------------------------------------


def involute_point(base_radius: float, roll: float) -> Point:
    """Punto de la evolvente del circulo base para el angulo de rodadura `roll`."""
    return (
        base_radius * (math.cos(roll) + roll * math.sin(roll)),
        base_radius * (math.sin(roll) - roll * math.cos(roll)),
    )


def involute_roll_at_radius(base_radius: float, radius: float) -> float:
    """Angulo de rodadura de la evolvente que alcanza el radio dado."""
    ratio = max(radius / base_radius, 1.0)
    return math.sqrt(ratio * ratio - 1.0)


def rotate(p: Point, angle: float) -> Point:
    c, s = math.cos(angle), math.sin(angle)
    return (p[0] * c - p[1] * s, p[0] * s + p[1] * c)


def _flank(spec: GearSpec) -> list[Point]:
    """Flanco derecho de un diente, del radio menor al radio de cabeza.

    El diente queda centrado en el angulo 0: el espesor circular en el diametro
    primitivo es pi.m/2 menos el juego especificado.
    """
    rb = spec.base_radius
    alpha = math.radians(spec.pressure_angle)
    inv_alpha = math.tan(alpha) - alpha

    # Semiangulo del diente sobre el circulo base.
    half_tooth = math.pi / (2 * spec.teeth) - spec.backlash / (2 * 2 * spec.pitch_radius)
    half_base = half_tooth + inv_alpha

    start_radius = max(rb, spec.root_radius)
    roll_start = involute_roll_at_radius(rb, start_radius)
    roll_end = involute_roll_at_radius(rb, spec.tip_radius)

    points: list[Point] = []

    # Si la raiz queda por debajo del circulo base, se prolonga radialmente:
    # la evolvente no existe ahi y el filete se apoya sobre este tramo.
    if spec.root_radius < rb:
        for i in range(spec.arc_steps):
            t = i / spec.arc_steps
            radius = spec.root_radius + (rb - spec.root_radius) * t
            points.append(rotate((radius, 0.0), half_base))

    for i in range(spec.flank_steps + 1):
        roll = roll_start + (roll_end - roll_start) * i / spec.flank_steps
        x, y = involute_point(rb, roll)
        # La evolvente nace en el angulo 0 y avanza en sentido antihorario; se
        # invierte y se gira a half_base para que el diente se adelgace hacia la
        # cabeza (espesor pi.m/2 en el diametro primitivo).
        points.append(rotate((x, -y), half_base))

    # Flanco derecho: espejo del izquierdo respecto al eje del diente (y = 0).
    return [(x, -y) for x, y in points]


def _root_side(spec: GearSpec, flank: list[Point]) -> list[Point]:
    """Flanco derecho con su filete de raiz, del circulo de raiz a la cabeza.

    El filete es el arco de radio rho tangente al circulo de raiz y al flanco;
    su centro se localiza por biseccion sobre el angulo polar del centro.
    """
    rho = spec.fillet_radius
    if rho <= 1e-9:
        return list(flank)

    center_radius = spec.root_radius + rho

    def clearance(angle: float) -> float:
        """Distancia minima centro-flanco menos rho (negativa = el arco invade)."""
        cx, cy = center_radius * math.cos(angle), center_radius * math.sin(angle)
        return min(math.hypot(px - cx, py - cy) for px, py in flank) - rho

    # El centro se busca girando desde el flanco hacia el hueco entre dientes,
    # que en este lado (y < 0) queda en angulos mas negativos.
    lo = math.atan2(flank[0][1], flank[0][0])
    hi = lo - math.pi / spec.teeth
    if clearance(hi) < 0:  # no cabe el filete pedido
        return list(flank)
    for _ in range(60):
        mid = (lo + hi) / 2
        if clearance(mid) < 0:
            lo = mid
        else:
            hi = mid

    cx = center_radius * math.cos(hi)
    cy = center_radius * math.sin(hi)

    # Tangencia con el flanco y con el circulo de raiz (esta ultima sobre la
    # recta centro-origen). El flanco se recorta por debajo de la tangencia.
    touch = min(range(len(flank)), key=lambda i: math.hypot(flank[i][0] - cx, flank[i][1] - cy))
    end = math.atan2(flank[touch][1] - cy, flank[touch][0] - cx)
    start = math.atan2(-cy, -cx)
    sweep = (end - start + math.pi) % (2 * math.pi) - math.pi

    arc = [
        (cx + rho * math.cos(start + sweep * i / spec.arc_steps),
         cy + rho * math.sin(start + sweep * i / spec.arc_steps))
        for i in range(spec.arc_steps)
    ]
    return arc + flank[touch:]


def tooth_profile(spec: GearSpec) -> list[Point]:
    """Perfil de un diente completo, en orden de angulo polar creciente."""
    right = _root_side(spec, _flank(spec))  # del circulo de raiz a la cabeza (y < 0)

    # Cabeza: arco entre las puntas de ambos flancos.
    tip_angle = math.atan2(right[-1][1], right[-1][0])
    crest = [
        (spec.tip_radius * math.cos(tip_angle + 2 * abs(tip_angle) * i / spec.arc_steps),
         spec.tip_radius * math.sin(tip_angle + 2 * abs(tip_angle) * i / spec.arc_steps))
        for i in range(1, spec.arc_steps)
    ]

    left = [(x, -y) for x, y in reversed(right)]
    return right + crest + left


def gear_outline(spec: GearSpec) -> list[Point]:
    """Contorno exterior cerrado del engrane (angulo polar estrictamente creciente)."""
    tooth = tooth_profile(spec)
    pitch_angle = 2 * math.pi / spec.teeth
    outline: list[Point] = []
    for i in range(spec.teeth):
        angle = i * pitch_angle
        outline.extend(rotate(p, angle) for p in tooth)

        # Arco del fondo del hueco hasta el siguiente diente.
        start = math.atan2(outline[-1][1], outline[-1][0])
        nxt = rotate(tooth[0], angle + pitch_angle)
        end = math.atan2(nxt[1], nxt[0])
        sweep = (end - start) % (2 * math.pi)
        if sweep > 1e-9:
            outline.extend(
                (spec.root_radius * math.cos(start + sweep * k / spec.arc_steps),
                 spec.root_radius * math.sin(start + sweep * k / spec.arc_steps))
                for k in range(1, spec.arc_steps)
            )
    return outline


# --- Malla 3D ------------------------------------------------------------------

Vec3 = tuple[float, float, float]
Triangle = tuple[Vec3, Vec3, Vec3]


def _annulus(outer: list[Point], inner: list[Point], base: float) -> list[tuple[int, int, int]]:
    """Triangula la corona entre dos anillos convexos-radiales de distinto tamaño.

    Avanza en cremallera por angulo polar (indices negativos = anillo interior),
    de modo que ningun triangulo degenera en astilla aunque el contorno exterior
    tenga muchos mas puntos que el barreno.
    """
    n, m = len(outer), len(inner)
    two_pi = 2 * math.pi
    # Angulo acumulado desde el primer punto: los tramos radiales del perfil
    # repiten angulo y el redondeo los devolveria como ~2*pi en vez de ~0, asi
    # que se avanza por incrementos y se descartan los retrocesos numericos.
    ang_out = [0.0]
    previous = base
    for x, y in outer[1:]:
        raw = math.atan2(y, x)
        step = (raw - previous + math.pi) % two_pi - math.pi
        ang_out.append(min(ang_out[-1] + max(step, 0.0), two_pi))
        previous = raw
    ang_out.append(two_pi)
    ang_in = [two_pi * k / m for k in range(m + 1)]

    faces: list[tuple[int, int, int]] = []
    i = j = 0
    while i < n or j < m:
        if j >= m or (i < n and ang_out[i + 1] <= ang_in[j + 1]):
            faces.append((i, (i + 1) % n, -1 - j % m))
            i += 1
        else:
            faces.append((i % n, -1 - (j + 1) % m, -1 - j % m))
            j += 1
    return faces


def build_mesh(spec: GearSpec) -> list[Triangle]:
    """Malla cerrada del engrane extruido, con barreno central pasante."""
    outer = gear_outline(spec)
    n = len(outer)
    z0, z1 = 0.0, spec.width
    r_bore = spec.bore / 2.0

    # El barreno se muestrea de forma uniforme y arranca en el mismo angulo que
    # el contorno, para que la cremallera recorra ambos anillos en paralelo.
    base = math.atan2(outer[0][1], outer[0][0])
    m = max(spec.bore_steps, 24)
    inner = [
        (r_bore * math.cos(base + 2 * math.pi * k / m), r_bore * math.sin(base + 2 * math.pi * k / m))
        for k in range(m)
    ]

    tris: list[Triangle] = []

    def quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3) -> None:
        tris.append((a, b, c))
        tris.append((a, c, d))

    # Pared exterior (normal hacia afuera).
    for i in range(n):
        (ox, oy), (px, py) = outer[i], outer[(i + 1) % n]
        quad((ox, oy, z0), (px, py, z0), (px, py, z1), (ox, oy, z1))

    # Pared del barreno (normal hacia el eje).
    for k in range(m):
        (ix, iy), (jx, jy) = inner[k], inner[(k + 1) % m]
        quad((ix, iy, z0), (ix, iy, z1), (jx, jy, z1), (jx, jy, z0))

    # Caras superior (+Z) e inferior (-Z).
    for a, b, c in _annulus(outer, inner, base):
        pts = [outer[k] if k >= 0 else inner[-1 - k] for k in (a, b, c)]
        (ax, ay), (bx, by), (cx, cy) = pts
        tris.append(((ax, ay, z1), (bx, by, z1), (cx, cy, z1)))
        tris.append(((ax, ay, z0), (cx, cy, z0), (bx, by, z0)))

    return tris


def write_stl(triangles: list[Triangle], path: str, name: str = "engrane") -> None:
    """Escribe la malla como STL binario."""
    with open(path, "wb") as fh:
        fh.write(name.encode("ascii", "ignore")[:80].ljust(80, b"\0"))
        fh.write(struct.pack("<I", len(triangles)))
        for a, b, c in triangles:
            ux, uy, uz = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
            vx, vy, vz = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
            nx, ny, nz = (uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
            length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            fh.write(struct.pack("<3f", nx / length, ny / length, nz / length))
            for vertex in (a, b, c):
                fh.write(struct.pack("<3f", *vertex))
            fh.write(struct.pack("<H", 0))


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera un engrane recto en STL.")
    parser.add_argument("--modulo", type=float, default=1.5, help="modulo m en mm")
    parser.add_argument("--dientes", type=int, default=18, help="numero de dientes z")
    parser.add_argument("--angulo", type=float, default=20.0, help="angulo de presion en grados")
    parser.add_argument("--ancho", type=float, default=8.0, help="ancho de cara en mm")
    parser.add_argument("--barreno", type=float, default=5.0, help="diametro del barreno en mm")
    parser.add_argument("--juego", type=float, default=0.0, help="juego circunferencial en mm")
    parser.add_argument("--salida", default="engrane-30mm.stl", help="archivo STL de salida")
    args = parser.parse_args()

    spec = GearSpec(
        module=args.modulo,
        teeth=args.dientes,
        pressure_angle=args.angulo,
        width=args.ancho,
        bore=args.barreno,
        backlash=args.juego,
    )
    triangles = build_mesh(spec)
    write_stl(triangles, args.salida)

    print("Engrane recto generado")
    print(spec.describe())
    print(f"  Triangulos.................. {len(triangles)}")
    print(f"  Archivo..................... {args.salida}")


if __name__ == "__main__":
    main()
