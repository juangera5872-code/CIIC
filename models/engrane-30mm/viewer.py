#!/usr/bin/env python3
"""Genera un visor 3D autocontenido (HTML + WebGL) del engrane.

La malla se incrusta en el propio HTML como Float32 en base64, de modo que el
archivo funciona sin servidor, sin red y sin librerias externas.

Uso:  python3 viewer.py [salida.html]
"""

from __future__ import annotations

import base64
import struct
import sys

from gear import GearSpec, build_mesh

TEMPLATE = """<title>Engrane Recto 30 mm</title>
<style>
  /* Paleta acero: neutros con sesgo azul frio + un solo acento (azul cian). */
  :root {
    --papel: #eef1f4; --placa: #ffffff; --tinta: #16202c; --grafito: #5b6a7a;
    --trazo: #d3dae1; --acento: #0b6f9c; --cota: #b8434a;
    --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
      --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d;
    }
  }
  :root[data-theme="dark"] {
    --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
    --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d;
  }

  body {
    margin: 0; background: var(--papel); color: var(--tinta);
    font-family: var(--sans); line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .hoja {
    max-width: 980px; margin: 0 auto; padding: 32px 20px 56px;
    display: flex; flex-direction: column; gap: 18px;
  }

  .rotulo {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito);
    display: flex; gap: 10px; align-items: center;
  }
  .rotulo::after { content: ""; flex: 1; height: 1px; background: var(--trazo); }
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.3rem); line-height: 1.1; margin: 6px 0 0;
    letter-spacing: -0.025em; text-wrap: balance; font-weight: 650;
  }
  h1 span { color: var(--acento); }
  .entrada { color: var(--grafito); margin: 8px 0 0; max-width: 62ch; }

  .escena {
    position: relative; background: var(--placa); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  canvas { display: block; width: 100%; height: 58vh; min-height: 320px; touch-action: none; }
  .pista {
    position: absolute; left: 14px; bottom: 12px; pointer-events: none;
    font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.04em;
    color: var(--grafito);
  }

  .mandos { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    font: inherit; font-size: 0.85rem; padding: 8px 16px; border-radius: 3px;
    border: 1px solid var(--trazo); background: var(--placa); color: var(--tinta);
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  button:hover { border-color: var(--grafito); }
  button[aria-pressed="true"] { border-color: var(--acento); color: var(--acento); }
  :focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }

  h2 {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); font-weight: 500;
    margin: 14px 0 0;
  }
  .cuadro {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1px; background: var(--trazo); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  .dato {
    background: var(--placa); padding: 12px 14px;
    display: flex; flex-direction: column; gap: 3px;
  }
  .dato dt { font-size: 0.75rem; color: var(--grafito); }
  .dato dd {
    margin: 0; font-family: var(--mono); font-size: 1.02rem;
    font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
  }
  .dato.clave dd { color: var(--cota); }
  .nota { color: var(--grafito); font-size: 0.85rem; margin: 0; max-width: 68ch; }

  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
</style>

<div class="hoja">
  <header>
    <p class="rotulo">Modelo parametrico · malla cerrada</p>
    <h1>Engrane recto <span>Ø__DA__ mm</span></h1>
    <p class="entrada">
      Perfil de evolvente con modulo __M__, __Z__ dientes y angulo de presion __ALPHA__°.
      La geometria se genera por calculo, no se dibuja a mano.
    </p>
  </header>

  <div class="escena">
    <canvas id="lienzo" aria-label="Vista 3D del engrane, girable con el raton"></canvas>
    <span class="pista">Arrastra para girar · rueda para acercar</span>
  </div>

  <div class="mandos">
    <button id="girar" aria-pressed="true">Rotacion automatica</button>
    <button id="malla" aria-pressed="false">Ver malla</button>
    <button id="reiniciar">Vista inicial</button>
  </div>

  <h2>Datos de fabricacion</h2>
  <dl class="cuadro">__FILAS__</dl>
  <p class="nota">
    El diametro de 30 mm es el exterior: da = m·(z + 2). Al engranar con otra rueda
    de la misma familia, la distancia entre centros es a = m·(z₁ + z₂)/2.
  </p>
</div>

<script>
const DATOS = "__GEOMETRIA__";
const vertices = new Float32Array(
  Uint8Array.from(atob(DATOS), (c) => c.charCodeAt(0)).buffer
);

// Normales por cara: cada triangulo aporta la suya a sus tres vertices.
const normales = new Float32Array(vertices.length);
for (let i = 0; i < vertices.length; i += 9) {
  const ax = vertices[i + 3] - vertices[i], ay = vertices[i + 4] - vertices[i + 1],
        az = vertices[i + 5] - vertices[i + 2];
  const bx = vertices[i + 6] - vertices[i], by = vertices[i + 7] - vertices[i + 1],
        bz = vertices[i + 8] - vertices[i + 2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
  const l = Math.hypot(nx, ny, nz) || 1;
  nx /= l; ny /= l; nz /= l;
  for (let k = 0; k < 3; k++) {
    normales[i + k * 3] = nx; normales[i + k * 3 + 1] = ny; normales[i + k * 3 + 2] = nz;
  }
}

const lienzo = document.getElementById("lienzo");
const gl = lienzo.getContext("webgl", { antialias: true });

const VS = `
attribute vec3 posicion; attribute vec3 normal;
uniform mat4 modelo, vista, proyeccion;
varying vec3 vNormal, vPos;
void main() {
  vNormal = mat3(modelo) * normal;
  vec4 mundo = modelo * vec4(posicion, 1.0);
  vPos = mundo.xyz;
  gl_Position = proyeccion * vista * mundo;
}`;

const FS = `
precision mediump float;
varying vec3 vNormal, vPos;
uniform vec3 color; uniform float lineas;
void main() {
  if (lineas > 0.5) { gl_FragColor = vec4(color * 0.55, 1.0); return; }
  vec3 n = normalize(vNormal);
  vec3 luz = normalize(vec3(0.45, 0.8, 0.9));
  float dif = max(dot(n, luz), 0.0);
  float relleno = 0.35 + 0.35 * max(dot(n, normalize(vec3(-0.6, -0.3, 0.5))), 0.0);
  vec3 ojo = normalize(-vPos);
  float esp = pow(max(dot(reflect(-luz, n), ojo), 0.0), 28.0) * 0.35;
  gl_FragColor = vec4(color * (relleno + 0.75 * dif) + esp, 1.0);
}`;

function compilar(tipo, fuente) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, fuente); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const programa = gl.createProgram();
gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VS));
gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(programa);
gl.useProgram(programa);

function subir(datos) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
  return b;
}
function enlazar(bufer, nombre) {
  gl.bindBuffer(gl.ARRAY_BUFFER, bufer);
  const loc = gl.getAttribLocation(programa, nombre);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
}
const bufPosicion = subir(vertices);
const bufNormal = subir(normales);

// Aristas de cada triangulo, para el modo malla.
const aristas = new Float32Array(vertices.length * 2);
for (let i = 0, o = 0; i < vertices.length; i += 9) {
  for (const [a, b] of [[0, 3], [3, 6], [6, 0]]) {
    for (const k of [a, a + 1, a + 2, b, b + 1, b + 2]) aristas[o++] = vertices[i + k];
  }
}
const bufAristas = subir(aristas);

const uModelo = gl.getUniformLocation(programa, "modelo");
const uVista = gl.getUniformLocation(programa, "vista");
const uProy = gl.getUniformLocation(programa, "proyeccion");
const uColor = gl.getUniformLocation(programa, "color");
const uLineas = gl.getUniformLocation(programa, "lineas");

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.POLYGON_OFFSET_FILL);
gl.polygonOffset(1.0, 1.0);

// --- Matrices (column-major, como espera WebGL) ---
const identidad = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
function multiplicar(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
}
const rotX = (t) => [1,0,0,0, 0,Math.cos(t),Math.sin(t),0, 0,-Math.sin(t),Math.cos(t),0, 0,0,0,1];
const rotZ = (t) => [Math.cos(t),Math.sin(t),0,0, -Math.sin(t),Math.cos(t),0,0, 0,0,1,0, 0,0,0,1];
const trasladar = (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
function perspectiva(fov, aspecto, cerca, lejos) {
  const f = 1 / Math.tan(fov / 2);
  return [f/aspecto,0,0,0, 0,f,0,0, 0,0,(lejos+cerca)/(cerca-lejos),-1, 0,0,2*lejos*cerca/(cerca-lejos),0];
}

const inicio = { giroZ: 0.6, giroX: -1.05, zoom: 42 };
let camara = { ...inicio };
let verMalla = false;
let automatico = !matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("girar").setAttribute("aria-pressed", String(automatico));

// El fondo del lienzo se toma del mismo token que el resto de la pagina.
const raiz = getComputedStyle(document.documentElement);
function tono(nombre) {
  const hex = raiz.getPropertyValue(nombre).trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

const centrar = trasladar(0, 0, -__ESPESOR__ / 2);

function dibujar() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = Math.round(lienzo.clientWidth * dpr), alto = Math.round(lienzo.clientHeight * dpr);
  if (lienzo.width !== ancho || lienzo.height !== alto) { lienzo.width = ancho; lienzo.height = alto; }
  gl.viewport(0, 0, ancho, alto);

  const oscuro = matchMedia("(prefers-color-scheme: dark)").matches
    && document.documentElement.dataset.theme !== "light"
    || document.documentElement.dataset.theme === "dark";
  gl.clearColor(...tono("--placa"), 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (automatico) camara.giroZ += 0.006;
  const modelo = multiplicar(multiplicar(rotX(camara.giroX), rotZ(camara.giroZ)), centrar);
  gl.uniformMatrix4fv(uModelo, false, modelo);
  gl.uniformMatrix4fv(uVista, false, trasladar(0, 0, -camara.zoom));
  gl.uniformMatrix4fv(uProy, false, perspectiva(0.9, ancho / alto, 1, 400));
  gl.uniform3fv(uColor, oscuro ? [0.35, 0.72, 0.95] : [0.16, 0.56, 0.83]);

  gl.uniform1f(uLineas, 0);
  enlazar(bufPosicion, "posicion");
  enlazar(bufNormal, "normal");
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

  if (verMalla) {
    // Las aristas comparten profundidad con las caras: el offset evita el z-fighting.
    gl.uniform1f(uLineas, 1);
    enlazar(bufAristas, "posicion");
    enlazar(bufAristas, "normal");
    gl.drawArrays(gl.LINES, 0, aristas.length / 3);
  }
  requestAnimationFrame(dibujar);
}
requestAnimationFrame(dibujar);

// --- Interaccion ---
let arrastrando = false, ultimo = null;
const punto = (e) => (e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                               : { x: e.clientX, y: e.clientY });
function empezar(e) { arrastrando = true; automatico = false;
  document.getElementById("girar").setAttribute("aria-pressed", "false"); ultimo = punto(e); }
function mover(e) {
  if (!arrastrando) return;
  const p = punto(e);
  camara.giroZ += (p.x - ultimo.x) * 0.01;
  camara.giroX = Math.max(-Math.PI, Math.min(0, camara.giroX + (p.y - ultimo.y) * 0.01));
  ultimo = p;
  e.preventDefault();
}
const terminar = () => { arrastrando = false; };
lienzo.addEventListener("mousedown", empezar);
lienzo.addEventListener("touchstart", empezar, { passive: true });
addEventListener("mousemove", mover);
addEventListener("touchmove", mover, { passive: false });
addEventListener("mouseup", terminar);
addEventListener("touchend", terminar);
lienzo.addEventListener("wheel", (e) => {
  camara.zoom = Math.max(20, Math.min(120, camara.zoom + e.deltaY * 0.05));
  e.preventDefault();
}, { passive: false });

document.getElementById("girar").onclick = (e) => {
  automatico = !automatico; e.currentTarget.setAttribute("aria-pressed", String(automatico));
};
document.getElementById("malla").onclick = (e) => {
  verMalla = !verMalla; e.currentTarget.setAttribute("aria-pressed", String(verMalla));
};
document.getElementById("reiniciar").onclick = () => { camara = { ...inicio }; };
</script>
"""


