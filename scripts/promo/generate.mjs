/**
 * Generador de imágenes promocionales del CIIC.
 *
 *   node scripts/promo/generate.mjs
 *
 * Renderiza cada pieza con Chromium (Playwright) y la exporta como PNG a
 * public/images/promo/. Los textos viven en scripts/promo/courses.mjs.
 */

import { chromium } from "playwright"
import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { brand, campana, cursos } from "./courses.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const OUT_DIR = path.join(ROOT, "public/images/promo")
const CACHE_DIR = path.join(ROOT, "node_modules/.cache/promo")
const FONT_CACHE = path.join(CACHE_DIR, "inter.css")

const C = {
  navy: "#0A1F3F",
  navyDeep: "#061529",
  navyMid: "#14315C",
  orange: "#E8651A",
  orangeLight: "#FF8C42",
  white: "#FFFFFF",
}

/* ---------------------------------------------------------------- fuentes */

/** Descarga las subseries latinas de Inter y las incrusta como base64. */
async function interCss() {
  try {
    await access(FONT_CACHE)
    return readFile(FONT_CACHE, "utf8")
  } catch {}

  try {
    const url =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    const css = await (
      await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        },
      })
    ).text()

    const faces = []
    for (const block of css.match(/@font-face \{[^}]*\}/g) ?? []) {
      if (!block.includes("U+0000-00FF")) continue // solo el subset latin
      const weight = block.match(/font-weight: (\d+)/)[1]
      const src = block.match(/url\((https[^)]+)\)/)[1]
      const buf = Buffer.from(await (await fetch(src)).arrayBuffer())
      faces.push(
        `@font-face{font-family:'Inter';font-style:normal;font-weight:${weight};` +
          `src:url(data:font/woff2;base64,${buf.toString("base64")}) format('woff2')}`,
      )
    }
    const out = faces.join("\n")
    await mkdir(CACHE_DIR, { recursive: true })
    await writeFile(FONT_CACHE, out)
    return out
  } catch (err) {
    console.warn(
      `! No se pudo descargar Inter (${err.message}); se usará la tipografía del sistema.`,
    )
    return ""
  }
}

async function dataUri(relPath) {
  const buf = await readFile(path.join(ROOT, relPath))
  // Varios logos del repo tienen extension .png pero son JPEG: detectamos el tipo real.
  const mime = buf.subarray(0, 3).toString("hex") === "ffd8ff" ? "jpeg" : "png"
  return `data:image/${mime};base64,${buf.toString("base64")}`
}

/* -------------------------------------------------------------- elementos */

/** Malla de nodos tipo red neuronal, en SVG, como textura de fondo. */
function neuralSvg(w, h, { opacity = 0.5 } = {}) {
  const layers = 4
  const perLayer = 5
  const nodes = []
  for (let l = 0; l < layers; l++) {
    for (let n = 0; n < perLayer; n++) {
      const jitter = ((l * 7 + n * 13) % 5) - 2
      nodes.push({
        l,
        x: (w / (layers + 1)) * (l + 1) + jitter * 6,
        y: (h / (perLayer + 1)) * (n + 1) + jitter * 10,
      })
    }
  }
  const edges = []
  for (const a of nodes) {
    for (const b of nodes) {
      if (b.l !== a.l + 1) continue
      if ((a.x + b.y) % 3 === 0) continue
      edges.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#7FA8E8" stroke-width="1.2" stroke-opacity=".22"/>`,
      )
    }
  }
  const dots = nodes
    .map(
      (n, i) =>
        `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${i % 4 === 0 ? 7 : 4.5}" fill="${i % 4 === 0 ? C.orange : "#9CC1F5"}" fill-opacity="${i % 4 === 0 ? 0.75 : 0.45}"/>`,
    )
    .join("")
  return `<svg class="neural" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="opacity:${opacity}" xmlns="http://www.w3.org/2000/svg">${edges.join("")}${dots}</svg>`
}

