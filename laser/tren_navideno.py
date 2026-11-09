#!/usr/bin/env python3
"""Tren navideño para cortar en MDF, placa de 1000 x 1000 mm.

Piezas (siluetas planas, se arman pegando/ensamblando con los acopladores):
  1 locomotora, 3 vagones, 5 arbolitos de carga, 14 ruedas, 4 estrellas,
  3 nubes de humo y 4 acopladores.

Genera:
  - G-code (dialecto tipo GRBL: M4/M5, S, F) -> --output
  - Vista previa SVG                         -> --svg

Reglas del recorrido:
  * Primero se cortan TODOS los huecos interiores de la placa y al final los
    contornos exteriores, para que las piezas no se muevan mientras se cortan
    los detalles.
  * Dentro de cada grupo, el orden minimiza los desplazamientos en vacío.
  * Por defecto es MODO SECO (láser apagado, solo recorre la trayectoria).
    Para emitir láser hay que pasar --armed y elegir --power y --feed a
    mano, tras una prueba de corte en un retazo del mismo MDF.

Origen de coordenadas: esquina inferior izquierda de la placa (X derecha,
Y hacia el fondo de la máquina). Fija el cero de trabajo ahí antes de correr.

Uso:
  python3 tren_navideno.py --svg preview.svg -o tren_seco.gcode
  python3 tren_navideno.py --armed --power 800 --feed 900 --passes 2 -o tren_corte.gcode
"""
import argparse
import math
import sys

MARGIN = 10.0   # mm libres en el borde de la placa
GAP = 10.0      # separación mínima entre piezas (mm)


# ---------------------------------------------------------------- geometría
def poly(pts):
    return ("poly", [tuple(p) for p in pts])


def circ(cx, cy, r):
    return ("circ", (cx, cy, r))


def bbox(path):
    kind, d = path
    if kind == "poly":
        xs = [p[0] for p in d]
        ys = [p[1] for p in d]
        return min(xs), min(ys), max(xs), max(ys)
    cx, cy, r = d
    return cx - r, cy - r, cx + r, cy + r


def rect(x0, y0, x1, y1):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])


def mirror_x(pts, w):
    return [(w - x, y) for x, y in pts]


# ------------------------------------------------------------------ piezas
def locomotora():
    outer = poly([
        (0, 20), (300, 20), (300, 110), (285, 110), (285, 160), (295, 160),
        (295, 180), (235, 180), (235, 160), (245, 160), (245, 110), (200, 110),
        (200, 130), (170, 130), (170, 110), (110, 110), (110, 190), (120, 190),
        (120, 200), (-10, 200), (-10, 190), (0, 190),
    ])
    inners = [
        rect(25, 110, 85, 170),          # ventana de la cabina
        circ(150, 70, 14),               # ojo de buey de la caldera
        circ(215, 70, 14),
        circ(265, 70, 14),
    ]
    return outer, inners


def vagon():
    outer = poly([
        (0, 20), (200, 20), (200, 110), (180, 110), (180, 90), (20, 90),
        (20, 110), (0, 110),
    ])
    inners = [circ(50, 55, 15), circ(100, 55, 15), circ(150, 55, 15)]
    return outer, inners


def arbolito():
    outer = poly([
        (40, 0), (60, 0), (60, 20), (100, 20), (70, 55), (85, 55), (65, 95),
        (78, 95), (50, 140), (22, 95), (35, 95), (15, 55), (30, 55), (0, 20),
        (40, 20),
    ])
    return outer, [circ(50, 62, 5)]      # adorno


def rueda():
    return circ(25, 25, 25), [circ(25, 25, 4)]


def estrella():
    pts = []
    for i in range(10):
        r = 40 if i % 2 == 0 else 16
        a = math.pi / 2 + i * math.pi / 5
        pts.append((40 + r * math.cos(a), 40 + r * math.sin(a)))
    return poly(pts), [circ(40, 40, 4)]


def nube(d):
    return lambda: (circ(d / 2, d / 2, d / 2), [])


def acoplador():
    return rect(0, 0, 50, 14), [circ(7, 7, 3), circ(43, 7, 3)]