def html(spec: GearSpec) -> str:
    triangles = build_mesh(spec)
    raw = bytearray()
    for tri in triangles:
        for vertex in tri:
            raw += struct.pack("<3f", *vertex)

    # Las cotas marcadas como clave son las que definen el encargo.
    filas = [
        ("Diametro exterior (da)", f"{2 * spec.tip_radius:.2f} mm", True),
        ("Diametro primitivo (d)", f"{2 * spec.pitch_radius:.2f} mm", True),
        ("Modulo (m)", f"{spec.module:g} mm", False),
        ("Numero de dientes (z)", f"{spec.teeth}", False),
        ("Angulo de presion (α)", f"{spec.pressure_angle:g}°", False),
        ("Diametro de raiz (df)", f"{2 * spec.root_radius:.2f} mm", False),
        ("Diametro base (db)", f"{2 * spec.base_radius:.2f} mm", False),
        ("Paso circular (p)", f"{3.141592653589793 * spec.module:.3f} mm", False),
        ("Ancho de cara (b)", f"{spec.width:g} mm", False),
        ("Barreno", f"Ø{spec.bore:g} mm", False),
        ("Filete de raiz (ρ)", f"{spec.fillet_radius:.2f} mm", False),
        ("Triangulos de la malla", f"{len(triangles):,}".replace(",", " "), False),
    ]

    return (
        TEMPLATE.replace("__GEOMETRIA__", base64.b64encode(bytes(raw)).decode())
        .replace("__DA__", f"{2 * spec.tip_radius:g}")
        .replace("__M__", f"{spec.module:g}")
        .replace("__Z__", str(spec.teeth))
        .replace("__ALPHA__", f"{spec.pressure_angle:g}")
        .replace("__ESPESOR__", f"{spec.width:g}")
        .replace(
            "__FILAS__",
            "".join(
                f'<div class="dato{" clave" if clave else ""}"><dt>{k}</dt><dd>{v}</dd></div>'
                for k, v, clave in filas
            ),
        )
    )


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else "visor.html"
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html(GearSpec()))
    print(f"Visor 3D: {destino}")