const check = (size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`

/**
 * Lockup de marca: el emblema del CIIC dentro de una tarjeta blanca (es como
 * se usa el logotipo, sobre fondo claro) acompanado del nombre en Inter.
 * `centrado` apila los elementos para las piezas verticales.
 */
const lockup = (emblema, { chip = 96, titulo = 30, nombre = 19, centrado = false } = {}) => {
  const tarjeta = `<div class="chip" style="width:${chip}px;height:${chip}px;border-radius:${(chip * 0.26).toFixed(0)}px">
    <img src="${emblema}" alt="${brand.nombre}" style="width:${(chip * 0.76).toFixed(0)}px;display:block">
  </div>`
  const texto = `<div style="${centrado ? "text-align:center" : ""}">
    <div style="font-size:${titulo}px;font-weight:900;letter-spacing:.14em;line-height:1">${brand.nombre}</div>
    <div class="muted" style="font-size:${nombre}px;letter-spacing:.02em;margin-top:${(nombre * 0.42).toFixed(0)}px">${brand.nombreLargo}</div>
  </div>`
  return centrado
    ? `<div style="display:flex;flex-direction:column;align-items:center;gap:${(chip * 0.18).toFixed(0)}px">${tarjeta}${texto}</div>`
    : `<div style="display:flex;align-items:center;gap:${(chip * 0.22).toFixed(0)}px">${tarjeta}${texto}</div>`
}

const pill = (text) => `<span class="pill">${text}</span>`

/** Une nivel/duracion/modalidad omitiendo los campos que esten vacios. */
const meta = (c) => [c.nivel, c.duracion, c.modalidad].filter(Boolean).join(" · ")

/** Titulo compacto para los listados; cae al titulo completo si no hay uno corto. */
const corto = (c) => c.tituloCorto || c.titulo

/* --------------------------------------------------------------- plantilla */

/** Se llena en main() con las @font-face de Inter incrustadas en base64. */
let FONT_CSS = ""

function shell({ width, height, body, pad, neural = 0.55 }) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${FONT_CSS}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${width}px;height:${height}px}
body{
  font-family:'Inter','Liberation Sans',system-ui,sans-serif;
  color:#fff;
  -webkit-font-smoothing:antialiased;
  background:${C.navy};
  overflow:hidden;
}
.stage{position:relative;width:${width}px;height:${height}px;overflow:hidden;
  background:
    radial-gradient(900px 700px at 100% 0%, rgba(232,101,26,.30), transparent 62%),
    radial-gradient(1100px 900px at -10% 110%, rgba(26,58,111,.95), transparent 65%),
    linear-gradient(150deg, ${C.navyDeep} 0%, ${C.navy} 45%, ${C.navyMid} 100%);
}
.stage::after{content:"";position:absolute;inset:0;
  background-image:radial-gradient(rgba(255,255,255,.09) 1.4px, transparent 1.4px);
  background-size:26px 26px;pointer-events:none}
.neural{position:absolute;inset:0;pointer-events:none}
.content{position:relative;z-index:3;display:flex;flex-direction:column;height:100%;padding:${pad}px}
.chip{background:#fff;display:flex;align-items:center;justify-content:center;
  box-shadow:0 12px 34px rgba(0,0,0,.32);flex:none}
.eyebrow{font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:${C.orangeLight}}
.muted{color:rgba(255,255,255,.72)}
.badge{display:inline-flex;align-items:center;gap:.5em;font-weight:900;letter-spacing:.06em;
  color:#fff;background:linear-gradient(135deg,${C.orangeLight},${C.orange});
  border-radius:999px;box-shadow:0 14px 34px rgba(232,101,26,.42)}
.pill{display:inline-flex;align-items:center;font-weight:600;color:rgba(255,255,255,.92);
  background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);border-radius:999px}
.accent{color:${C.orangeLight}}
.rule{height:1px;background:linear-gradient(90deg,rgba(255,255,255,.28),rgba(255,255,255,0))}
.card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
  border-radius:22px;backdrop-filter:blur(2px)}
.tema:last-child{margin-bottom:0 !important}
.num{font-weight:900;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.30);line-height:.8}
.foot{display:flex;align-items:center;justify-content:space-between;gap:20px}
</style></head><body><div class="stage">${neuralSvg(width, height, { opacity: neural })}<div class="content">${body}</div></div></body></html>`
}

