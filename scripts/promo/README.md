# Imágenes promocionales del CIIC

Generador de las piezas gráficas para la campaña de los **3 cursos gratuitos de
Inteligencia Artificial**. Las imágenes se renderizan con Chromium (Playwright)
usando la identidad visual del sitio: navy `#0A1F3F`, naranja `#E8651A`,
tipografía Inter y el logotipo del Colegio.

## Cómo regenerar

Playwright no forma parte de las dependencias de la app (solo se necesita para
generar estas imágenes), así que se instala aparte:

```bash
pnpm add -D playwright
pnpm exec playwright install chromium
node scripts/promo/generate.mjs
```

Las imágenes se escriben en `public/images/promo/`.

La tipografía Inter se descarga una sola vez desde Google Fonts y se guarda en
`node_modules/.cache/promo/inter.css`. Si no hay red, el script avisa y usa la
tipografía del sistema.

## Cómo cambiar los textos

Todo el contenido editorial vive en [`courses.mjs`](./courses.mjs): nombre de los
cursos, nivel, duración, temario, datos de contacto y el cintillo de urgencia
(`campana.cintillo`, hoy `"Inscripciones abiertas · Cupo limitado"` — cámbialo
por la fecha real de inicio cuando esté definida). Edita ese archivo y vuelve a
correr el generador.

## Piezas que produce

| Archivo | Medidas | Uso |
| --- | --- | --- |
| `ciic-ia-anuncio-1x1.png` | 1080 × 1080 | Post cuadrado (Facebook, LinkedIn, WhatsApp) |
| `ciic-ia-anuncio-4x5.png` | 1080 × 1350 | Post vertical de Instagram (el que más pantalla ocupa) |
| `ciic-ia-historia-9x16.png` | 1080 × 1920 | Historias / Reels / estado de WhatsApp |
| `ciic-ia-banner-1200x630.png` | 1200 × 630 | Portada de enlace: OpenGraph, LinkedIn, correo |
| `ciic-ia-curso-01-1x1.png` | 1080 × 1080 | Tarjeta del curso 01 con temario |
| `ciic-ia-curso-02-1x1.png` | 1080 × 1080 | Tarjeta del curso 02 con temario |
| `ciic-ia-curso-03-1x1.png` | 1080 × 1080 | Tarjeta del curso 03 con temario |

La pieza vertical respeta las zonas seguras de Instagram/Facebook Stories: los
primeros y últimos ~200 px quedan libres para que la interfaz de la app no tape
el texto.

## Nota sobre los logotipos

Se usa `public/images/ciic-logo-full.png` porque es el único archivo de marca
legible sobre fondo oscuro (se coloca dentro de una tarjeta blanca).

`ciic-logo.png` y `ciic-logo-emblema.png` **traen el patrón de cuadros grises de
transparencia rasterizado dentro del propio archivo** (son PNG sin canal alfa),
por lo que no se pueden usar sobre fondos de color. Conviene reexportarlos con
transparencia real.
