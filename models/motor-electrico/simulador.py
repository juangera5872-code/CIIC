#!/usr/bin/env python3
"""Genera el simulador 3D del scooter en marcha (HTML + WebGL autocontenido).

La escena viene de `scooter.py` y la fisica es la misma de `prestaciones.py`:
los parametros del motor y del vehiculo se incrustan en la pagina, de modo que
el simulador no puede desviarse de los numeros del informe.

Uso:  python3 simulador.py [salida.html]
"""

from __future__ import annotations

import base64
import json
import os
import struct
import sys
from dataclasses import asdict

import prestaciones as pr
import scooter as sc

CABECERA = r"""<title>Scooter IEC 80 en Marcha</title>
<style>
  :root {
    --papel: #eef1f4; --placa: #ffffff; --tinta: #16202c; --grafito: #5b6a7a;
    --trazo: #d3dae1; --acento: #0b6f9c; --cota: #b8434a; --verde: #1b7f4b;
    --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
      --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d; --verde: #4ec98a;
    }
  }
  :root[data-theme="dark"] {
    --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
    --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d; --verde: #4ec98a;
  }
  body {
    margin: 0; background: var(--papel); color: var(--tinta);
    font-family: var(--sans); line-height: 1.5; -webkit-font-smoothing: antialiased;
  }
  .hoja {
    max-width: 1140px; margin: 0 auto; padding: 30px 20px 56px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .rotulo {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); margin: 0;
    display: flex; gap: 10px; align-items: center;
  }
  .rotulo::after { content: ""; flex: 1; height: 1px; background: var(--trazo); }
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.1; margin: 6px 0 0;
    letter-spacing: -0.025em; font-weight: 650;
  }
  h1 span { color: var(--acento); }
  .entrada { color: var(--grafito); margin: 8px 0 0; max-width: 66ch; }

  .taller { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 12px; }
  @media (max-width: 860px) { .taller { grid-template-columns: minmax(0, 1fr); } }
  .escena {
    position: relative; background: var(--placa); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  canvas { display: block; width: 100%; height: 62vh; min-height: 330px; touch-action: none; }
  .pista {
    position: absolute; left: 14px; bottom: 12px; pointer-events: none;
    font-family: var(--mono); font-size: 0.72rem; color: var(--grafito);
  }
  .velocimetro {
    position: absolute; left: 14px; top: 12px; pointer-events: none;
    font-family: var(--mono); font-variant-numeric: tabular-nums;
  }
  .velocimetro b { font-size: 2.6rem; font-weight: 500; letter-spacing: -0.03em; }
  .velocimetro span { font-size: 0.85rem; color: var(--grafito); margin-left: 6px; }

  .cuadro-mandos {
    background: var(--placa); border: 1px solid var(--trazo); border-radius: 4px;
    padding: 12px 14px; display: flex; flex-direction: column; gap: 9px;
    max-height: 62vh; overflow-y: auto;
  }
  .cuadro-mandos h2 {
    font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); font-weight: 500; margin: 0;
  }
  .aguja { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .aguja span { font-size: 0.8rem; color: var(--grafito); }
  .aguja b {
    font-family: var(--mono); font-size: 0.95rem; font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .barra { height: 5px; background: var(--trazo); border-radius: 3px; overflow: hidden; }
  .barra i { display: block; height: 100%; background: var(--acento); width: 0; }
  .barra.termica i { background: var(--verde); }
  .barra.termica.caliente i { background: var(--cota); }
  hr { border: 0; border-top: 1px solid var(--trazo); margin: 3px 0; }

  .mandos { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; }
  button {
    font: inherit; font-size: 0.85rem; padding: 8px 16px; border-radius: 3px;
    border: 1px solid var(--trazo); background: var(--placa); color: var(--tinta);
    cursor: pointer; transition: border-color .15s, color .15s;
  }
  button:hover { border-color: var(--grafito); }
  button[aria-pressed="true"] { border-color: var(--acento); color: var(--acento); }
  #marcha[aria-pressed="true"] { border-color: var(--verde); color: var(--verde); }
  :focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
  .deslizador {
    display: flex; align-items: center; gap: 10px; flex: 1 1 240px;
    background: var(--placa); border: 1px solid var(--trazo); border-radius: 3px;
    padding: 4px 14px;
  }
  .deslizador label { font-size: 0.85rem; white-space: nowrap; }
  .deslizador input { flex: 1; accent-color: var(--acento); }
  .deslizador output {
    font-family: var(--mono); font-size: 0.8rem; color: var(--grafito);
    font-variant-numeric: tabular-nums; min-width: 3.6em; text-align: right;
  }
  .nota { color: var(--grafito); font-size: 0.85rem; margin: 0; max-width: 74ch; }
  .aviso {
    border-left: 3px solid var(--cota); padding: 2px 0 2px 14px; margin: 6px 0 0;
    color: var(--grafito); font-size: 0.86rem; max-width: 74ch;
  }
  .aviso b { color: var(--tinta); font-weight: 550; }
</style>

<div class="hoja">
  <header>
    <p class="rotulo">Simulacion en tiempo real · fisica y geometria del mismo modelo</p>
    <h1>Scooter con motor <span>IEC 80</span> en marcha</h1>
    <p class="entrada">
      Acelera y mira que pasa: las ruedas giran a la velocidad que sale de integrar la
      ecuacion longitudinal, el pinon Ø30 gira 5.5 veces mas rapido que la corona, y el
      cuadro de la derecha dice a cada instante que par esta dando el motor y a que coste.
    </p>
  </header>

  <div class="mandos">
    <button id="marcha" aria-pressed="false">Arrancar</button>
    <div class="deslizador">
      <label for="acelerador">Acelerador</label>
      <input id="acelerador" type="range" min="0" max="100" value="0" step="1">
      <output id="v-acelerador">0 %</output>
    </div>
    <div class="deslizador">
      <label for="pendiente">Pendiente</label>
      <input id="pendiente" type="range" min="-5" max="15" value="0" step="0.5">
      <output id="v-pendiente">0 %</output>
    </div>
    <button id="sobrecarga" aria-pressed="false">Sobrecarga 2.9×</button>
    <button id="freno">Frenar</button>
    <button id="reiniciar">Reiniciar</button>
  </div>

  <div class="taller">
    <div class="escena">
      <canvas id="lienzo" aria-label="Scooter en marcha, vista 3D girable"></canvas>
      <div class="velocimetro"><b id="kmh">0</b><span>km/h</span></div>
      <span class="pista">Arrastra para girar · rueda para acercar · ↑ acelera, ↓ frena</span>
    </div>

    <div class="cuadro-mandos">
      <h2>Motor</h2>
      <div class="aguja"><span>Regimen</span><b id="rpm">0 min⁻¹</b></div>
      <div class="aguja"><span>Par</span><b id="par">0.00 N·m</b></div>
      <div class="barra"><i id="b-par"></i></div>
      <div class="aguja"><span>Potencia</span><b id="pot">0 W</b></div>
      <div class="barra"><i id="b-pot"></i></div>
      <div class="aguja"><span>Reserva termica</span><b id="termica">100 %</b></div>
      <div class="barra termica"><i id="b-termica" style="width:100%"></i></div>
      <hr>
      <h2>Vehiculo</h2>
      <div class="aguja"><span>Traccion</span><b id="traccion">0 N</b></div>
      <div class="aguja"><span>Resistencia</span><b id="resistencia">0 N</b></div>
      <div class="aguja"><span>Aceleracion</span><b id="acel">0.00 m/s²</b></div>
      <div class="aguja"><span>Distancia</span><b id="distancia">0.00 km</b></div>
      <hr>
      <h2>Bateria</h2>
      <div class="aguja"><span>Carga</span><b id="carga">100 %</b></div>
      <div class="barra"><i id="b-carga" style="width:100%"></i></div>
      <div class="aguja"><span>Consumo medio</span><b id="consumo">— Wh/km</b></div>
      <div class="aguja"><span>Autonomia</span><b id="autonomia">— km</b></div>
    </div>
  </div>

  <p class="aviso" id="aviso" hidden><b>Proteccion termica activa.</b>
    La reserva se ha agotado: el par vuelve al valor continuo hasta que el motor se enfrie.</p>

  <p class="nota">
    La integracion usa el mismo modelo que la hoja de prestaciones: par constante hasta
    1400 min⁻¹ y potencia constante por encima, resistencia de rodadura mas aerodinamica
    mas pendiente, y un factor de 1.08 por las masas en rotacion. La reserva termica es un
    modelo I²t sencillo: se consume con el cuadrado del par y se recupera en cuanto bajas
    del par nominal. No hay marcha atras ni deriva: el scooter no rueda hacia atras en
    pendiente, se queda parado.
  </p>
</div>
"""