/* ---------------------------------------------------------------- escenas */

/** Anuncio principal (cuadrado 1:1 y vertical 4:5 comparten estructura). */
function anuncio({ width, height, logo, tall }) {
  const s = width / 1080
  const px = (v) => `${(v * s).toFixed(1)}px`
  const gap = tall ? 1.18 : 1
  const t = (alto, cuadrado) => (tall ? alto : cuadrado)

  const lista = cursos
    .map(
      (c) => `
    <div class="card" style="display:flex;align-items:center;gap:${px(22)};padding:${px(t(24, 17))} ${px(26)}">
      <span style="font-size:${px(30)};font-weight:900;color:${C.orangeLight};min-width:${px(52)}">${c.numero}</span>
      <div style="flex:1">
        <div style="font-size:${px(29)};font-weight:700;line-height:1.2">${corto(c)}</div>
        <div class="muted" style="font-size:${px(22)};margin-top:${px(6)}">${meta(c)}</div>
      </div>
      <span class="badge" style="font-size:${px(19)};padding:${px(9)} ${px(18)}">GRATIS</span>
    </div>`,
    )
    .join(`<div style="height:${px(t(16, 12))}"></div>`)

  return shell({
    width,
    height,
    pad: 74 * s,
    body: `
    <div style="display:flex;align-items:center;gap:${px(20)}">
      ${lockup(logo, { chip: 96 * s, titulo: 31 * s, nombre: 19 * s })}
      <span style="flex:1"></span>
      <span class="badge" style="font-size:${px(23)};padding:${px(13)} ${px(24)}">${campana.badge}</span>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:${px(t(38, 10))} 0">
      <div class="eyebrow" style="font-size:${px(23)}">${campana.eyebrow}</div>
      <h1 style="font-size:${px(t(94, 82))};font-weight:900;line-height:1.02;letter-spacing:-.02em;margin-top:${px(18)}">
        ${campana.titulo}<br><span class="accent">${campana.tituloAcento}</span>
      </h1>
      <p class="muted" style="font-size:${px(28)};line-height:1.45;margin-top:${px(t(22, 18))};max-width:${px(880)}">
        ${campana.subtitulo}
      </p>
      <div style="height:${px(t(34, 24))}"></div>
      ${lista}
    </div>

    <div class="rule" style="margin-bottom:${px(t(26, 22))}"></div>
    <div class="foot">
      <div>
        <div style="font-size:${px(30)};font-weight:800">${campana.cta}</div>
        <div class="muted" style="font-size:${px(21)};margin-top:${px(6)}">${campana.cintillo}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:${px(23)};font-weight:700">WhatsApp ${brand.whatsapp}</div>
        <div class="muted" style="font-size:${px(20)};margin-top:${px(6)}">${brand.correo} · ${brand.ciudad}</div>
      </div>
    </div>`,
  })
}

