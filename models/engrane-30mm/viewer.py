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

TEMPLATE = """<title>Engrane 30 mm</title>
<style>
  :root {
    --fondo: #f1f5f9; --panel: #ffffff; --texto: #0f172a; --tenue: #475569;
    --borde: #e2e8f0; --acento: #0284c7;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --fondo: #0b1220; --panel: #111c2e; --texto: #e2e8f0; --tenue: #94a3b8;
      --borde: #1e2d45; --acento: #38bdf8;
    }
  }
  :root[data-theme="dark"] {
    --fondo: #0b1220; --panel: #111c2e; --texto: #e2e8f0; --tenue: #94a3b8;
    --borde: #1e2d45; --acento: #38bdf8;
  }
  body {
    margin: 0; background: var(--fondo); color: var(--texto);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  .envoltura { max-width: 1100px; margin: 0 auto; padding: 24px 20px 40px; }
  h1 { font-size: clamp(1.3rem, 3vw, 1.8rem); margin: 0 0 4px; letter-spacing: -0.02em; }
  .subtitulo { color: var(--tenue); margin: 0 0 20px; font-size: 0.95rem; }
  .escena {
    position: relative; background: var(--panel); border: 1px solid var(--borde);
    border-radius: 14px; overflow: hidden;
  }
  canvas { display: block; width: 100%; height: 60vh; min-height: 320px; touch-action: none; }
  .pista {
    position: absolute; left: 12px; bottom: 10px; font-size: 0.78rem;
    color: var(--tenue); pointer-events: none;
  }
  .controles { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
  button {
    font: inherit; font-size: 0.85rem; padding: 7px 14px; border-radius: 999px;
    border: 1px solid var(--borde); background: var(--panel); color: var(--texto);
    cursor: pointer;
  }
  button[aria-pressed="true"] { border-color: var(--acento); color: var(--acento); }
  table { width: 100%; border-collapse: collapse; margin-top: 22px; font-size: 0.9rem; }
  caption { text-align: left; font-weight: 600; padding-bottom: 8px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--borde); }
  th { color: var(--tenue); font-weight: 500; }
  td { font-variant-numeric: tabular-nums; }
</style>

<div class="envoltura">
  <h1>Engrane recto Ø__DA__ mm</h1>
  <p class="subtitulo">Modulo __M__ · __Z__ dientes · angulo de presion __ALPHA__° · perfil de evolvente</p>

  <div class="escena">
    <canvas id="lienzo"></canvas>
    <span class="pista">Arrastra para girar · rueda para acercar</span>
  </div>

  <div class="controles">
    <button id="girar" aria-pressed="true">Rotacion automatica</button>
    <button id="malla" aria-pressed="false">Ver malla</button>
    <button id="reiniciar" aria-pressed="false">Vista inicial</button>
  </div>

  <table>
    <caption>Datos de fabricacion</caption>
    <tbody>__FILAS__</tbody>
  </table>
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
let automatico = true, verMalla = false;

const centrar = trasladar(0, 0, -__ESPESOR__ / 2);

function dibujar() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = Math.round(lienzo.clientWidth * dpr), alto = Math.round(lienzo.clientHeight * dpr);
  if (lienzo.width !== ancho || lienzo.height !== alto) { lienzo.width = ancho; lienzo.height = alto; }
  gl.viewport(0, 0, ancho, alto);

  const oscuro = matchMedia("(prefers-color-scheme: dark)").matches
    && document.documentElement.dataset.theme !== "light"
    || document.documentElement.dataset.theme === "dark";
  gl.clearColor(...(oscuro ? [0.067, 0.11, 0.18, 1] : [1, 1, 1, 1]));
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

    filas = [
        ("Modulo (m)", f"{spec.module:g} mm"),
        ("Numero de dientes (z)", f"{spec.teeth}"),
        ("Angulo de presion (α)", f"{spec.pressure_angle:g}°"),
        ("Diametro exterior (da)", f"{2 * spec.tip_radius:.2f} mm"),
        ("Diametro primitivo (d)", f"{2 * spec.pitch_radius:.2f} mm"),
        ("Diametro de raiz (df)", f"{2 * spec.root_radius:.2f} mm"),
        ("Diametro base (db)", f"{2 * spec.base_radius:.2f} mm"),
        ("Paso circular (p)", f"{3.141592653589793 * spec.module:.3f} mm"),
        ("Ancho de cara (b)", f"{spec.width:g} mm"),
        ("Barreno", f"Ø{spec.bore:g} mm"),
        ("Triangulos de la malla", f"{len(triangles):,}".replace(",", " ")),
    ]

    return (
        TEMPLATE.replace("__GEOMETRIA__", base64.b64encode(bytes(raw)).decode())
        .replace("__DA__", f"{2 * spec.tip_radius:g}")
        .replace("__M__", f"{spec.module:g}")
        .replace("__Z__", str(spec.teeth))
        .replace("__ALPHA__", f"{spec.pressure_angle:g}")
        .replace("__ESPESOR__", f"{spec.width:g}")
        .replace("__FILAS__", "".join(f"<tr><th>{k}</th><td>{v}</td></tr>" for k, v in filas))
    )


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else "visor.html"
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html(GearSpec()))
    print(f"Visor 3D: {destino}")