CUERPO = r"""
<script>
const PARTES = __PARTES__;
const P = __PARAMETROS__;   // mismos valores que prestaciones.py
const vertices = new Float32Array(
  Uint8Array.from(atob("__GEOMETRIA__"), (c) => c.charCodeAt(0)).buffer
);

const normales = new Float32Array(vertices.length);
for (let i = 0; i < vertices.length; i += 9) {
  const ax = vertices[i+3]-vertices[i], ay = vertices[i+4]-vertices[i+1], az = vertices[i+5]-vertices[i+2];
  const bx = vertices[i+6]-vertices[i], by = vertices[i+7]-vertices[i+1], bz = vertices[i+8]-vertices[i+2];
  let nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
  const l = Math.hypot(nx, ny, nz) || 1;
  for (let k = 0; k < 3; k++) {
    normales[i+k*3] = nx/l; normales[i+k*3+1] = ny/l; normales[i+k*3+2] = nz/l;
  }
}

const lienzo = document.getElementById("lienzo");
const gl = lienzo.getContext("webgl", { antialias: true });

const VS = `
attribute vec3 posicion; attribute vec3 normal;
uniform mat4 modelo, vista, proyeccion;
uniform vec3 pivote, desplazamiento;
uniform float giro;
varying vec3 vNormal, vOjo;
void main() {
  // Giro de la pieza alrededor de su propio eje (ruedas, pinon) y desfile del
  // decorado. Con giro = 0 y pivote = 0 esto es la identidad.
  vec3 p = posicion - pivote;
  float c = cos(giro), s = sin(giro);
  p = vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z) + pivote + desplazamiento;
  vec3 n = vec3(normal.x * c - normal.y * s, normal.x * s + normal.y * c, normal.z);
  vNormal = mat3(modelo) * n;
  vec4 mundo = modelo * vec4(p, 1.0);
  vOjo = (vista * mundo).xyz;
  gl_Position = proyeccion * vista * mundo;
}`;

const FS = `
precision mediump float;
varying vec3 vNormal, vOjo;
uniform vec3 color;
void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 luz = normalize(vec3(0.35, 0.9, 0.45));
  float dif = max(dot(n, luz), 0.0);
  float ambiente = 0.36 + 0.28 * max(dot(n, normalize(vec3(-0.6, 0.1, 0.7))), 0.0);
  float esp = pow(max(dot(reflect(-luz, n), normalize(-vOjo)), 0.0), 24.0) * 0.22;
  gl_FragColor = vec4(color * (ambiente + 0.66 * dif) + esp, 1.0);
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

const U = {};
for (const n of ["modelo","vista","proyeccion","color","pivote","desplazamiento","giro"]) {
  U[n] = gl.getUniformLocation(programa, n);
}
gl.enable(gl.DEPTH_TEST);

function multiplicar(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) r[j*4+i] += a[k*4+i] * b[j*4+k];
  return r;
}
const rotX = (t) => [1,0,0,0, 0,Math.cos(t),Math.sin(t),0, 0,-Math.sin(t),Math.cos(t),0, 0,0,0,1];
const rotY = (t) => [Math.cos(t),0,-Math.sin(t),0, 0,1,0,0, Math.sin(t),0,Math.cos(t),0, 0,0,0,1];
const trasladar = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
function perspectiva(fov, aspecto, cerca, lejos) {
  const f = 1 / Math.tan(fov / 2);
  return [f/aspecto,0,0,0, 0,f,0,0, 0,0,(lejos+cerca)/(cerca-lejos),-1, 0,0,2*lejos*cerca/(cerca-lejos),0];
}

// --- Estado y fisica -----------------------------------------------------------

// Camara del lado de la transmision (z negativa), que es donde estan
// el pinon, la cadena y la corona.
const inicio = { giro: 2.52, altura: 0.2, zoom: 3300 };
let camara = { ...inicio };
const estado = {
  v: 0, distancia: 0, energia: P.scooter.bateria * 3600, // J
  termica: 1, protegido: false, marcha: false, acelerador: 0,
  pendiente: 0, sobrecarga: false, frenando: false,
  par: 0, potencia: 0, traccion: 0, resistencia: 0, aceleracion: 0,
};

const parNominal = P.motor.potencia / (P.motor.velocidad_nominal * 2 * Math.PI / 60);
const G = 9.81;

const rpmDe = (v) => v / P.scooter.radio_rueda * 60 / (2 * Math.PI) * P.scooter.reduccion;

function parDisponible(rpm) {
  // Envolvente del variador: par constante hasta la nominal, luego potencia constante.
  if (rpm > P.motor.velocidad_max_variador) return 0;
  if (rpm <= P.motor.velocidad_nominal) return parNominal;
  return parNominal * P.motor.velocidad_nominal / rpm;
}

function resistencia(v, pendiente) {
  const angulo = Math.atan(pendiente);
  const s = P.scooter;
  const masa = s.masa_vehiculo + s.masa_conductor;
  return masa * G * s.resistencia_rodadura * Math.cos(angulo)
       + 0.5 * s.densidad_aire * s.area_frontal_cd * v * v
       + masa * G * Math.sin(angulo);
}

function paso(dt) {
  const s = P.scooter;
  const masa = s.masa_vehiculo + s.masa_conductor;
  const rpm = rpmDe(estado.v);

  // Techo de par: continuo, o hasta 2.9 x mientras quede reserva termica.
  const techo = (estado.sobrecarga && !estado.protegido) ? P.motor.par_max_rel : 1;
  const par = estado.marcha ? parDisponible(rpm) * techo * estado.acelerador : 0;

  const traccion = par * s.reduccion * s.rendimiento_transmision / s.radio_rueda;
  const resist = resistencia(estado.v, estado.pendiente);
  const freno = estado.frenando ? 420 : 0;
  let a = (traccion - resist - Math.sign(estado.v) * freno) / (masa * s.inercia_equivalente);

  let v = estado.v + a * dt;
  if (v < 0) { v = 0; a = 0; }                       // no se modela marcha atras
  if (rpmDe(v) > P.motor.velocidad_max_variador) v = estado.v;

  // Modelo I²t: la reserva cae con el cuadrado del par relativo al nominal. La
  // constante esta ajustada a ~30 s de sobrecarga plena y ~3.5 min de enfriado.
  const relativo = par / parNominal;
  const exceso = relativo * relativo - 1;
  estado.termica = Math.min(1, Math.max(0, estado.termica - exceso * dt / 220));
  if (estado.termica <= 0) estado.protegido = true;
  if (estado.protegido && estado.termica > 0.35) estado.protegido = false;

  const potencia = par * rpm * 2 * Math.PI / 60;
  const consumida = potencia > 0 ? potencia / P.motor.rendimiento : 0;
  estado.energia = Math.max(0, estado.energia - consumida * dt);
  if (estado.energia <= 0) estado.marcha = false;

  Object.assign(estado, {
    v, par, potencia, traccion, resistencia: resist, aceleracion: a,
    distancia: estado.distancia + v * dt,
  });
}

// --- Cuadro de mandos ----------------------------------------------------------

const $ = (id) => document.getElementById(id);
const ancho = (id, fraccion) => { $(id).style.width = Math.max(0, Math.min(1, fraccion)) * 100 + "%"; };

function refrescar() {
  const rpm = rpmDe(estado.v);
  $("kmh").textContent = (estado.v * 3.6).toFixed(0);
  $("rpm").textContent = rpm.toFixed(0) + " min⁻¹";
  $("par").textContent = estado.par.toFixed(2) + " N·m";
  ancho("b-par", estado.par / (parNominal * P.motor.par_max_rel));
  $("pot").textContent = estado.potencia.toFixed(0) + " W";
  ancho("b-pot", estado.potencia / (P.motor.potencia * 2));
  $("termica").textContent = (estado.termica * 100).toFixed(0) + " %";
  ancho("b-termica", estado.termica);
  $("b-termica").parentElement.classList.toggle("caliente", estado.termica < 0.35);
  $("aviso").hidden = !estado.protegido;

  $("traccion").textContent = estado.traccion.toFixed(0) + " N";
  $("resistencia").textContent = estado.resistencia.toFixed(0) + " N";
  $("acel").textContent = estado.aceleracion.toFixed(2) + " m/s²";
  $("distancia").textContent = (estado.distancia / 1000).toFixed(2) + " km";

  const total = P.scooter.bateria * 3600;
  const carga = estado.energia / total;
  $("carga").textContent = (carga * 100).toFixed(0) + " %";
  ancho("b-carga", carga);
  const km = estado.distancia / 1000;
  if (km > 0.05) {
    const wh = (total - estado.energia) / 3600 / km;
    $("consumo").textContent = wh.toFixed(1) + " Wh/km";
    $("autonomia").textContent = (estado.energia / 3600 / wh).toFixed(0) + " km";
  }
}

// --- Bucle ---------------------------------------------------------------------

const raiz = getComputedStyle(document.documentElement);
function tono(nombre) {
  const hex = raiz.getPropertyValue(nombre).trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

let anterior = performance.now();
function dibujar(ahora) {
  const dt = Math.min((ahora - anterior) / 1000, 0.05);
  anterior = ahora;
  if (estado.marcha || estado.v > 0) paso(dt);
  refrescar();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(lienzo.clientWidth * dpr), h = Math.round(lienzo.clientHeight * dpr);
  if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }
  gl.viewport(0, 0, w, h);
  gl.clearColor(...tono("--placa"), 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const modelo = multiplicar(multiplicar(rotX(camara.altura), rotY(camara.giro)),
                             trasladar(0, -620, 0));
  gl.uniformMatrix4fv(U.modelo, false, modelo);
  gl.uniformMatrix4fv(U.vista, false, trasladar(0, 0, -camara.zoom));
  gl.uniformMatrix4fv(U.proyeccion, false, perspectiva(0.75, w / h, 100, 30000));

  const anguloRueda = -estado.distancia / P.scooter.radio_rueda / 1000;
  for (const p of PARTES) {
    gl.uniform3fv(U.color, p.rgb);
    gl.uniform3fv(U.pivote, p.pivote);
    gl.uniform1f(U.giro, p.factor ? anguloRueda * p.factor : 0);
    const desfile = p.arrastre ? -((estado.distancia * 1000) % p.arrastre) : 0;
    gl.uniform3f(U.desplazamiento, desfile, 0, 0);
    gl.drawArrays(gl.TRIANGLES, p.inicio, p.cuenta);
  }
  requestAnimationFrame(dibujar);
}
requestAnimationFrame(dibujar);

// --- Mandos --------------------------------------------------------------------

let arrastrando = false, ultimo = null;
const punto = (e) => (e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                                : { x: e.clientX, y: e.clientY });
lienzo.addEventListener("mousedown", (e) => { arrastrando = true; ultimo = punto(e); });
lienzo.addEventListener("touchstart", (e) => { arrastrando = true; ultimo = punto(e); }, { passive: true });
addEventListener("mousemove", (e) => {
  if (!arrastrando) return;
  const p = punto(e);
  camara.giro += (p.x - ultimo.x) * 0.008;
  camara.altura = Math.max(-0.2, Math.min(1.2, camara.altura + (p.y - ultimo.y) * 0.006));
  ultimo = p;
});
addEventListener("touchmove", (e) => {
  if (!arrastrando) return;
  const p = punto(e);
  camara.giro += (p.x - ultimo.x) * 0.008;
  camara.altura = Math.max(-0.2, Math.min(1.2, camara.altura + (p.y - ultimo.y) * 0.006));
  ultimo = p; e.preventDefault();
}, { passive: false });
addEventListener("mouseup", () => { arrastrando = false; });
addEventListener("touchend", () => { arrastrando = false; });
lienzo.addEventListener("wheel", (e) => {
  camara.zoom = Math.max(1200, Math.min(9000, camara.zoom + e.deltaY * 3));
  e.preventDefault();
}, { passive: false });

const acelerador = $("acelerador"), pendiente = $("pendiente");
acelerador.addEventListener("input", () => {
  estado.acelerador = acelerador.value / 100;
  $("v-acelerador").textContent = acelerador.value + " %";
});
pendiente.addEventListener("input", () => {
  estado.pendiente = pendiente.value / 100;
  $("v-pendiente").textContent = (+pendiente.value).toFixed(1) + " %";
});
$("marcha").onclick = (e) => {
  estado.marcha = !estado.marcha;
  e.currentTarget.setAttribute("aria-pressed", String(estado.marcha));
  e.currentTarget.textContent = estado.marcha ? "En marcha" : "Arrancar";
};
$("sobrecarga").onclick = (e) => {
  estado.sobrecarga = !estado.sobrecarga;
  e.currentTarget.setAttribute("aria-pressed", String(estado.sobrecarga));
};
const frenar = (activo) => { estado.frenando = activo; $("freno").setAttribute("aria-pressed", String(activo)); };
$("freno").addEventListener("mousedown", () => frenar(true));
$("freno").addEventListener("touchstart", () => frenar(true), { passive: true });
addEventListener("mouseup", () => frenar(false));
addEventListener("touchend", () => frenar(false));
$("reiniciar").onclick = () => {
  Object.assign(estado, {
    v: 0, distancia: 0, energia: P.scooter.bateria * 3600, termica: 1,
    protegido: false, marcha: false, acelerador: 0, sobrecarga: false, frenando: false,
    par: 0, potencia: 0, traccion: 0, resistencia: 0, aceleracion: 0,
  });
  acelerador.value = 0; $("v-acelerador").textContent = "0 %";
  camara = { ...inicio };
  $("marcha").setAttribute("aria-pressed", "false");
  $("marcha").textContent = "Arrancar";
  $("sobrecarga").setAttribute("aria-pressed", "false");
  $("consumo").textContent = "— Wh/km"; $("autonomia").textContent = "— km";
};

addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    estado.marcha = true;
    $("marcha").setAttribute("aria-pressed", "true");
    $("marcha").textContent = "En marcha";
    acelerador.value = Math.min(100, +acelerador.value + 8);
    acelerador.dispatchEvent(new Event("input"));
    e.preventDefault();
  }
  if (e.key === "ArrowDown") { frenar(true); e.preventDefault(); }
});
addEventListener("keyup", (e) => { if (e.key === "ArrowDown") frenar(false); });
</script>
"""


