#!/usr/bin/env python3
"""Genera la hoja de prestaciones: curvas del motor y simulacion del scooter.

Toma los numeros de `prestaciones.py`, dibuja las graficas con `grafica.py` y
escribe una pagina autocontenida (SVG en linea + una capa de interaccion en JS).

Uso:  python3 informe.py [salida.html]
"""

from __future__ import annotations

import sys

import grafica as gr
import prestaciones as pr

S1, S2 = "var(--serie-1)", "var(--serie-2)"


def graficas(motor: pr.Motor, scooter: pr.Scooter, datos: dict) -> dict:
    curvas = pr.curvas(motor, scooter)

    # 1. Par contra velocidad
    par = [
        gr.Serie("Arranque directo a 50 Hz",
                 [(p["rpm"], p["par"]) for p in curvas["directo"]], S1,
                 etiqueta="Directo", etiqueta_en="inicio", unidad="N·m",
                 hitos=[(motor.velocidad_sincrona * (1 - motor.deslizamiento_critico),
                         motor.par_maximo, f"vuelco {motor.par_maximo:.1f}")]),
        gr.Serie("Con variador",
                 [(p["rpm"], p["par"]) for p in curvas["variador"]], S2,
                 etiqueta="Variador", unidad="N·m",
                 hitos=[(motor.velocidad_nominal, motor.par_nominal,
                         f"nominal {motor.par_nominal:.2f}")]),
    ]

    # 2. Potencia contra velocidad (grafica aparte: nunca dos escalas en un eje)
    potencia = [
        gr.Serie("Arranque directo a 50 Hz",
                 [(p["rpm"], p["potencia"]) for p in curvas["directo"]], S1,
                 etiqueta="Directo", etiqueta_en="max", unidad="W"),
        gr.Serie("Con variador",
                 [(p["rpm"], p["potencia"]) for p in curvas["variador"]], S2,
                 etiqueta="Variador", unidad="W",
                 hitos=[(motor.velocidad_nominal, motor.potencia, "750 W")]),
    ]

    # 3. Diagrama de traccion: la resistencia es una familia (misma tinta, trazo distinto)
    marcha = curvas["marcha"]
    punta = datos["scooter"]["velocidad_punta_kmh"]
    traccion = [
        gr.Serie("Traccion en la rueda", [(m["kmh"], m["traccion"]) for m in marcha], S1,
                 etiqueta="Traccion", etiqueta_en="max", unidad="N",
                 hitos=[(punta, next(m["resistencia_0"] for m in marcha if m["kmh"] >= punta),
                         f"punta {punta:.0f} km/h")]),
        gr.Serie("Resistencia en llano", [(m["kmh"], m["resistencia_0"]) for m in marcha], S2,
                 etiqueta="Llano", unidad="N"),
        gr.Serie("Resistencia al 5 %", [(m["kmh"], m["resistencia_5"]) for m in marcha], S2,
                 trazo="8 5", etiqueta="5 %", unidad="N"),
        gr.Serie("Resistencia al 10 %", [(m["kmh"], m["resistencia_10"]) for m in marcha], S2,
                 trazo="2 5", etiqueta="10 %", unidad="N"),
    ]

    # 4. Aceleracion: se integra casi hasta la punta para que se vea aplanarse
    _, larga = pr.aceleracion(motor, scooter, datos["scooter"]["velocidad_punta_kmh"] - 1.5)
    historia = [{"t": t, "kmh": v} for t, v, _ in larga]
    v25 = datos["scooter"]["t_0_25_s"]
    aceleracion = [
        gr.Serie("Velocidad", [(p["t"], p["kmh"]) for p in historia], S1,
                 unidad="km/h",
                 hitos=[(v25, 25, f"0-25 en {v25:.1f} s")]),
    ]

    return {
        "par": gr.grafica("g-par", par, "Par contra velocidad", "min⁻¹", "N·m", x_max=3000),
        "potencia": gr.grafica("g-pot", potencia, "Potencia contra velocidad", "min⁻¹", "W", x_max=3000),
        "traccion": gr.grafica("g-tra", traccion, "Traccion contra resistencia", "km/h", "N", y_max=380),
        "aceleracion": gr.grafica("g-ace", aceleracion, "Aceleracion", "s", "km/h"),
    }


