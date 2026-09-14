#!/usr/bin/env python3
"""Primitivas solidas para modelar el motor: revoluciones, prismas y esferas.

Todo se representa como listas de triangulos (sopa de triangulos) con normales
hacia afuera. Cada primitiva genera por si sola un solido cerrado; una pieza del
motor puede estar formada por varios solidos (por ejemplo el estator: la corona
mas sus 24 dientes), lo cual es valido tanto para STL como para el visor.

Convenio: el eje de revolucion es Z y los perfiles se dan como puntos (r, z)
recorridos en sentido antihorario en el semiplano r >= 0.
"""

from __future__ import annotations

import math
import struct

Vec3 = tuple[float, float, float]
Tri = tuple[Vec3, Vec3, Vec3]
Point = tuple[float, float]

TAU = 2 * math.pi
EPS = 1e-12


# --- Poligonos -----------------------------------------------------------------


def signed_area(polygon: list[Point]) -> float:
    return sum(
        polygon[i][0] * polygon[(i + 1) % len(polygon)][1]
        - polygon[(i + 1) % len(polygon)][0] * polygon[i][1]
        for i in range(len(polygon))
    ) / 2


def ccw(polygon: list[Point]) -> list[Point]:
    """Devuelve el poligono en sentido antihorario."""
    return polygon if signed_area(polygon) > 0 else polygon[::-1]


# --- Revolucion ----------------------------------------------------------------


def revolve(profile: list[Point], segments: int = 72) -> list[Tri]:
    """Revoluciona un perfil cerrado (r, z) alrededor del eje Z.

    Los puntos con r = 0 colapsan sobre el eje y su cuadrilatero degenera en un
    triangulo, de modo que solidos macizos (ejes, tapones) quedan cerrados.
    """
    profile = ccw(profile)  # el perfil marca hacia afuera al girar en Z
    n = len(profile)
    tris: list[Tri] = []
    for k in range(segments):
        c0, s0 = math.cos(TAU * k / segments), math.sin(TAU * k / segments)
        c1, s1 = math.cos(TAU * (k + 1) / segments), math.sin(TAU * (k + 1) / segments)
        for i in range(n):
            r0, z0 = profile[i]
            r1, z1 = profile[(i + 1) % n]
            if r0 <= EPS and r1 <= EPS:
                continue
            p00, p01 = (r0 * c0, r0 * s0, z0), (r0 * c1, r0 * s1, z0)
            p10, p11 = (r1 * c0, r1 * s0, z1), (r1 * c1, r1 * s1, z1)
            if r0 <= EPS:
                tris.append((p00, p11, p10))
            elif r1 <= EPS:
                tris.append((p00, p01, p11))
            else:
                tris.append((p00, p01, p11))
                tris.append((p00, p11, p10))
    return tris


def tube(r_in: float, r_out: float, z0: float, z1: float, segments: int = 72) -> list[Tri]:
    """Anillo cilindrico hueco."""
    return revolve([(r_in, z0), (r_out, z0), (r_out, z1), (r_in, z1)], segments)


def cylinder(radius: float, z0: float, z1: float, segments: int = 72) -> list[Tri]:
    """Cilindro macizo."""
    return revolve([(0.0, z0), (radius, z0), (radius, z1), (0.0, z1)], segments)


def sphere(radius: float, meridians: int = 24, parallels: int = 16) -> list[Tri]:
    """Esfera centrada en el origen (para los elementos rodantes)."""
    profile: list[Point] = []
    for i in range(parallels + 1):
        t = -math.pi / 2 + math.pi * i / parallels
        profile.append((radius * math.cos(t), radius * math.sin(t)))
    # El perfil ya recorre de polo a polo; se cierra por el eje.
    return revolve(profile, meridians)


# --- Prismas -------------------------------------------------------------------


def prism(polygon: list[Point], z0: float, z1: float) -> list[Tri]:
    """Extruye un poligono estrellado respecto a su centroide entre z0 y z1."""
    poly = ccw(polygon)
    n = len(poly)
    cx = sum(p[0] for p in poly) / n
    cy = sum(p[1] for p in poly) / n

    tris: list[Tri] = []
    for i in range(n):
        (ax, ay), (bx, by) = poly[i], poly[(i + 1) % n]
        tris.append(((ax, ay, z0), (bx, by, z0), (bx, by, z1)))
        tris.append(((ax, ay, z0), (bx, by, z1), (ax, ay, z1)))
        tris.append(((cx, cy, z1), (ax, ay, z1), (bx, by, z1)))
        tris.append(((cx, cy, z0), (bx, by, z0), (ax, ay, z0)))
    return tris


def box(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float) -> list[Tri]:
    return prism([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z0, z1)


def arc(radius: float, a0: float, a1: float, steps: int) -> list[Point]:
    """Puntos de un arco de circunferencia centrado en el origen."""
    return [
        (radius * math.cos(a0 + (a1 - a0) * i / steps), radius * math.sin(a0 + (a1 - a0) * i / steps))
        for i in range(steps + 1)
    ]


# --- Transformaciones ----------------------------------------------------------


def translate(tris: list[Tri], dx: float = 0, dy: float = 0, dz: float = 0) -> list[Tri]:
    return [tuple((x + dx, y + dy, z + dz) for x, y, z in t) for t in tris]  # type: ignore[misc]


def rotate_z(tris: list[Tri], angle: float) -> list[Tri]:
    c, s = math.cos(angle), math.sin(angle)
    return [tuple((x * c - y * s, x * s + y * c, z) for x, y, z in t) for t in tris]  # type: ignore[misc]


def rotate_x(tris: list[Tri], angle: float) -> list[Tri]:
    c, s = math.cos(angle), math.sin(angle)
    return [tuple((x, y * c - z * s, y * s + z * c) for x, y, z in t) for t in tris]  # type: ignore[misc]


def polar(tris: list[Tri], count: int, offset: float = 0.0) -> list[Tri]:
    """Repite un solido en un patron polar alrededor del eje Z."""
    out: list[Tri] = []
    for i in range(count):
        out += rotate_z(tris, offset + TAU * i / count)
    return out


# --- Salida --------------------------------------------------------------------


def bounds(tris: list[Tri]) -> tuple[Vec3, Vec3]:
    xs = [v[0] for t in tris for v in t]
    ys = [v[1] for t in tris for v in t]
    zs = [v[2] for t in tris for v in t]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def volume(tris: list[Tri]) -> float:
    """Volumen encerrado (mm3); util como comprobacion de cierre y de masa."""
    total = 0.0
    for a, b, c in tris:
        total += (
            a[0] * (b[1] * c[2] - c[1] * b[2])
            - a[1] * (b[0] * c[2] - c[0] * b[2])
            + a[2] * (b[0] * c[1] - c[0] * b[1])
        ) / 6
    return total


def write_stl(tris: list[Tri], path: str, name: str = "pieza") -> None:
    """Escribe la geometria como STL binario."""
    with open(path, "wb") as fh:
        fh.write(name.encode("ascii", "ignore")[:80].ljust(80, b"\0"))
        fh.write(struct.pack("<I", len(tris)))
        for a, b, c in tris:
            ux, uy, uz = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
            vx, vy, vz = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
            nx, ny, nz = (uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
            length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            fh.write(struct.pack("<3f", nx / length, ny / length, nz / length))
            for vertex in (a, b, c):
                fh.write(struct.pack("<3f", *vertex))
            fh.write(struct.pack("<H", 0))
