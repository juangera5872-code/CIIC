#!/usr/bin/env python3
"""Generador de G-code para láser (dialecto tipo GRBL: M3/M4/M5, S, F).

Formas: rectángulo y círculo. Por defecto genera en MODO SECO (dry-run):
los movimientos se hacen con el láser apagado (M5, sin comandos S).
Para emitir potencia hay que pasar --armed explícitamente.

Uso:
  python3 laser_gcode.py rect --w 50 --h 30 -o rect.gcode
  python3 laser_gcode.py circle --d 40 --power 300 --feed 600 --passes 2 --armed -o c.gcode
  python3 laser_gcode.py rect --w 50 --h 30 --send /dev/ttyUSB0   # envío (pide confirmación)

IMPORTANTE: ajusta límites a TU máquina. Verifica el código en un simulador
antes de ejecutarlo. Los paros de emergencia y enclavamientos deben ser físicos.
"""
import argparse
import math
import sys

# Límites de seguridad (edítalos según tu máquina)
MAX_X, MAX_Y = 300.0, 200.0   # mm de recorrido útil
MAX_S = 1000                  # valor S máximo (GRBL: $30)
MAX_FEED = 3000               # mm/min


def check(args):
    if not 0 <= args.power <= MAX_S:
        sys.exit(f"Potencia fuera de rango (0-{MAX_S})")
    if not 0 < args.feed <= MAX_FEED:
        sys.exit(f"Velocidad fuera de rango (1-{MAX_FEED})")
    if args.passes < 1 or args.passes > 20:
        sys.exit("Pasadas fuera de rango (1-20)")


def header(args):
    mode = "ARMADO (emite láser)" if args.armed else "SECO (láser apagado)"
    return [
        f"; Generado por laser_gcode.py - modo {mode}",
        "G21 ; mm",
        "G90 ; coordenadas absolutas",
        "M5  ; láser apagado",
        "G0 X0 Y0",
    ]


def laser_on(args):
    return [f"M4 S{args.power}"] if args.armed else []   # M4: potencia dinámica


def laser_off():
    return ["M5"]


def rect(args):
    x0, y0, w, h = args.x, args.y, args.w, args.h
    if x0 < 0 or y0 < 0 or x0 + w > MAX_X or y0 + h > MAX_Y:
        sys.exit("La forma excede el área de trabajo")
    out = header(args)
    out.append(f"G0 X{x0:.3f} Y{y0:.3f}")
    for i in range(args.passes):
        out.append(f"; pasada {i + 1}/{args.passes}")
        out += laser_on(args)
        out += [
            f"G1 X{x0 + w:.3f} Y{y0:.3f} F{args.feed}",
            f"G1 X{x0 + w:.3f} Y{y0 + h:.3f}",
            f"G1 X{x0:.3f} Y{y0 + h:.3f}",
            f"G1 X{x0:.3f} Y{y0:.3f}",
        ]
        out += laser_off()
    out += ["G0 X0 Y0", "M2"]
    return out


def circle(args):
    r = args.d / 2
    cx, cy = args.x + r, args.y + r
    if args.x < 0 or args.y < 0 or cx + r > MAX_X or cy + r > MAX_Y:
        sys.exit("La forma excede el área de trabajo")
    out = header(args)
    out.append(f"G0 X{cx + r:.3f} Y{cy:.3f}")
    for i in range(args.passes):
        out.append(f"; pasada {i + 1}/{args.passes}")
        out += laser_on(args)
        out.append(f"G2 X{cx + r:.3f} Y{cy:.3f} I{-r:.3f} J0 F{args.feed}")
        out += laser_off()
    out += ["G0 X0 Y0", "M2"]
    return out


def send(lines, port, baud):
    try:
        import serial  # pip install pyserial
    except ImportError:
        sys.exit("Falta pyserial: pip install pyserial")
    print(f"Se enviarán {len(lines)} líneas a {port}.")
    print("Confirma que: área despejada, cabina cerrada, paro de emergencia al alcance.")
    if input("Escribe 'EJECUTAR' para continuar: ").strip() != "EJECUTAR":
        sys.exit("Cancelado.")
    with serial.Serial(port, baud, timeout=5) as s:
        s.write(b"\r\n\r\n")
        s.flushInput()
        for ln in lines:
            ln = ln.split(";")[0].strip()
            if not ln:
                continue
            s.write((ln + "\n").encode())
            resp = s.readline().decode().strip()   # GRBL responde "ok" o "error:N"
            print(f"> {ln:<40} < {resp}")
            if resp.startswith("error"):
                s.write(b"M5\n")
                sys.exit(f"Error de la máquina, láser apagado: {resp}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("shape", choices=["rect", "circle"])
    p.add_argument("--x", type=float, default=10, help="origen X (mm)")
    p.add_argument("--y", type=float, default=10, help="origen Y (mm)")
    p.add_argument("--w", type=float, default=50, help="ancho (rect)")
    p.add_argument("--h", type=float, default=30, help="alto (rect)")
    p.add_argument("--d", type=float, default=40, help="diámetro (circle)")
    p.add_argument("--power", type=int, default=100, help=f"S (0-{MAX_S})")
    p.add_argument("--feed", type=int, default=600, help="mm/min")
    p.add_argument("--passes", type=int, default=1)
    p.add_argument("--armed", action="store_true", help="emitir láser (por defecto: seco)")
    p.add_argument("-o", "--output", help="archivo de salida")
    p.add_argument("--send", metavar="PUERTO", help="enviar por serial, p.ej. /dev/ttyUSB0 o COM3")
    p.add_argument("--baud", type=int, default=115200)
    args = p.parse_args()

    check(args)
    lines = rect(args) if args.shape == "rect" else circle(args)

    if args.output:
        with open(args.output, "w") as f:
            f.write("\n".join(lines) + "\n")
        print(f"Escrito {args.output} ({len(lines)} líneas)")
    elif not args.send:
        print("\n".join(lines))

    if args.send:
        send(lines, args.send, args.baud)


if __name__ == "__main__":
    main()
