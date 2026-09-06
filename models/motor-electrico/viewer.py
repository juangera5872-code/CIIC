#!/usr/bin/env python3
"""Genera el visor 3D autocontenido del motor (HTML + WebGL, sin dependencias).

La geometria de las 14 piezas viaja incrustada en el propio HTML como Float32 en
base64, con un rango de vertices por pieza para poder ocultarlas, colorearlas y
separarlas en la vista explosionada.

Uso:  python3 viewer.py [salida.html]
"""

from __future__ import annotations

import base64
import os
import struct
import sys

import motor

CABECERA = """<title>Motor Asincrono IEC 80</title>
<style>
  /* Misma familia visual que la hoja del engrane: neutros de acero y un acento. */
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
    font-family: var(--sans); line-height: 1.5; -webkit-font-smoothing: antialiased;
  }
  .hoja {
    max-width: 1120px; margin: 0 auto; padding: 32px 20px 56px;
    display: flex; flex-direction: column; gap: 18px;
  }
  .rotulo {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito);
    display: flex; gap: 10px; align-items: center; margin: 0;
  }
  .rotulo::after { content: ""; flex: 1; height: 1px; background: var(--trazo); }
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.3rem); line-height: 1.1; margin: 6px 0 0;
    letter-spacing: -0.025em; text-wrap: balance; font-weight: 650;
  }
  h1 span { color: var(--acento); }
  .entrada { color: var(--grafito); margin: 8px 0 0; max-width: 64ch; }

  .taller { display: grid; grid-template-columns: minmax(0, 1fr) 268px; gap: 14px; }
  @media (max-width: 820px) { .taller { grid-template-columns: minmax(0, 1fr); } }

  .escena {
    position: relative; background: var(--placa); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  canvas { display: block; width: 100%; height: 64vh; min-height: 340px; touch-action: none; }
  .pista {
    position: absolute; left: 14px; bottom: 12px; pointer-events: none;
    font-family: var(--mono); font-size: 0.72rem; color: var(--grafito);
  }

  .despiece {
    background: var(--placa); border: 1px solid var(--trazo); border-radius: 4px;
    padding: 12px; display: flex; flex-direction: column; gap: 2px;
    max-height: 64vh; overflow-y: auto;
  }
  .despiece h2 {
    font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); font-weight: 500; margin: 2px 0 8px;
  }
  .pieza {
    display: grid; grid-template-columns: 12px 1fr auto; gap: 9px; align-items: baseline;
    padding: 7px 6px; border: 0; background: none; border-radius: 3px;
    text-align: left; font: inherit; color: inherit; cursor: pointer; width: 100%;
  }
  .pieza:hover { background: color-mix(in srgb, var(--acento) 8%, transparent); }
  .pieza[aria-pressed="false"] { opacity: 0.38; }
  .chip { width: 12px; height: 12px; border-radius: 2px; align-self: center; }
  .pieza b { font-weight: 550; font-size: 0.88rem; display: block; color: var(--tinta); }
  .pieza small { color: var(--grafito); font-size: 0.74rem; }
  .pieza em {
    font-family: var(--mono); font-style: normal; font-size: 0.76rem;
    color: var(--grafito); font-variant-numeric: tabular-nums;
  }

  .mandos { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  button {
    font: inherit; font-size: 0.85rem; padding: 8px 16px; border-radius: 3px;
    border: 1px solid var(--trazo); background: var(--placa); color: var(--tinta);
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  button:hover { border-color: var(--grafito); }
  .mandos button[aria-pressed="true"] { border-color: var(--acento); color: var(--acento); }
  :focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }

  .deslizador {
    display: flex; align-items: center; gap: 10px; flex: 1; min-width: 240px;
    background: var(--placa); border: 1px solid var(--trazo); border-radius: 3px;
    padding: 6px 14px;
  }
  .deslizador label { font-size: 0.85rem; white-space: nowrap; }
  .deslizador input { flex: 1; accent-color: var(--acento); }
  .deslizador output {
    font-family: var(--mono); font-size: 0.8rem; color: var(--grafito);
    font-variant-numeric: tabular-nums; min-width: 3.4em; text-align: right;
  }

  h3 {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); font-weight: 500; margin: 14px 0 0;
  }
  .cuadro {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 1px; background: var(--trazo); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  .dato { background: var(--placa); padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; }
  .dato dt { font-size: 0.75rem; color: var(--grafito); }
  .dato dd {
    margin: 0; font-family: var(--mono); font-size: 1.02rem;
    font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
  }
  .dato.clave dd { color: var(--cota); }
  .nota { color: var(--grafito); font-size: 0.85rem; margin: 0; max-width: 70ch; }

  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
</style>

<div class="hoja">
  <header>
    <p class="rotulo">Despiece 3D · __PIEZAS__ piezas · __TRIANGULOS__ triangulos</p>
    <h1>Motor asincrono trifasico <span>IEC 80</span></h1>
    <p class="entrada">
      Jaula de ardilla de 0.75 kW y 4 polos, modelada pieza a pieza: carcasa con aletas,
      estator de 24 ranuras con su bobinado, rotor de 28 barras, eje sobre dos rodamientos
      6204, ventilador y pinon de salida. Separa el conjunto o cortalo para ver el interior.
    </p>
  </header>

  <div class="mandos">
    <div class="deslizador">
      <label for="explosion">Despiece</label>
      <input id="explosion" type="range" min="0" max="100" value="0" step="1">
      <output id="valor">0 %</output>
    </div>
    <button id="corte" aria-pressed="false">Vista en corte</button>
    <button id="girar" aria-pressed="true">Rotacion</button>
    <button id="reiniciar">Vista inicial</button>
  </div>

  <div class="taller">
    <div class="escena">
      <canvas id="lienzo" aria-label="Vista 3D del motor, girable con el raton"></canvas>
      <span class="pista">Arrastra para girar · rueda para acercar</span>
    </div>
    <div class="despiece">
      <h2>Lista de piezas</h2>
      __LISTA__
    </div>
  </div>

  <h3>Caracteristicas</h3>
  <dl class="cuadro">__FICHA__</dl>

  <p class="nota">
    Las masas salen del volumen de cada solido por la densidad de su material, no de un
    catalogo: sirven para comparar piezas, no como peso certificado. El entrehierro real
    es de 0.3 mm, asi que a escala de pantalla rotor y estator parecen tocarse.
  </p>
</div>
"""