def layout():
    """(nombre, constructor, x, y) con (x, y) = esquina inferior izquierda."""
    items = [
        ("locomotora", locomotora, 20, 20),
        ("vagon1", vagon, 350, 20),
        ("vagon2", vagon, 570, 20),
        ("vagon3", vagon, 790, 20),
    ]
    for i in range(5):
        items.append((f"arbol{i + 1}", arbolito, 350 + i * 120, 140))
    for i in range(14):
        items.append((f"rueda{i + 1}", rueda, 20 + i * 70, 320))
    for i in range(4):
        items.append((f"estrella{i + 1}", estrella, 20 + i * 100, 400))
    for i, d in enumerate((40, 55, 70)):
        items.append((f"nube{i + 1}", nube(d), 450 + i * 90, 400))
    for i in range(4):
        items.append((f"acoplador{i + 1}", acoplador, 730 + i * 65, 400))
    return items


def build(area_x, area_y):
    """Devuelve lista de piezas ya posicionadas: dicts con outer/inners
    trasladados a coordenadas de placa. Valida límites y colisiones."""
    parts = []
    for name, ctor, px, py in layout():
        outer, inners = ctor()
        x0, y0, _, _ = bbox(outer)
        dx, dy = px - x0, py - y0
        outer = shift(outer, dx, dy)
        inners = [shift(p, dx, dy) for p in inners]
        parts.append({"name": name, "outer": outer, "inners": inners})

    for p in parts:
        x0, y0, x1, y1 = bbox(p["outer"])
        if x0 < MARGIN or y0 < MARGIN or x1 > area_x - MARGIN or y1 > area_y - MARGIN:
            sys.exit(f"{p['name']} sale del área útil ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})")
        for q in p["inners"]:
            a0, b0, a1, b1 = bbox(q)
            if a0 < x0 + 3 or b0 < y0 + 3 or a1 > x1 - 3 or b1 > y1 - 3:
                sys.exit(f"Hueco de {p['name']} demasiado cerca del borde de la pieza")
    for i, p in enumerate(parts):
        a = bbox(p["outer"])
        for q in parts[i + 1:]:
            b = bbox(q["outer"])
            if not (a[2] + GAP <= b[0] or b[2] + GAP <= a[0]
                    or a[3] + GAP <= b[1] or b[3] + GAP <= a[1]):
                sys.exit(f"{p['name']} y {q['name']} están a menos de {GAP:.0f} mm")
    return parts


def shift(path, dx, dy):
    kind, d = path
    if kind == "poly":
        return ("poly", [(x + dx, y + dy) for x, y in d])
    cx, cy, r = d
    return ("circ", (cx + dx, cy + dy, r))


# ---------------------------------------------------------------- recorrido
def start_point(path):
    kind, d = path
    return d[0] if kind == "poly" else (d[0] + d[2], d[1])


def length(path):
    kind, d = path
    if kind == "circ":
        return 2 * math.pi * d[2]
    return sum(math.dist(d[i], d[(i + 1) % len(d)]) for i in range(len(d)))


def order(paths):
    """Vecino más cercano a partir del origen."""
    left = list(paths)
    cur = (0.0, 0.0)
    out = []
    while left:
        nxt = min(left, key=lambda p: math.dist(cur, start_point(p)))
        left.remove(nxt)
        out.append(nxt)
        cur = start_point(nxt)
    return out


def gcode(parts, args):
    inner = order([q for p in parts for q in p["inners"]])
    outer = order([p["outer"] for p in parts])
    modo = "ARMADO (emite láser)" if args.armed else "SECO (láser apagado)"
    out = [
        f"; Tren navideno MDF - modo {modo}",
        f"; Placa {args.area_x:.0f} x {args.area_y:.0f} mm, origen abajo-izquierda",
        "G21 ; mm",
        "G90 ; absoluto",
        "M5  ; laser apagado",
        "G0 X0 Y0",
    ]
    total_cut = 0.0
    for etapa, paths in (("HUECOS INTERIORES", inner), ("CONTORNOS EXTERIORES", outer)):
        out.append(f"; ===== {etapa} =====")
        for path in paths:
            total_cut += length(path) * args.passes
            for n in range(args.passes):
                out += trace(path, args, n + 1)
    out += ["M5", "G0 X0 Y0", "M2"]
    return out, total_cut