def html() -> str:
    partes = sc.escena()
    crudo = bytearray()
    descripcion, inicio = [], 0
    for parte in partes:
        for triangulo in parte.triangulos:
            for vertice in triangulo:
                crudo += struct.pack("<3f", *vertice)
        cuenta = len(parte.triangulos) * 3
        rgb = [int(parte.color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        pivote = parte.pivote or (0.0, 0.0)
        descripcion.append(
            f'{{nombre:"{parte.nombre}",rgb:[{rgb[0]:.3f},{rgb[1]:.3f},{rgb[2]:.3f}],'
            f"inicio:{inicio},cuenta:{cuenta},"
            f"pivote:[{pivote[0]:g},{pivote[1]:g},0],factor:{parte.factor_giro:g},"
            f"arrastre:{parte.arrastre:g}}}"
        )
        inicio += cuenta

    parametros = {"motor": asdict(pr.Motor()), "scooter": asdict(pr.Scooter())}
    return (CABECERA + CUERPO
            .replace("__PARTES__", "[" + ",".join(descripcion) + "]")
            .replace("__PARAMETROS__", json.dumps(parametros))
            .replace("__GEOMETRIA__", base64.b64encode(bytes(crudo)).decode()))


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else "simulador.html"
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html())
    print(f"Simulador 3D: {destino}  ({os.path.getsize(destino) / 1e6:.2f} MB)")
