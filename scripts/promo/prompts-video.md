# Prompts para el video promocional (presentador realista)

Spot de ~40 segundos donde un hombre presenta los 3 cursos gratuitos de IA del
CIIC. Está pensado para generadores con **audio y diálogo nativos** (Google Veo 3,
Sora 2, Kling 2.5). Si tu herramienta no genera voz (Runway, Luma, Hailuo), usa
los mismos prompts sin el bloque de diálogo y agrega la locución después.

## Cómo usarlo

- Los modelos generan clips de **8 segundos**. El spot son **5 clips** que se unen
  en edición.
- Genera en **9:16** para Reels, TikTok, Stories y estado de WhatsApp; en **16:9**
  para YouTube y el sitio. Genera cada formato por separado, no recortes.
- **No pidas texto en pantalla.** Los modelos de video escriben mal. Los rótulos,
  el logotipo y la pantalla final se ponen en edición, con las imágenes de
  `public/images/promo/`.
- Para que sea **el mismo hombre en los 5 clips**: pega el bloque de personaje
  íntegro en cada prompt, usa la misma semilla (*seed*) y, si tu herramienta lo
  permite, arranca de una imagen de referencia del primer clip.
- Si tienes un instructor real, la mejor opción es **imagen a video**: sube su
  foto y usa estos mismos prompts. Sale más creíble y evita presentar a una
  persona inexistente como instructor del Colegio.

---

## Bloque de personaje (pégalo en TODOS los clips)

```
PERSONAJE: Hombre mexicano de 38 años, complexión media, cabello negro corto
peinado hacia un lado, barba recortada, piel morena clara, mirada segura y
amable. Viste camisa azul marino de vestir con las mangas dobladas hasta el
antebrazo, sin corbata, reloj plateado discreto. Aspecto de instructor
profesional, cercano, no corporativo acartonado.

ESCENARIO: Aula de capacitación moderna con ventanal de piso a techo a la
izquierda, luz natural suave de mañana entrando en diagonal. Al fondo,
desenfocado, una pantalla grande encendida con gráficas azules y sillas de
oficina. Paleta de la escena en azul marino profundo y acentos naranjas cálidos.

CÁMARA: Lente 50 mm, apertura f/2.0, cámara a la altura de los ojos, plano medio
(de la cintura hacia arriba), fondo desenfocado suave. Movimiento de cámara muy
lento hacia el sujeto, apenas perceptible, en trípode con cabeza fluida.

ESTILO: Video corporativo realista, calidad cinematográfica 4K, piel con textura
natural, colorimetría cálida y limpia. Nada de estética de caricatura, nada de
filtros exagerados.

AUDIO: Voz masculina cálida y clara, acento mexicano neutro, tono cercano y
convincente, ritmo pausado. Ambiente de oficina muy tenue de fondo. Sin música.
```

---

## Guion en 5 clips

### Clip 1 — Gancho (0:00 – 0:08)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: El hombre está de pie frente a la cámara y da un paso corto hacia
adelante mientras habla. Gesticula con la mano derecha abierta, natural. Sonríe
ligeramente al terminar la frase. Contacto visual directo con la cámara todo el
tiempo.

DIÁLOGO (español de México, sincronizado con los labios):
"¿Cuántas horas pierdes en tareas que la inteligencia artificial ya puede hacer
por ti?"
```

### Clip 2 — Curso 01 (0:08 – 0:16)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: Mismo hombre, misma aula, ahora ligeramente girado hacia la izquierda del
encuadre. Levanta el dedo índice al decir "primer curso" y luego abre la mano.
Expresión entusiasta y didáctica.

DIÁLOGO (español de México, sincronizado con los labios):
"Primer curso: Inteligencia Artificial con Claude Code. Empiezas desde cero y
terminas automatizando tu trabajo."
```

### Clip 3 — Curso 02 (0:16 – 0:24)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: Mismo hombre, misma aula. Camina un paso lateral hacia la derecha
mientras habla; la cámara lo sigue con una panorámica mínima. Gesto de las dos
manos abriéndose al mencionar marca, contenido y producto.

