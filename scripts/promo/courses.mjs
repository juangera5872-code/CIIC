/**
 * Datos de la campaña de promoción de los cursos gratuitos de IA del CIIC.
 *
 * Edita este archivo y vuelve a correr `node scripts/promo/generate.mjs`
 * para regenerar todas las imágenes con la información actualizada
 * (títulos, duraciones, temario, fechas y datos de contacto).
 */

export const brand = {
  nombre: "CIIC",
  nombreLargo: "Colegio de Ingenieros Industriales de Celaya",
  sitio: "ciic.mx",
  whatsapp: "+52 479 223 5255",
  correo: "contacto@ciic.mx",
  ciudad: "Celaya, Guanajuato",
}

/** Cintillo de urgencia: cámbialo por una fecha real cuando la tengan definida. */
export const campana = {
  eyebrow: "Formación profesional CIIC",
  titulo: "3 cursos de",
  tituloAcento: "Inteligencia Artificial",
  subtitulo:
    "Capacitación 100% gratuita para profesionales, empresas y estudiantes del Bajío.",
  badge: "100% GRATIS",
  cintillo: "Inscripciones abiertas · Cupo limitado",
  cta: "Inscríbete en ciic.mx",
}

/**
 * `tituloCorto` se usa en los listados compactos y `titulo` en la tarjeta
 * individual de cada curso. Deja `duracion` vacío mientras no esté definida:
 * el generador omite los campos vacíos en lugar de dejar separadores sueltos.
 */
export const cursos = [
  {
    numero: "01",
    titulo: "Inteligencia Artificial con Claude Code: De Cero a Automatizaciones",
    tituloCorto: "IA con Claude Code",
    nivel: "Desde cero",
    duracion: "",
    modalidad: "En línea",
    resumen:
      "Aprende a usar Claude Code desde cero y automatiza las tareas repetitivas de tu trabajo.",
    temas: [
      "Primeros pasos con Claude Code",
      "Prompts que sí resuelven tareas reales",
      "Automatización de reportes y archivos",
      "Tu primera automatización de principio a fin",
    ],
  },
  {
    numero: "02",
    titulo: "Marketing Digital con IA: Diseño de Marca, Contenido y Producto",
    tituloCorto: "Marketing Digital con IA",
    nivel: "Todos los niveles",
    duracion: "",
    modalidad: "En línea",
    resumen:
      "Construye tu marca, tu contenido y tu producto con herramientas de inteligencia artificial.",
    temas: [
      "Identidad de marca asistida por IA",
      "Contenido para redes en minutos",
      "Diseño de producto y propuesta de valor",
      "Calendario y publicación con IA",
    ],
  },
  {
    numero: "03",
    titulo: "Crea tu Chatbot con IA y WhatsApp para tu Negocio (con Claude)",
    tituloCorto: "Chatbot con IA y WhatsApp",
    nivel: "Todos los niveles",
    duracion: "",
    modalidad: "En línea",
    resumen:
      "Monta un chatbot que atienda a tus clientes por WhatsApp las 24 horas, sin programar de más.",
    temas: [
      "Cómo funciona un chatbot con IA",
      "Conexión con WhatsApp paso a paso",
      "Respuestas y catálogo de tu negocio",
      "Pruebas, puesta en marcha y seguimiento",
    ],
  },
]