def tarjeta(rotulo: str, valor: str, apunte: str, clave: bool = False) -> str:
    return (f'<div class="dato{" clave" if clave else ""}"><dt>{rotulo}</dt>'
            f"<dd>{valor}</dd><small>{apunte}</small></div>")


def html() -> str:
    motor, scooter = pr.Motor(), pr.Scooter()
    datos = pr.informe(motor, scooter)
    m, v = datos["motor"], datos["scooter"]
    g = graficas(motor, scooter, datos)

    maquina = "".join([
        tarjeta("Par nominal", f"{m['par_nominal_Nm']:.2f} N·m", "en el eje, a plena carga", True),
        tarjeta("Velocidad", f"{m['velocidad_nominal_rpm']:.0f} min⁻¹",
                f"sincrona 1500, deslizamiento {m['deslizamiento_nominal_pct']:.1f} %", True),
        tarjeta("Potencia", f"{m['potencia_W'] / 1000:.2f} kW", "0.75 kW · 1 CV", True),
        tarjeta("Par de arranque", f"{m['par_arranque_Nm']:.1f} N·m", "2.3 × nominal"),
        tarjeta("Par de vuelco", f"{m['par_maximo_Nm']:.1f} N·m",
                f"2.9 × nominal, a s = {m['deslizamiento_critico_pct']:.0f} %"),
        tarjeta("Corriente", f"{m['corriente_nominal_A']:.2f} A",
                f"{m['corriente_arranque_A']:.1f} A en arranque directo"),
    ])

    rueda = "".join([
        tarjeta("Traccion maxima", f"{v['traccion_max_N']:.0f} N",
                f"{v['par_rueda_Nm']:.0f} N·m en la rueda", True),
        tarjeta("Velocidad punta", f"{v['velocidad_punta_kmh']:.0f} km/h",
                f"base {v['velocidad_base_kmh']:.0f} km/h, luego potencia constante", True),
        tarjeta("0 a 25 km/h", f"{v['t_0_25_s']:.1f} s",
                f"0-30 en {v['t_0_30_s']:.1f} s, 0-35 en {v['t_0_35_s']:.1f} s", True),
        tarjeta("Rampa continua", f"{v['rampa_continua_pct']:.0f} %",
                f"hasta {v['rampa_puntual_pct']:.0f} % con el par de sobrecarga"),
        tarjeta("Consumo a 30 km/h", f"{v['consumo_30']['consumo_Wh_km']:.1f} Wh/km",
                f"{v['consumo_30']['potencia_bateria_W']:.0f} W de la bateria"),
        tarjeta("Autonomia", f"{v['consumo_30']['autonomia_km']:.0f} km",
                "con 960 Wh (48 V · 20 Ah) a 30 km/h"),
    ])

    tabla = "".join(
        f"<tr><td>{n}</td><td>{par:.2f}</td><td>{pot:.0f}</td></tr>"
        for n, par, pot in [
            (n, motor.par_variador(n), motor.potencia_en(n, motor.par_variador(n)))
            for n in range(0, 3001, 250)
        ]
    )

    svgs = {k: val[0] for k, val in g.items()}
    series = "[" + ",".join(val[1] for val in g.values()) + "]"

    return (PLANTILLA
            .replace("__MAQUINA__", maquina)
            .replace("__RUEDA__", rueda)
            .replace("__G_PAR__", svgs["par"])
            .replace("__G_POT__", svgs["potencia"])
            .replace("__G_TRA__", svgs["traccion"])
            .replace("__G_ACE__", svgs["aceleracion"])
            .replace("__TABLA__", tabla)
            .replace("__SERIES__", series))


