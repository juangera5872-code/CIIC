/* ------------------------------------------------------------------ */
/*  Knowledge-based chatbot – no external AI provider required        */
/* ------------------------------------------------------------------ */

interface ChatMsg {
  id: string
  role: "user" | "assistant"
  parts: { type: string; text: string }[]
}

interface Rule {
  keywords: string[]
  response: string
}

const RULES: Rule[] = [
  /* ---- Saludos ---- */
  {
    keywords: ["hola", "buenos dias", "buenas tardes", "buenas noches", "hey", "saludos", "buen dia"],
    response:
      "¡Hola! Bienvenido al CIIC. Soy tu asistente virtual. Puedo ayudarte con informacion sobre nuestros servicios de consultoria industrial, capacitacion, ingenieria y mas. ¿En que area te gustaria saber mas?",
  },

  /* ---- Calidad ---- */
  {
    keywords: ["calidad", "iso", "norma", "5s", "six sigma", "lean", "manufactura esbelta", "mejora de procesos", "gestion de calidad", "qfd", "mapeo"],
    response:
      "En nuestra area de Calidad ofrecemos: Sistema de gestion de calidad, Distintivo Guanajuato Crece, Normas Oficiales Mexicanas, Calidad en el servicio, Analisis y Mapeo de Procesos, QFD, Implementacion de 5S, Asesoria en programas educativos, Lean Manufacturing, y Certificaciones y proyectos Six Sigma. ¿Te gustaria agendar una asesoria o conocer mas sobre algun servicio en particular?",
  },

  /* ---- Creacion y Desarrollo de Empresas ---- */
  {
    keywords: ["crear empresa", "creacion", "desarrollo de empresa", "emprender", "negocio nuevo", "constitucion", "marco legal", "contabilidad", "fiscal", "recursos humanos", "mercadotecnia", "formacion", "desarrollo organizacional"],
    response:
      "En Creacion y Desarrollo de Empresas te apoyamos con: Constitucion del Marco Legal, Contabilidad y Fiscal, Administracion, Recursos Humanos, Mercadotecnia, Desarrollo Organizacional, y Entrenamiento y Formacion. Acompanamos a emprendedores desde la idea hasta la operacion. ¿Quieres que te asesore en algun paso especifico?",
  },

  /* ---- Diseno ---- */
  {
    keywords: ["diseno", "plano", "render", "3d", "animacion", "recorrido virtual", "fotomontaje", "perspectiva", "proyecto industrial", "proyecto residencial"],
    response:
      "Nuestra area de Diseno incluye: Planos de proyectos industriales, residenciales y de servicios, Perspectivas, Renders, Animaciones en 3D, Recorridos virtuales y Fotomontajes. Contamos con herramientas de ultima generacion para visualizar tus proyectos. ¿Te gustaria solicitar una cotizacion?",
  },

  /* ---- Comunicacion y Publicidad ---- */
  {
    keywords: ["publicidad", "comunicacion", "logo", "logotipo", "imagen corporativa", "catalogo", "senaletica", "diseno grafico", "poster", "papeleria", "rotulo", "manual corporativo", "marca"],
    response:
      "En Comunicacion y Publicidad ofrecemos: Diseno Grafico, Imagen Corporativa, Catalogos, Logotipos, Posters, Papeleria, Ilustraciones, Senaletica, Manual Corporativo y Rotulos luminosos. Fortalecemos la identidad visual de tu empresa. ¿Necesitas algun servicio en especifico?",
  },

  /* ---- Gestion de Proyectos ---- */
  {
    keywords: ["proyecto", "plan de negocios", "inversion", "financiamiento", "agro", "sector publico", "proyecto educativo", "gestion de proyecto"],
    response:
      "Nuestra area de Gestion de Proyectos cubre: Plan de negocios, Proyectos de inversion, Agro-negocios, Financiamiento, Sector publico y Proyectos educativos. Te ayudamos a estructurar y conseguir financiamiento para tu proyecto. ¿Tienes un proyecto en mente?",
  },

  /* ---- Ingenieria ---- */
  {
    keywords: ["ingenieria", "mejora continua", "layout", "planta", "stock", "reduccion", "seguridad industrial", "planeacion", "implementacion"],
    response:
      "En Ingenieria ofrecemos: Mejora continua, Ingenieria y layout de planta, Reduccion de stock, Soporte e implementacion, Estrategias de planeacion y Seguridad industrial. Optimizamos la operacion de tu empresa con metodologias probadas. ¿En que area necesitas apoyo?",
  },

  /* ---- Mantenimiento ---- */
  {
    keywords: ["mantenimiento", "predictivo", "preventivo", "correctivo", "maquinaria", "edificio", "instalacion", "transporte", "logistica"],
    response:
      "Nuestra area de Mantenimiento incluye: Predictivo, Preventivo, Correctivo, Programas en edificios e instalaciones, Maquinaria industrial, y Transporte y logistica. Garantizamos la operatividad continua de tus equipos e instalaciones. ¿Requieres una evaluacion?",
  },

  /* ---- Tecnologia de la Informacion ---- */
  {
    keywords: ["tecnologia", "software", "informatica", "ti", "videovigilancia", "computo", "computadora", "sistema", "camaras"],
    response:
      "En Tecnologia de la Informacion ofrecemos: Software empresarial, Sistemas de videovigilancia y Mantenimiento de equipo de computo. Modernizamos la infraestructura tecnologica de tu negocio. ¿Te gustaria mas detalles sobre alguno de estos servicios?",
  },

  /* ---- Servicios (general) ---- */
  {
    keywords: ["servicio", "que ofrecen", "que hacen", "areas", "a que se dedican"],
    response:
      "El CIIC ofrece 8 areas de servicio: 1) Calidad, 2) Creacion y Desarrollo de Empresas, 3) Diseno, 4) Comunicacion y Publicidad, 5) Gestion de Proyectos, 6) Ingenieria, 7) Mantenimiento, y 8) Tecnologia de la Informacion. Cada area cuenta con especialistas certificados. ¿Sobre cual te gustaria saber mas?",
  },

  /* ---- Contacto ---- */
  {
    keywords: ["contacto", "telefono", "correo", "email", "direccion", "ubicacion", "donde estan", "como los contacto", "whatsapp"],
    response:
      "Puedes contactarnos a traves de: Telefono: +52 (461) 123 4567 | Correo: contacto@ciic.mx | Ubicacion: Celaya, Guanajuato, Mexico. Tambien puedes escribirnos por WhatsApp al mismo numero. ¡Estamos para servirte!",
  },

  /* ---- Horario ---- */
  {
    keywords: ["horario", "hora", "abierto", "atienden", "disponible", "cuando"],
    response:
      "Nuestro horario de atencion es: Lunes a Viernes de 9:00 a 18:00 hrs y Sabados de 9:00 a 14:00 hrs. Este asistente virtual esta disponible 24/7 para resolver tus dudas basicas.",
  },

  /* ---- Cita / Cotizacion ---- */
  {
    keywords: ["cita", "agendar", "cotizacion", "presupuesto", "reunion", "visita", "cotizar"],
    response:
      "¡Con gusto! Para agendar una cita o solicitar una cotizacion, por favor contactanos directamente al +52 (461) 123 4567 o al correo contacto@ciic.mx indicando tu nombre, empresa, y el servicio que te interesa. Tambien puedes escribirnos por WhatsApp para una respuesta mas rapida.",
  },

  /* ---- Sobre nosotros / CIIC ---- */
  {
    keywords: ["ciic", "quienes son", "sobre ustedes", "empresa", "organizacion", "colegio de ingenieros", "mision", "vision"],
    response:
      "El CIIC (Colegio de Ingenieros Industriales Celaya) es una organizacion especializada en servicios integrales de consultoria, capacitacion, ingenieria y desarrollo empresarial. Nuestra mision es impulsar la competitividad y el crecimiento sostenible de empresas e instituciones en la region de Celaya y todo Guanajuato.",
  },

  /* ---- Cursos (general) ---- */
  {
    keywords: ["curso", "cursos", "capacitacion", "taller", "entrenamiento", "diplomado", "certificacion", "formacion profesional", "inscribirme", "inscripcion"],
    response:
      "Contamos con mas de 12 cursos certificados en 6 especialidades: Calidad (Lean Manufacturing, Six Sigma Green Belt, Auditor ISO 9001, 5S), Desarrollo Empresarial (Liderazgo, Plan de Negocios, Recursos Humanos), Ingenieria (Layout de Planta, Planeacion Estrategica), Mantenimiento Industrial, Seguridad Industrial y Tecnologia. Todos incluyen certificacion oficial. ¿Te interesa alguno en particular?",
  },

  /* ---- Curso: Lean Manufacturing ---- */
  {
    keywords: ["lean manufacturing", "lean", "mejora continua", "kaizen", "kanban", "vsm", "value stream"],
    response:
      "Nuestro curso de Lean Manufacturing y Mejora Continua tiene una duracion de 40 horas (nivel Intermedio) y es certificado. Incluye: Principios del pensamiento Lean, Value Stream Mapping, Kanban, Kaizen y Estandarizacion de procesos. ¿Quieres inscribirte o necesitas mas informacion?",
  },

  /* ---- Curso: Six Sigma ---- */
  {
    keywords: ["six sigma", "green belt", "dmaic", "sigma", "estadistica", "variabilidad"],
    response:
      "El curso de Six Sigma Green Belt tiene 80 horas de duracion (nivel Avanzado) con certificacion. Cubre: Metodologia DMAIC, Herramientas estadisticas, Control Estadistico de Procesos, Analisis de causa raiz y Gestion de proyectos Six Sigma. Ideal para lideres de mejora. ¿Te gustaria inscribirte?",
  },

  /* ---- Curso: ISO 9001 ---- */
  {
    keywords: ["iso 9001", "auditor interno", "auditor", "auditoria", "gestion de calidad"],
    response:
      "El curso de Auditor Interno ISO 9001:2015 tiene una duracion de 24 horas (nivel Intermedio) con certificacion. Incluye: Requisitos de la norma, Planificacion de auditorias, Tecnicas de entrevista, Redaccion de hallazgos y Acciones correctivas. ¿Deseas inscribirte?",
  },

  /* ---- Curso: 5S ---- */
  {
    keywords: ["5s", "cinco s", "clasificar", "ordenar", "organizacion del trabajo"],
    response:
      "El curso de Implementacion de 5S en la Industria tiene 16 horas (nivel Basico) y es certificado. Cubre las 5 etapas: Seiri (Clasificar), Seiton (Ordenar), Seiso (Limpiar), Seiketsu (Estandarizar) y Shitsuke (Disciplina). Ideal para iniciar la mejora en tu planta. ¿Te interesa?",
  },

  /* ---- Curso: Liderazgo ---- */
  {
    keywords: ["liderazgo", "desarrollo organizacional", "gestion del cambio", "equipos de alto rendimiento"],
    response:
      "El curso de Desarrollo Organizacional y Liderazgo dura 32 horas (nivel Intermedio) con certificacion. Incluye: Diagnostico organizacional, Gestion del cambio, Liderazgo situacional, Comunicacion efectiva y Equipos de alto desempeno. ¿Quieres mas informacion?",
  },

  /* ---- Curso: Seguridad Industrial ---- */
  {
    keywords: ["seguridad industrial", "salud ocupacional", "riesgos laborales", "nom seguridad", "epp", "proteccion personal"],
    response:
      "El curso de Seguridad Industrial y Salud Ocupacional tiene 40 horas (nivel Intermedio) con certificacion. Cubre: NOM de seguridad, Identificacion de peligros, EPP, Investigacion de accidentes y Comisiones mixtas. Cumple con la normativa mexicana vigente. ¿Te gustaria inscribirte?",
  },

  /* ---- Curso: Mantenimiento Industrial ---- */
  {
    keywords: ["tpm", "mantenimiento productivo total", "rcm", "confiabilidad", "vibraciones", "termografia"],
    response:
      "Nuestro curso de Gestion del Mantenimiento Industrial tiene 36 horas (nivel Intermedio) con certificacion. Incluye: TPM, Mantenimiento centrado en confiabilidad (RCM), Analisis de vibraciones, Termografia industrial y Gestion de repuestos. ¿Deseas inscribirte?",
  },

  /* ---- Precios ---- */
  {
    keywords: ["precio", "costo", "cuanto cuesta", "tarifa", "cuanto cobran", "paquete"],
    response:
      "Nuestros precios varian segun el tipo de servicio, alcance y duracion del proyecto. Te invitamos a solicitar una cotizacion personalizada contactandonos al +52 (461) 123 4567 o al correo contacto@ciic.mx. Con gusto te preparamos una propuesta a la medida.",
  },

  /* ---- Agradecimiento ---- */
  {
    keywords: ["gracias", "muchas gracias", "agradezco", "excelente", "perfecto"],
    response:
      "¡De nada! Fue un gusto ayudarte. Si tienes mas preguntas en el futuro, no dudes en escribirnos. ¡Te deseamos mucho exito! Recuerda que puedes contactarnos al +52 (461) 123 4567 o por WhatsApp.",
  },

  /* ---- Despedida ---- */
  {
    keywords: ["adios", "hasta luego", "bye", "nos vemos", "chao"],
    response:
      "¡Hasta pronto! Fue un placer asistirte. Recuerda que estamos disponibles de Lunes a Viernes de 9:00 a 18:00 y Sabados de 9:00 a 14:00. ¡Te esperamos!",
  },
]