CUERPO = """
<script>
const PARTES = __PARTES__;
const vertices = new Float32Array(
  Uint8Array.from(atob("__GEOMETRIA__"), (c) => c.charCodeAt(0)).buffer
);

// Normal por cara: la misma para los tres vertices del triangulo.
const normales = new Float32Array(vertices.length);
for (let i = 0; i < vertices.length; i += 9) {
  const ax = vertices[i + 3] - vertices[i], ay = vertices[i + 4] - vertices[i + 1],
        az = vertices[i + 5] - vertices[i + 2];
  const bx = vertices[i + 6] - vertices[i], by = vertices[i + 7] - vertices[i + 1],
        bz = vertices[i + 8] - vertices[i + 2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
  const l = Math.hypot(nx, ny, nz) || 1;
  for (let k = 0; k < 3; k++) {
    normales[i + k * 3] = nx / l; normales[i + k * 3 + 1] = ny / l; normales[i + k * 3 + 2] = nz / l;
  }
}

const lienzo = document.getElementById("lienzo");
const gl = lienzo.getContext("webgl", { antialias: true });

const VS = `
attribute vec3 posicion; attribute vec3 normal;
uniform mat4 modelo, vista, proyeccion;
uniform vec3 desplazamiento;
varying vec3 vNormal, vOjo, vLocal;
void main() {
  vLocal = posicion;
  vec3 p = posicion + desplazamiento;
  vNormal = mat3(modelo) * normal;
  vec4 mundo = modelo * vec4(p, 1.0);
  vOjo = (vista * mundo).xyz;
  gl_Position = proyeccion * vista * mundo;
}`;

const FS = `
precision mediump float;
varying vec3 vNormal, vOjo, vLocal;
uniform vec3 color; uniform float corte;
void main() {
  // Media seccion por el plano del eje: descubre ranuras, jaula y rodamientos.
  if (corte > 0.5 && vLocal.y > 0.0) discard;
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;            // las caras seccionadas se iluminan igual
  vec3 luz = normalize(vec3(0.4, 0.85, 0.75));
  float dif = max(dot(n, luz), 0.0);
  float ambiente = 0.34 + 0.3 * max(dot(n, normalize(vec3(-0.7, -0.2, 0.4))), 0.0);
  float esp = pow(max(dot(reflect(-luz, n), normalize(-vOjo)), 0.0), 26.0) * 0.3;
  gl_FragColor = vec4(color * (ambiente + 0.7 * dif) + esp, 1.0);
}`;

function compilar(tipo, fuente) {
  const sh = gl.createShader(tipo);
  gl.shaderSource(sh, fuente); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}
const programa = gl.createProgram();
gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VS));
gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(programa);
gl.useProgram(programa);

function atributo(datos, nombre) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(programa, nombre);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
}
atributo(vertices, "posicion");
atributo(normales, "normal");

const uModelo = gl.getUniformLocation(programa, "modelo");
const uVista = gl.getUniformLocation(programa, "vista");
const uProy = gl.getUniformLocation(programa, "proyeccion");
const uColor = gl.getUniformLocation(programa, "color");
const uDesp = gl.getUniformLocation(programa, "desplazamiento");
const uCorte = gl.getUniformLocation(programa, "corte");
gl.enable(gl.DEPTH_TEST);

// --- Matrices (column-major) ---
function multiplicar(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
}
const rotX = (t) => [1,0,0,0, 0,Math.cos(t),Math.sin(t),0, 0,-Math.sin(t),Math.cos(t),0, 0,0,0,1];
const rotY = (t) => [Math.cos(t),0,-Math.sin(t),0, 0,1,0,0, Math.sin(t),0,Math.cos(t),0, 0,0,0,1];
const trasladar = (x, y, z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
function perspectiva(fov, aspecto, cerca, lejos) {
  const f = 1 / Math.tan(fov / 2);
  return [f/aspecto,0,0,0, 0,f,0,0, 0,0,(lejos+cerca)/(cerca-lejos),-1, 0,0,2*lejos*cerca/(cerca-lejos),0];
}

const inicio = { giro: 0.9, altura: 0.38, zoom: 430 };
let camara = { ...inicio };
let explosion = 0, corte = false;
let automatico = !matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("girar").setAttribute("aria-pressed", String(automatico));

const raiz = getComputedStyle(document.documentElement);
function tono(nombre) {
  const hex = raiz.getPropertyValue(nombre).trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

// El motor esta modelado con el paquete en z = 0..90: se centra al dibujar. Al
// explotar, las piezas de la carcasa suben, asi que el conjunto baja para compensar.
const centrar = (f) => trasladar(0, -20 - 88 * f, -45);

function dibujar() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = Math.round(lienzo.clientWidth * dpr), alto = Math.round(lienzo.clientHeight * dpr);
  if (lienzo.width !== ancho || lienzo.height !== alto) { lienzo.width = ancho; lienzo.height = alto; }
  gl.viewport(0, 0, ancho, alto);
  gl.clearColor(...tono("--placa"), 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (automatico) camara.giro += 0.004;
  const modelo = multiplicar(multiplicar(rotX(camara.altura), rotY(camara.giro)), centrar(explosion));
  gl.uniformMatrix4fv(uModelo, false, modelo);
  // Al separar las piezas la camara retrocede para que el despiece siga cabiendo.
  gl.uniformMatrix4fv(uVista, false, trasladar(0, 0, -camara.zoom * (1 + 0.62 * explosion)));
  gl.uniformMatrix4fv(uProy, false, perspectiva(0.8, ancho / alto, 10, 3000));
  gl.uniform1f(uCorte, corte ? 1 : 0);

  for (const p of PARTES) {
    if (!p.visible) continue;
    gl.uniform3fv(uColor, p.rgb);
    gl.uniform3f(uDesp, p.explosion[0] * explosion, p.explosion[1] * explosion, p.explosion[2] * explosion);
    gl.drawArrays(gl.TRIANGLES, p.inicio, p.cuenta);
  }
  requestAnimationFrame(dibujar);
}
requestAnimationFrame(dibujar);

// --- Interaccion ---
let arrastrando = false, ultimo = null;
const punto = (e) => (e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                               : { x: e.clientX, y: e.clientY });
function empezar(e) {
  arrastrando = true; automatico = false;
  document.getElementById("girar").setAttribute("aria-pressed", "false");
  ultimo = punto(e);
}
function mover(e) {
  if (!arrastrando) return;
  const p = punto(e);
  camara.giro += (p.x - ultimo.x) * 0.008;
  camara.altura = Math.max(-1.5, Math.min(1.5, camara.altura + (p.y - ultimo.y) * 0.008));
  ultimo = p;
  e.preventDefault();
}
lienzo.addEventListener("mousedown", empezar);
lienzo.addEventListener("touchstart", empezar, { passive: true });
addEventListener("mousemove", mover);
addEventListener("touchmove", mover, { passive: false });
addEventListener("mouseup", () => { arrastrando = false; });
addEventListener("touchend", () => { arrastrando = false; });
lienzo.addEventListener("wheel", (e) => {
  camara.zoom = Math.max(150, Math.min(900, camara.zoom + e.deltaY * 0.4));
  e.preventDefault();
}, { passive: false });

const rango = document.getElementById("explosion");
const salida = document.getElementById("valor");
rango.addEventListener("input", () => {
  explosion = rango.value / 100;
  salida.textContent = rango.value + " %";
});
document.getElementById("corte").onclick = (e) => {
  corte = !corte;
  e.currentTarget.setAttribute("aria-pressed", String(corte));
  if (corte) {
    // El corte se lleva la mitad superior: la camara se sube para mirar dentro.
    camara.giro = -1.15; camara.altura = 0.5; camara.zoom = 360;
    automatico = false;
    document.getElementById("girar").setAttribute("aria-pressed", "false");
  }
};
document.getElementById("girar").onclick = (e) => {
  automatico = !automatico; e.currentTarget.setAttribute("aria-pressed", String(automatico));
};
document.getElementById("reiniciar").onclick = () => {
  camara = { ...inicio };
  rango.value = 0; explosion = 0; salida.textContent = "0 %";
  corte = false; document.getElementById("corte").setAttribute("aria-pressed", "false");
  for (const p of PARTES) {
    p.visible = true;
    document.getElementById("p" + p.indice).setAttribute("aria-pressed", "true");
  }
};

for (const p of PARTES) {
  document.getElementById("p" + p.indice).onclick = (e) => {
    p.visible = !p.visible;
    e.currentTarget.setAttribute("aria-pressed", String(p.visible));
  };
}
</script>
"""