/** Tarjeta individual por curso, 1080x1080. */
function tarjetaCurso({ curso, logo }) {
  const px = (v) => `${v}px`
  // Los titulos de tres lineas necesitan menos cuerpo para no comerse el aire
  // entre el logotipo y el encabezado.
  const tituloSize = curso.titulo.length > 55 ? 58 : 66
  return shell({
    width: 1080,
    height: 1080,
    pad: 74,
    body: `
    <div style="position:absolute;right:${px(-30)};top:${px(120)};font-size:${px(320)};z-index:0" class="num">${curso.numero}</div>

    <div style="display:flex;align-items:center;gap:${px(20)};position:relative;z-index:2">
      ${lockup(logo, { chip: 86, titulo: 28, nombre: 18 })}
      <span style="flex:1"></span>
      <span class="badge" style="font-size:${px(21)};padding:${px(12)} ${px(22)}">${campana.badge}</span>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2">
      <div class="eyebrow" style="font-size:${px(22)}">Curso ${curso.numero} de 03 · Inteligencia Artificial</div>
      <h1 style="font-size:${px(tituloSize)};font-weight:900;line-height:1.08;letter-spacing:-.02em;margin-top:${px(16)};max-width:${px(880)}">
        ${curso.titulo}
      </h1>
      <p class="muted" style="font-size:${px(27)};line-height:1.45;margin-top:${px(18)};max-width:${px(820)}">${curso.resumen}</p>

      <div style="display:flex;gap:${px(12)};margin-top:${px(26)}">
        ${[curso.nivel, curso.duracion, curso.modalidad, "Constancia CIIC"].filter(Boolean).map(pill).join("")}
      </div>

      <div class="card" style="margin-top:${px(34)};padding:${px(30)} ${px(34)}">
        <div class="eyebrow" style="font-size:${px(19)};color:rgba(255,255,255,.62)">Lo que aprenderás</div>
        <div style="height:${px(18)}"></div>
        ${curso.temas
          .map(
            (t) => `<div class="tema" style="display:flex;gap:${px(14)};align-items:flex-start;margin-bottom:${px(14)}">
              <span style="margin-top:${px(3)}">${check(24)}</span>
              <span style="font-size:${px(26)};line-height:1.35;color:rgba(255,255,255,.94)">${t}</span>
            </div>`,
          )
          .join("")}
      </div>
    </div>

    <div class="rule" style="margin-bottom:${px(24)}"></div>
    <div class="foot" style="position:relative;z-index:2">
      <div style="font-size:${px(30)};font-weight:800">${campana.cta}</div>
      <div class="muted" style="font-size:${px(22)};text-align:right">WhatsApp ${brand.whatsapp}</div>
    </div>
    <style>.pill{font-size:${px(22)};padding:${px(11)} ${px(20)}}</style>`,
  })
}

/** Historia vertical 1080x1920 (Instagram / Facebook / WhatsApp). */
function historia({ logo }) {
  const px = (v) => `${v}px`
  const lista = cursos
    .map(
      (c) => `
    <div class="card" style="padding:${px(26)} ${px(32)};display:flex;gap:${px(24)};align-items:center">
      <span style="font-size:${px(44)};font-weight:900;color:${C.orangeLight};line-height:1">${c.numero}</span>
      <div style="flex:1">
        <div style="font-size:${px(34)};font-weight:700;line-height:1.2">${corto(c)}</div>
        <div class="muted" style="font-size:${px(25)};margin-top:${px(8)}">${meta(c)}</div>
      </div>
    </div>`,
    )
    .join(`<div style="height:${px(18)}"></div>`)

  return shell({
    width: 1080,
    height: 1920,
    pad: 90,
    body: `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:${px(20)};margin-top:${px(80)}">
      ${lockup(logo, { chip: 140, titulo: 38, nombre: 24, centrado: true })}
      <span class="badge" style="font-size:${px(30)};padding:${px(16)} ${px(32)};margin-top:${px(10)}">${campana.badge}</span>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div class="eyebrow" style="font-size:${px(26)};text-align:center">${campana.eyebrow}</div>
      <h1 style="font-size:${px(86)};font-weight:900;line-height:1.02;letter-spacing:-.02em;margin-top:${px(20)};text-align:center">
        ${campana.titulo}<br><span class="accent">${campana.tituloAcento}</span>
      </h1>
      <p class="muted" style="font-size:${px(32)};line-height:1.45;margin-top:${px(28)};text-align:center">
        ${campana.subtitulo}
      </p>
      <div style="height:${px(34)}"></div>
      ${lista}
    </div>

    <div style="text-align:center;margin-bottom:${px(95)}">
      <div style="font-size:${px(40)};font-weight:900">${campana.cta}</div>
      <div class="muted" style="font-size:${px(27)};margin-top:${px(12)}">${campana.cintillo}</div>
      <div class="rule" style="margin:${px(28)} 0"></div>
      <div class="muted" style="font-size:${px(25)};line-height:1.6">
        WhatsApp ${brand.whatsapp}<br>${brand.correo} · ${brand.ciudad}
      </div>
    </div>`,
  })
}

