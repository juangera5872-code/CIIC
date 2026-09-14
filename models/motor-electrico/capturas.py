#!/usr/bin/env python3
"""Captura las vistas del motor desde el visor 3D (conjunto, corte y despiece).

Usa el propio `visor.html`, de modo que las imagenes salen del mismo motor de
render que ve el usuario: con z-buffer, sin los artefactos de ordenacion que
tiene un render de poligonos por profundidad de centroide.

Requiere Playwright y un Chromium instalado:
    pip install playwright && playwright install chromium
Uso:
    python3 viewer.py visor.html && python3 capturas.py
"""

from __future__ import annotations

import glob
import os
import sys

from playwright.sync_api import sync_playwright

VISTAS = [
    ("motor-conjunto.png", dict(explosion=0, corte=False)),
    ("motor-corte.png", dict(explosion=0, corte=True)),
    ("motor-despiece.png", dict(explosion=100, corte=False)),
]


def chromium() -> str | None:
    """Ruta al Chromium preinstalado, si el entorno no la resuelve solo."""
    if ruta := os.environ.get("PLAYWRIGHT_CHROMIUM"):
        return ruta
    encontrados = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return encontrados[-1] if encontrados else None


def capturar(pagina_html: str) -> None:
    with sync_playwright() as p:
        navegador = p.chromium.launch(
            executable_path=chromium(),
            args=["--use-gl=angle", "--use-angle=swiftshader",
                  "--enable-unsafe-swiftshader", "--no-sandbox"],
        )
        pagina = navegador.new_page(viewport={"width": 1500, "height": 1000})
        pagina.goto("file://" + os.path.abspath(pagina_html))
        pagina.wait_for_timeout(1500)
        pagina.click("#girar")  # detiene la rotacion para que la vista sea repetible
        pagina.eval_on_selector(".pista", "el => el.hidden = true")  # fuera la ayuda del raton

        for archivo, estado in VISTAS:
            pagina.eval_on_selector(
                "#explosion",
                f"el => {{ el.value = {estado['explosion']}; el.dispatchEvent(new Event('input')); }}",
            )
            activo = pagina.get_attribute("#corte", "aria-pressed") == "true"
            if activo != estado["corte"]:
                pagina.click("#corte")  # el corte reposiciona la camara por su cuenta
            pagina.wait_for_timeout(800)
            pagina.locator("#lienzo").screenshot(path=archivo)
            print(f"  {archivo}")

        navegador.close()


if __name__ == "__main__":
    print("Capturas del visor:")
    capturar(sys.argv[1] if len(sys.argv) > 1 else "visor.html")