const FALLBACK =
  "Gracias por tu mensaje. No estoy seguro de haber entendido tu consulta. Puedo ayudarte con informacion sobre nuestros Servicios (Calidad, Ingenieria, Mantenimiento y mas), Cursos certificados (Lean, Six Sigma, ISO, 5S, Seguridad Industrial), Horarios, Contacto o Cotizaciones. ¿Sobre que te gustaria saber? Tambien puedes contactarnos al +52 (461) 123 4567."

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
}

function getMessageText(msg: ChatMsg): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function findBestResponse(text: string): string {
  const normalizedInput = normalize(text)

  let bestMatch: Rule | null = null
  let bestScore = 0

  for (const rule of RULES) {
    let score = 0
    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalize(keyword)
      if (normalizedInput.includes(normalizedKeyword)) {
        // Longer keyword matches are worth more
        score += normalizedKeyword.length
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = rule
    }
  }

  return bestMatch ? bestMatch.response : FALLBACK
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMsg[] } = await req.json()

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const userText = lastUserMessage ? getMessageText(lastUserMessage) : ""
    const reply = findBestResponse(userText)

    // Stream the response character by character for a natural feel
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // SSE format for AI SDK UIMessage stream
        const messageId = crypto.randomUUID()

        // Start message
        controller.enqueue(
          encoder.encode(`0:${JSON.stringify({ messageId })}\n`)
        )

        // Send text in small chunks for streaming effect
        const chunkSize = 3
        for (let i = 0; i < reply.length; i += chunkSize) {
          const chunk = reply.slice(i, i + chunkSize)
          controller.enqueue(
            encoder.encode(`2:${JSON.stringify(chunk)}\n`)
          )
          await new Promise((resolve) => setTimeout(resolve, 15))
        }

        // Finish message
        controller.enqueue(
          encoder.encode(
            `d:${JSON.stringify({
              finishReason: "stop",
              usage: { promptTokens: 0, completionTokens: 0 },
            })}\n`
          )
        )
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error:
          "Lo sentimos, ocurrio un error. Intentalo nuevamente o contactanos al +52 (461) 123 4567.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