def on(args):
    if not args.armed:
        return []
    ln = [f"M4 S{args.power}"]
    if args.pierce > 0:
        ln.append(f"G4 P{args.pierce}")
    return ln


def trace(path, args, n):
    kind, d = path
    sx, sy = start_point(path)
    out = [f"G0 X{sx:.3f} Y{sy:.3f}"] + on(args)
    if kind == "poly":
        pts = d[1:] + [d[0]]
        out.append(f"G1 X{pts[0][0]:.3f} Y{pts[0][1]:.3f} F{args.feed}")
        out += [f"G1 X{x:.3f} Y{y:.3f}" for x, y in pts[1:]]
    else:
        cx, cy, r = d
        out.append(f"G3 X{sx:.3f} Y{sy:.3f} I{-r:.3f} J0 F{args.feed}")   # antihorario
    out.append("M5")
    return out


# ------------------------------------------------------------------ vista previa
def svg(parts, args):
    W, H = args.area_x, args.area_y

    def d_of(path):
        kind, d = path
        if kind == "poly":
            pts = " ".join(f"{x:.2f},{H - y:.2f}" for x, y in d)
            return f'<polygon points="{pts}"'
        cx, cy, r = d
        return f'<circle cx="{cx:.2f}" cy="{H - cy:.2f}" r="{r:.2f}"'

    el = [f'<rect width="{W}" height="{H}" fill="#f4ead5" stroke="#555" stroke-width="2"/>']
    for p in parts:
        el.append(d_of(p["outer"]) + ' fill="#c8a165" stroke="#000" stroke-width="1.5"/>')
        for q in p["inners"]:
            el.append(d_of(q) + ' fill="#f4ead5" stroke="#d00" stroke-width="1.5"/>')
        x0, y0, x1, y1 = bbox(p["outer"])
        el.append(f'<text x="{(x0 + x1) / 2:.0f}" y="{H - (y0 + y1) / 2:.0f}" font-size="14" '
                  f'text-anchor="middle" fill="#222" font-family="sans-serif">{p["name"]}</text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" '
            f'width="800" height="800">\n' + "\n".join(el) + "\n</svg>\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-o", "--output", help="archivo G-code de salida")
    ap.add_argument("--svg", help="vista previa SVG")
    ap.add_argument("--area-x", type=float, default=1000.0)
    ap.add_argument("--area-y", type=float, default=1000.0)
    ap.add_argument("--armed", action="store_true", help="emitir láser")
    ap.add_argument("--power", type=int, help="S (0-1000). Obligatorio con --armed")
    ap.add_argument("--feed", type=int, default=1200, help="mm/min")
    ap.add_argument("--passes", type=int, default=1)
    ap.add_argument("--pierce", type=float, default=0.3, help="segundos de perforación (solo armado)")
    args = ap.parse_args()

    if args.armed and args.power is None:
        sys.exit("--armed requiere --power (calibra con una prueba en un retazo)")
    if args.power is not None and not 0 <= args.power <= 1000:
        sys.exit("--power fuera de rango (0-1000)")
    if not 1 <= args.passes <= 10 or not 1 <= args.feed <= 6000:
        sys.exit("--passes (1-10) o --feed (1-6000) fuera de rango")

    parts = build(args.area_x, args.area_y)
    lines, total_cut = gcode(parts, args)

    if args.svg:
        with open(args.svg, "w") as f:
            f.write(svg(parts, args))
    if args.output:
        with open(args.output, "w") as f:
            f.write("\n".join(lines) + "\n")
    n_inner = sum(len(p["inners"]) for p in parts)
    print(f"{len(parts)} piezas, {n_inner} huecos, {len(lines)} líneas de G-code")
    print(f"Longitud de corte: {total_cut / 1000:.1f} m (x{args.passes} pasadas)"
          f" ~ {total_cut / args.feed:.0f} min a {args.feed} mm/min (sin contar desplazamientos)")


if __name__ == "__main__":
    main()