PLANTILLA = r"""<title>Motor IEC 80 en un Scooter</title>
<style>
  :root {
    --papel: #eef1f4; --placa: #ffffff; --tinta: #16202c; --grafito: #5b6a7a;
    --trazo: #d3dae1; --acento: #0b6f9c; --cota: #b8434a;
    --serie-1: #2a78d6; --serie-2: #eb6834;
    --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
      --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d;
      --serie-1: #3987e5; --serie-2: #d95926;
    }
  }
  :root[data-theme="dark"] {
    --papel: #0d151d; --placa: #141f2b; --tinta: #e6edf3; --grafito: #93a3b4;
    --trazo: #24333f; --acento: #4cb3e0; --cota: #e8878d;
    --serie-1: #3987e5; --serie-2: #d95926;
  }

  body {
    margin: 0; background: var(--papel); color: var(--tinta);
    font-family: var(--sans); line-height: 1.5; -webkit-font-smoothing: antialiased;
  }
  .hoja {
    max-width: 900px; margin: 0 auto; padding: 32px 20px 64px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .rotulo {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); margin: 0;
    display: flex; gap: 10px; align-items: center;
  }
  .rotulo::after { content: ""; flex: 1; height: 1px; background: var(--trazo); }
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.3rem); line-height: 1.1; margin: 6px 0 0;
    letter-spacing: -0.025em; text-wrap: balance; font-weight: 650;
  }
  h1 span { color: var(--acento); }
  .entrada { color: var(--grafito); margin: 8px 0 0; max-width: 64ch; }

  h2 {
    font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--grafito); font-weight: 500;
    margin: 22px 0 0; display: flex; gap: 10px; align-items: center;
  }
  h2::after { content: ""; flex: 1; height: 1px; background: var(--trazo); }

  .cuadro {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
    gap: 1px; background: var(--trazo); border: 1px solid var(--trazo);
    border-radius: 4px; overflow: hidden;
  }
  .dato { background: var(--placa); padding: 13px 15px; display: flex; flex-direction: column; gap: 2px; }
  .dato dt { font-size: 0.75rem; color: var(--grafito); }
  .dato dd {
    margin: 0; font-family: var(--mono); font-size: 1.25rem; font-weight: 500;
    font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
  }
  .dato.clave dd { color: var(--cota); }
  .dato small { color: var(--grafito); font-size: 0.72rem; }

  figure {
    margin: 0; background: var(--placa); border: 1px solid var(--trazo);
    border-radius: 4px; padding: 14px 16px 8px; position: relative;
  }
  figcaption { font-size: 0.92rem; font-weight: 550; margin-bottom: 2px; }
  figcaption + p { margin: 0 0 6px; color: var(--grafito); font-size: 0.8rem; }
  .leyenda { display: flex; flex-wrap: wrap; gap: 14px; margin: 4px 0 8px; }
  .leyenda span { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--grafito); }
  .leyenda i { width: 16px; height: 2px; display: inline-block; }
  .grafica { width: 100%; height: auto; display: block; overflow: visible; touch-action: pan-y; }
  .rejilla { stroke: var(--trazo); stroke-width: 1; }
  .eje { stroke: var(--grafito); stroke-width: 1; opacity: 0.5; }
  .linea { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .tick, .rotulo-eje, .anotacion, .directa {
    font-family: var(--mono); font-size: 11px; fill: var(--grafito);
  }
  .directa { font-size: 12px; }
  .anotacion { fill: var(--tinta); font-size: 11px; }
  .hito { stroke: var(--placa); stroke-width: 2; }
  .foco { stroke: var(--placa); stroke-width: 2; }
  .cruz { stroke: var(--grafito); stroke-width: 1; stroke-dasharray: 3 3; }
  /* El atributo hidden de HTML no oculta un elemento SVG por si solo. */
  .foco[hidden], .cruz[hidden] { display: none; }
  .globo {
    position: absolute; pointer-events: none; background: var(--placa);
    border: 1px solid var(--trazo); border-radius: 3px; padding: 7px 10px;
    font-size: 0.78rem; box-shadow: 0 6px 18px rgb(0 0 0 / 0.10); white-space: nowrap;
  }
  .globo b { font-family: var(--mono); font-weight: 500; font-variant-numeric: tabular-nums; }
  .globo div { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
  .globo i { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }

  details { background: var(--placa); border: 1px solid var(--trazo); border-radius: 4px; padding: 10px 14px; }
  summary { cursor: pointer; font-size: 0.85rem; color: var(--grafito); }
  .desborde { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 0.85rem; }
  th, td { text-align: right; padding: 5px 10px; border-bottom: 1px solid var(--trazo); font-variant-numeric: tabular-nums; }
  th:first-child, td:first-child { text-align: left; }
  th { color: var(--grafito); font-weight: 500; }
  td { font-family: var(--mono); }

  .aviso {
    border-left: 3px solid var(--cota); padding: 2px 0 2px 14px;
    color: var(--grafito); font-size: 0.88rem; max-width: 70ch;
  }
  .aviso b { color: var(--tinta); font-weight: 550; }
  .nota { color: var(--grafito); font-size: 0.85rem; max-width: 72ch; }
  :focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
</style>

<div class="hoja">
  <header>
    <p class="rotulo">Motor asincrono IEC 80 · 0.75 kW · 4 polos</p>
    <h1>Par, velocidad y potencia <span>en un scooter</span></h1>
    <p class="entrada">
      Primero lo que da la maquina en su eje; despues lo que eso significa empujando
      133 kg por la calle, con una reduccion de 5.5:1 desde el pinon de Ø30.
    </p>
  </header>

  <h2>La maquina</h2>
  <dl class="cuadro">__MAQUINA__</dl>

  <figure>
    <figcaption>Par contra velocidad</figcaption>
    <p>Arranque directo a 50 Hz (formula de Kloss) frente a la envolvente con variador.</p>
    <div class="leyenda">
      <span><i style="background:var(--serie-1)"></i>Arranque directo a 50 Hz</span>
      <span><i style="background:var(--serie-2)"></i>Con variador</span>
    </div>
    __G_PAR__
  </figure>

  <figure>
    <figcaption>Potencia contra velocidad</figcaption>
    <p>La misma informacion en potencia. Con variador el par es constante hasta 1400 min⁻¹
       y a partir de ahi se mantiene la potencia debilitando campo.</p>
    <div class="leyenda">
      <span><i style="background:var(--serie-1)"></i>Arranque directo a 50 Hz</span>
      <span><i style="background:var(--serie-2)"></i>Con variador</span>
    </div>
    __G_POT__
  </figure>

  <h2>El scooter</h2>
  <dl class="cuadro">__RUEDA__</dl>

  <figure>
    <figcaption>Traccion contra resistencia al avance</figcaption>
    <p>Donde se cruzan las dos curvas esta la velocidad de equilibrio. En llano son
       41 km/h; al 10 % la resistencia queda por encima de la traccion a cualquier
       velocidad, asi que esa rampa no se sube en regimen continuo.</p>
    <div class="leyenda">
      <span><i style="background:var(--serie-1)"></i>Traccion en la rueda</span>
      <span><i style="background:var(--serie-2)"></i>Resistencia en llano</span>
      <span><i style="background:var(--serie-2);height:0;border-top:2px dashed var(--serie-2)"></i>Rampa 5 %</span>
      <span><i style="background:var(--serie-2);height:0;border-top:2px dotted var(--serie-2)"></i>Rampa 10 %</span>
    </div>
    __G_TRA__
  </figure>

  <figure>
    <figcaption>Aceleracion desde parado</figcaption>
    <p>Integracion de la ecuacion longitudinal con un factor de masas rotativas de 1.08.</p>
    __G_ACE__
  </figure>

  <details>
    <summary>Ver los datos en tabla (envolvente con variador)</summary>
    <div class="desborde">
      <table>
        <thead><tr><th>Velocidad (min⁻¹)</th><th>Par (N·m)</th><th>Potencia (W)</th></tr></thead>
        <tbody>__TABLA__</tbody>
      </table>
    </div>
  </details>

  <h2>Lo que hay que asumir</h2>
  <p class="aviso">
    <b>Este motor no es el que pondrias en un scooter.</b> Pesa 12 kg para 0.75 kW y esta
    bobinado a 400 V / 50 Hz: para moverlo con una bateria de 48 V habria que rebobinar el
    estator a baja tension o llevar un paquete de alta. Un scooter real usa un motor sincrono
    de imanes permanentes, casi siempre en el buje, con la mitad de masa y mejor rendimiento a
    carga parcial. La simulacion vale como ejercicio de traccion, no como propuesta de producto.
  </p>
  <p class="nota">
    Hipotesis: 58 kg de vehiculo mas 75 kg de conductor, rueda de 10 pulgadas (radio 0.22 m),
    coeficiente de rodadura 0.012, Cd·A 0.60 m², rendimiento de transmision 92 %, rendimiento
    del motor 78 %, bateria de 960 Wh. El par de arranque, el de vuelco y el rendimiento son
    valores tipicos de catalogo para un IE2 de este tamano, no medidas del modelo 3D: la
    geometria fija las dimensiones, no el comportamiento electromagnetico.
  </p>
</div>

<script>
const GRAFICAS = __SERIES__;

function montar(g) {
  const svg = document.getElementById(g.id);
  const captura = document.getElementById(g.id + "-captura");
  const cruz = document.getElementById(g.id + "-cruz");
  const focos = g.series.map((_, i) => document.getElementById(`${g.id}-foco-${i}`));
  const figura = svg.closest("figure");
  const globo = document.createElement("div");
  globo.className = "globo";
  globo.hidden = true;
  figura.appendChild(globo);

  const c = g.caja;
  const aX = (x) => c.ix + (x - c.x0) / (c.x1 - c.x0) * (c.w - c.ix - c.id);
  const aY = (y) => c.h - c.ib - (y - c.y0) / (c.y1 - c.y0) * (c.h - c.ia - c.ib);
  const colores = g.series.map((_, i) => focos[i].getAttribute("fill"));

  function mostrar(evento) {
    const caja = svg.getBoundingClientRect();
    const escala = c.w / caja.width;
    const px = (evento.clientX - caja.left) * escala;
    const x = c.x0 + (px - c.ix) / (c.w - c.ix - c.id) * (c.x1 - c.x0);

    const filas = [];
    g.series.forEach((serie, i) => {
      // Punto de la serie mas cercano en X; las series no comparten muestreo.
      let mejor = null, dist = Infinity;
      for (const [sx, sy] of serie.puntos) {
        const d = Math.abs(sx - x);
        if (d < dist) { dist = d; mejor = [sx, sy]; }
      }
      const dentro = mejor && dist <= (c.x1 - c.x0) / 40;
      focos[i].hidden = !dentro;
      if (!dentro) return;
      focos[i].setAttribute("cx", aX(mejor[0]).toFixed(1));
      focos[i].setAttribute("cy", aY(mejor[1]).toFixed(1));
      filas.push(`<div><span><i style="background:${colores[i]}"></i> ${serie.nombre}</span>`
        + `<b>${mejor[1].toFixed(mejor[1] < 20 ? 2 : 0)} ${serie.unidad}</b></div>`);
    });

    if (!filas.length) { ocultar(); return; }
    cruz.hidden = false;
    cruz.setAttribute("x1", aX(x).toFixed(1));
    cruz.setAttribute("x2", aX(x).toFixed(1));
    globo.hidden = false;
    globo.innerHTML = `<b>${x.toFixed(x < 20 ? 1 : 0)}</b>` + filas.join("");
    const cajaFig = figura.getBoundingClientRect();
    const izq = evento.clientX - cajaFig.left + 16;
    globo.style.left = Math.min(izq, cajaFig.width - globo.offsetWidth - 12) + "px";
    globo.style.top = (evento.clientY - cajaFig.top + 12) + "px";
  }
  function ocultar() {
    cruz.hidden = true; globo.hidden = true;
    focos.forEach((f) => { f.hidden = true; });
  }

  captura.addEventListener("mousemove", mostrar);
  captura.addEventListener("mouseleave", ocultar);
  captura.addEventListener("touchmove", (e) => { mostrar(e.touches[0]); }, { passive: true });
  captura.addEventListener("touchend", ocultar);
}

GRAFICAS.forEach(montar);
</script>
"""


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else "prestaciones.html"
    with open(destino, "w", encoding="utf-8") as fh:
        fh.write(html())
    print(f"Hoja de prestaciones: {destino}")