/** Banner horizontal 1200x630 (portada de Facebook / LinkedIn / OpenGraph). */
function banner({ logo }) {
  const px = (v) => `${v}px`
  const mini = cursos
    .map(
      (c) => `
    <div class="card" style="padding:${px(16)} ${px(18)};display:flex;gap:${px(14)};align-items:center">
      <span style="font-size:${px(22)};font-weight:900;color:${C.orangeLight}">${c.numero}</span>
      <div>
        <div style="font-size:${px(19)};font-weight:700;line-height:1.25">${corto(c)}</div>
        <div class="muted" style="font-size:${px(15)};margin-top:${px(4)}">${meta(c)}</div>
      </div>
    </div>`,
    )
    .join(`<div style="height:${px(12)}"></div>`)

  return shell({
    width: 1200,
    height: 630,
    pad: 56,
    neural: 0.4,
    body: `
    <div style="display:flex;gap:${px(48)};height:100%;align-items:stretch">
      <div style="flex:1.15;display:flex;flex-direction:column">
        ${lockup(logo, { chip: 66, titulo: 22, nombre: 15 })}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
          <div class="eyebrow" style="font-size:${px(16)}">${campana.eyebrow}</div>
          <h1 style="font-size:${px(58)};font-weight:900;line-height:1.03;letter-spacing:-.02em;margin-top:${px(12)}">
            ${campana.titulo}<br><span class="accent">${campana.tituloAcento}</span>
          </h1>
          <div style="display:flex;align-items:center;gap:${px(14)};margin-top:${px(20)}">
            <span class="badge" style="font-size:${px(18)};padding:${px(10)} ${px(20)}">${campana.badge}</span>
            <span class="muted" style="font-size:${px(18)}">${campana.cintillo}</span>
          </div>
        </div>
        <div>
          <div class="rule" style="margin-bottom:${px(16)}"></div>
          <div class="foot">
            <div style="font-size:${px(22)};font-weight:800">${campana.cta}</div>
            <div class="muted" style="font-size:${px(16)}">WhatsApp ${brand.whatsapp}</div>
          </div>
        </div>
      </div>
      <div style="flex:.85;display:flex;flex-direction:column;justify-content:center">${mini}</div>
    </div>`,
  })
}

/* ------------------------------------------------------------------ main */

async function main() {
  const [fontCss, logo] = await Promise.all([
    interCss(),
    dataUri("public/images/ciic-emblema.png"),
  ])
  FONT_CSS = fontCss

  const piezas = [
    {
      file: "ciic-ia-anuncio-1x1.png",
      width: 1080,
      height: 1080,
      html: anuncio({ width: 1080, height: 1080, logo, tall: false }),
    },
    {
      file: "ciic-ia-anuncio-4x5.png",
      width: 1080,
      height: 1350,
      html: anuncio({ width: 1080, height: 1350, logo, tall: true }),
    },
    {
      file: "ciic-ia-historia-9x16.png",
      width: 1080,
      height: 1920,
      html: historia({ logo }),
    },
    {
      file: "ciic-ia-banner-1200x630.png",
      width: 1200,
      height: 630,
      html: banner({ logo }),
    },
    ...cursos.map((curso, i) => ({
      file: `ciic-ia-curso-0${i + 1}-1x1.png`,
      width: 1080,
      height: 1080,
      html: tarjetaCurso({ curso, logo }),
    })),
  ]

  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()

  for (const pieza of piezas) {
    const page = await browser.newPage({
      viewport: { width: pieza.width, height: pieza.height },
      deviceScaleFactor: 1,
    })
    await page.setContent(pieza.html, { waitUntil: "load" })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(OUT_DIR, pieza.file) })
    await page.close()
    console.log(`✓ ${pieza.file}  (${pieza.width}×${pieza.height})`)
  }

  await browser.close()
  console.log(`\nImágenes generadas en public/images/promo/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
