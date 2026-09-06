#!/usr/bin/env python3
"""Constructor minimo de graficas SVG en linea (sin dependencias).

Produce el SVG y, en paralelo, las series en JSON para que la pagina monte
encima la capa de interaccion (cruz y tooltip). Los ejes, la rejilla y las
etiquetas se calculan aqui para que el SVG no dependa de ninguna libreria.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field

ANCHO, ALTO = 760, 380
MARGEN = dict(arriba=26, derecha=118, abajo=48, izquierda=64)


@dataclass
class Serie:
    nombre: str
    puntos: list[tuple[float, float]]
    color: str            # rol CSS, p. ej. "var(--serie-1)"
    trazo: str = ""       # patron de guiones opcional (codificacion secundaria)
    etiqueta: str = ""    # etiqueta directa al final de la linea
    etiqueta_en: str = "final"   # "final", "max" o "inicio": donde anclarla
    unidad: str = ""
    hitos: list = field(default_factory=list)   # (x, y, texto) puntos destacados


def _ticks(minimo: float, maximo: float, objetivo: int = 6) -> list[float]:
    """Marcas 'redondas' dentro del dominio."""
    bruto = (maximo - minimo) / objetivo
    magnitud = 10 ** len(str(int(bruto)).lstrip("-")) / 10 if bruto >= 1 else 0.1
    for multiplo in (1, 2, 2.5, 5, 10):
        paso = magnitud * multiplo
        if (maximo - minimo) / paso <= objetivo + 1:
            break
    inicio = (int(minimo / paso) + (1 if minimo > 0 else 0)) * paso
    marcas, valor = [], inicio
    while valor <= maximo + 1e-9:
        marcas.append(round(valor, 6))
        valor += paso
    return marcas


def grafica(idg: str, series: list[Serie], titulo: str, eje_x: str, eje_y: str,
            x_max: float | None = None, y_max: float | None = None) -> tuple[str, str]:
    """Devuelve (svg, json_de_series) para una grafica de lineas."""
    xs = [p[0] for s in series for p in s.puntos]
    ys = [p[1] for s in series for p in s.puntos]
    x0, x1 = 0.0, x_max if x_max is not None else max(xs)
    y0, y1 = 0.0, y_max if y_max is not None else max(ys) * 1.12

    ix, id_, ia, ib = MARGEN["izquierda"], MARGEN["derecha"], MARGEN["arriba"], MARGEN["abajo"]
    px = lambda x: ix + (x - x0) / (x1 - x0) * (ANCHO - ix - id_)
    py = lambda y: ALTO - ib - (y - y0) / (y1 - y0) * (ALTO - ia - ib)

    partes = [f'<svg id="{idg}" class="grafica" viewBox="0 0 {ANCHO} {ALTO}" '
              f'role="img" aria-label="{titulo}">']

    # Rejilla recesiva y ejes
    for marca in _ticks(y0, y1):
        y = py(marca)
        partes.append(f'<line class="rejilla" x1="{ix}" y1="{y:.1f}" x2="{ANCHO - id_}" y2="{y:.1f}"/>')
        partes.append(f'<text class="tick" x="{ix - 10}" y="{y + 4:.1f}" text-anchor="end">'
                      f'{marca:g}</text>')
    for marca in _ticks(x0, x1):
        x = px(marca)
        partes.append(f'<text class="tick" x="{x:.1f}" y="{ALTO - ib + 20}" text-anchor="middle">'
                      f'{marca:g}</text>')
    partes.append(f'<line class="eje" x1="{ix}" y1="{ALTO - ib}" x2="{ANCHO - id_}" y2="{ALTO - ib}"/>')
    partes.append(f'<text class="rotulo-eje" x="{(ix + ANCHO - id_) / 2:.0f}" y="{ALTO - 8}" '
                  f'text-anchor="middle">{eje_x}</text>')
    partes.append(f'<text class="rotulo-eje" x="{ix - 46}" y="{ia + 2}">{eje_y}</text>')

    # Series
    for i, serie in enumerate(series):
        d = " ".join(
            ("M" if j == 0 else "L") + f"{px(x):.1f},{py(y):.1f}"
            for j, (x, y) in enumerate(serie.puntos)
        )
        guion = f' stroke-dasharray="{serie.trazo}"' if serie.trazo else ""
        partes.append(f'<path class="linea" d="{d}" stroke="{serie.color}"{guion}/>')
        if serie.etiqueta:
            if serie.etiqueta_en == "inicio":
                ex, ey = serie.puntos[0]
                partes.append(f'<text class="directa" x="{px(ex) + 16:.1f}" y="{py(ey) - 16:.1f}" '
                              f'fill="{serie.color}">{serie.etiqueta}</text>')
            elif serie.etiqueta_en == "max":
                # Sobre el maximo: al final de la curva la etiqueta chocaria con el eje.
                ex, ey = max(serie.puntos, key=lambda p: p[1])
                partes.append(f'<text class="directa" x="{px(ex):.1f}" y="{py(ey) - 12:.1f}" '
                              f'text-anchor="middle" fill="{serie.color}">{serie.etiqueta}</text>')
            else:
                ex, ey = serie.puntos[-1]
                partes.append(f'<text class="directa" x="{px(ex) + 10:.1f}" y="{py(ey) + 4:.1f}" '
                              f'fill="{serie.color}">{serie.etiqueta}</text>')
        for hx, hy, texto in serie.hitos:
            partes.append(f'<circle class="hito" cx="{px(hx):.1f}" cy="{py(hy):.1f}" r="5" '
                          f'fill="{serie.color}"/>')
            partes.append(f'<text class="anotacion" x="{px(hx):.1f}" y="{py(hy) - 12:.1f}" '
                          f'text-anchor="middle">{texto}</text>')

    # Capa de interaccion: cruz y punto por serie, ocultos hasta el hover.
    partes.append(f'<line class="cruz" id="{idg}-cruz" y1="{ia}" y2="{ALTO - ib}" hidden/>')
    for i, serie in enumerate(series):
        partes.append(f'<circle class="foco" id="{idg}-foco-{i}" r="5" fill="{serie.color}" hidden/>')
    partes.append(f'<rect id="{idg}-captura" x="{ix}" y="{ia}" width="{ANCHO - ix - id_}" '
                  f'height="{ALTO - ia - ib}" fill="transparent"/>')
    partes.append("</svg>")

    datos = json.dumps({
        "id": idg,
        "caja": {"x0": x0, "x1": x1, "y0": y0, "y1": y1,
                 "ix": ix, "id": id_, "ia": ia, "ib": ib, "w": ANCHO, "h": ALTO},
        "series": [{"nombre": s.nombre, "unidad": s.unidad, "puntos": s.puntos} for s in series],
    })
    return "\n".join(partes), datos
