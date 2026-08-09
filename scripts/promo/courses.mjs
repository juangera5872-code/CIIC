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

export const cursos = [
  {
    numero: "01",
    titulo: "IA para la Productividad Profesional",
    nivel: "Básico",
    duracion: "6 horas",
    modalidad: "En línea",
    resumen:
      "Domina las herramientas de IA generativa para trabajar más rápido y con mejores resultados.",
    temas: [
      "Primeros pasos con ChatGPT y copilotos",
      "Prompts efectivos para tareas reales",
      "Redacción de reportes y correos",
      "Uso responsable y seguridad de la información",
    ],
  },
  {
    numero: "02",
    titulo: "IA Aplicada a Procesos Industriales",
    nivel: "Intermedio",
    duracion: "8 horas",
    modalidad: "En línea",
    resumen:
      "Lleva la inteligencia artificial al piso de planta: datos, calidad y mantenimiento.",
    temas: [
      "Análisis de datos de producción",
      "Mantenimiento predictivo con IA",
      "Visión artificial para control de calidad",
      "Casos de éxito en la industria del Bajío",
    ],
  },
  {
    numero: "03",
    titulo: "IA para Pymes: Ventas y Atención al Cliente",
    nivel: "Básico",
    duracion: "5 horas",
    modalidad: "En línea",
    resumen:
      "Aplica IA en tu negocio para vender más, atender mejor y ahorrar horas de trabajo.",
    temas: [
      "Contenido y marketing con IA",
      "Chatbots de atención a clientes",
      "Cotizaciones y seguimiento automatizado",
      "Herramientas gratuitas para empezar hoy",
    ],
  },
]