DIÁLOGO (español de México, sincronizado con los labios):
"Segundo: Marketing Digital con Inteligencia Artificial. Diseña tu marca, tu
contenido y tu producto."
```

### Clip 4 — Curso 03 (0:24 – 0:32)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: Mismo hombre, misma aula, de vuelta al centro del encuadre. Sostiene un
teléfono celular en la mano izquierda a la altura del pecho y lo señala con la
derecha, sin mirar la pantalla. Tono resolutivo.

DIÁLOGO (español de México, sincronizado con los labios):
"Y tercero: crea tu chatbot con inteligencia artificial y WhatsApp, para atender
clientes las veinticuatro horas."
```

### Clip 5 — Cierre y llamado a la acción (0:32 – 0:40)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: Mismo hombre, misma aula. Plano medio corto, la cámara se acerca muy
lentamente. Junta las manos al frente, asiente una vez y sonríe con seguridad al
terminar. Mantiene la mirada en la cámara dos segundos después de la última
palabra, sin moverse, para dejar espacio al rótulo final.

DIÁLOGO (español de México, sincronizado con los labios):
"Tres cursos, cien por ciento gratuitos. Inscríbete en ciic punto eme equis.
Cupo limitado."
```

> En edición: sobre esos dos segundos finales, monta `ciic-ia-anuncio-1x1.png`
> (o `ciic-ia-historia-9x16.png` para vertical) como pantalla de cierre.

---

## Versión de 8 segundos (un solo clip para Reels)

```
[BLOQUE DE PERSONAJE]

ACCIÓN: El hombre mira a cámara, da un paso adelante y habla con energía
contenida, gesticulando con la mano derecha. Sonríe al final y asiente una vez.

DIÁLOGO (español de México, sincronizado con los labios):
"Tres cursos de inteligencia artificial, totalmente gratis, en el Colegio de
Ingenieros Industriales de Celaya. Inscríbete en ciic punto eme equis."
```

---

## Prompt negativo (para las herramientas que lo aceptan)

```
texto en pantalla, subtítulos, letreros, logotipos, marcas de agua, manos
deformes, dedos de más, rostro distorsionado, ojos asimétricos, dientes
irregulares, labios desincronizados, movimiento de cámara brusco, zoom rápido,
cambio de vestuario, cambio de escenario, saturación excesiva, apariencia de
caricatura, animación 3D, cámara lenta, distorsión de audio, acento español de
España
```

---

## Escenarios alternativos

Cambia solo el bloque `ESCENARIO:` y deja lo demás igual.

**Planta industrial** (el más alineado con el CIIC):

```
ESCENARIO: Nave industrial moderna y limpia, iluminación LED fría combinada con
luz natural de tragaluces. Al fondo, muy desenfocadas, líneas de producción y
estructuras metálicas. El hombre lleva además un chaleco de seguridad naranja
sobre la camisa azul marino.
```

**Oficina con vista a la ciudad**:

```
ESCENARIO: Oficina moderna en un piso alto, ventanal amplio con la ciudad
desenfocada al fondo en hora dorada. Escritorio de madera clara con una laptop
abierta fuera de foco en primer plano.
```

---

## Notas prácticas

- **Pronunciación**: escribe `ciic punto eme equis` en lugar de `ciic.mx`, y los
  números con letra (`veinticuatro`, no `24`). Si el modelo pronuncia "Claude" a
  la francesa o en inglés y no te convence, escribe `Clod` en el diálogo: se lee
  igual y suena natural en español.
- **Duración del diálogo**: 15–18 palabras por clip de 8 segundos. Si te pasas, el
  modelo acelera la voz y se nota.
- **Continuidad**: si entre clip y clip cambia la cara o la ropa, fija la semilla,
  repite el bloque de personaje palabra por palabra y genera 3–4 variantes de cada
  clip para escoger las que empaten.
- **Transparencia**: si el presentador es generado con IA, conviene no presentarlo
  como un instructor real del Colegio. Un rótulo de "presentador generado con IA"
  o usar a una persona real del CIIC resuelve el punto.