def html() -> str:
    piezas = motor.construir()

    crudo = bytearray()
    descripcion = []
    inicio = 0
    for indice, pieza in enumerate(piezas):
        for triangulo in pieza.triangulos:
            for vertice in triangulo:
                crudo += struct.pack("<3f", *vertice)
        cuenta = len(pieza.triangulos) * 3
        rgb = [int(pieza.color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        descripcion.append(
            "{"
            f'indice:{indice},nombre:"{pieza.nombre}",rgb:[{rgb[0]:.3f},{rgb[1]:.3f},{rgb[2]:.3f}],'
            f"inicio:{inicio},cuenta:{cuenta},explosion:[{','.join(f'{v:g}' for v in pieza.explosion)}],"
            "visible:true}"
        )
        inicio += cuenta

    lista = "".join(
        f'<button class="pieza" id="p{i}" aria-pressed="true">'
        f'<span class="chip" style="background:{p.color}"></span>'
        f"<span><b>{p.nombre}</b><small>{p.material} · {p.nota}</small></span>"
        f"<em>{p.masa:.0f} g</em></button>"
        for i, p in enumerate(piezas)
    )

    total_masa = sum(p.masa for p in piezas)
    total_tri = sum(len(p.triangulos) for p in piezas)
    ficha = [
        ("Potencia nominal", "0.75 kW", True),
        ("Polos / velocidad", "4 · 1400 min⁻¹", True),
        ("Tamano de carcasa", "IEC 80", False),
        ("Ranuras del estator", f"{motor.RANURAS}", False),
        ("Barras del rotor", f"{motor.BARRAS}", False),
        ("Entrehierro", f"{motor.ENTREHIERRO:g} mm", False),
        ("Paquete magnetico", f"Ø{motor.ESTATOR_DE:g} × {motor.PAQUETE:g} mm", False),
        ("Rodamientos", "2 × 6204-2RS", False),
        ("Eje de salida", "Ø19 mm", False),
        ("Masa estimada", f"{total_masa / 1000:.1f} kg", False),
        ("Piezas modeladas", f"{len(piezas)}", False),
        ("Triangulos", f"{total_tri:,}".replace(",", " "), False),
    ]
    cuadro = "".join(
        f'<div class="dato{" clave" if clave else ""}"><dt>{k}</dt><dd>{v}</dd></div>'
        for k, v, clave in ficha
    )

    return (
        CABECERA.replace("__PIEZAS__", str(len(piezas)))
        .replace("__TRIANGULOS__", f"{total_tri:,}".replace(",", " "))
        .replace("__LISTA__", lista)
        .replace("__FICHA__", cuadro)
        + CUERPO.replace("__PARTES__", "[" + ",".join(descripcion) + "]")
        .replace("__GEOMETRIA__", base64.b64encode(bytes(crudo)).decode())
    )


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else "visor.html"
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html())
    print(f"Visor 3D: {destino}  ({os.path.getsize(destino) / 1e6:.2f} MB)")
