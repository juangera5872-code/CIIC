"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Building2,
  Cog,
  Wrench,
  Monitor,
  Shield,
  Clock,
  Award,
  Users,
  ArrowRight,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EnrollmentFlow } from "@/components/enrollment-flow"

interface Course {
  id: string
  title: string
  category: string
  categoryIcon: typeof CheckCircle2
  duration: string
  level: "Basico" | "Intermedio" | "Avanzado"
  certified: boolean
  description: string
  topics: string[]
  price: number
}

const COURSE_PRICE = 2000 // Precio base en MXN

const categories = [
  { label: "Todos", value: "todos" },
  { label: "Calidad", value: "calidad" },
  { label: "Desarrollo Empresarial", value: "desarrollo" },
  { label: "Ingenieria", value: "ingenieria" },
  { label: "Mantenimiento", value: "mantenimiento" },
  { label: "Tecnologia", value: "tecnologia" },
  { label: "Seguridad", value: "seguridad" },
]

const courses: Course[] = [
  {
    id: "lean-manufacturing",
    title: "Lean Manufacturing y Mejora Continua",
    category: "calidad",
    categoryIcon: CheckCircle2,
    duration: "40 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Domina las herramientas y principios de Lean Manufacturing para eliminar desperdicios, optimizar procesos y aumentar la productividad de tu organizacion.",
    topics: [
      "Principios del pensamiento Lean",
      "Value Stream Mapping (VSM)",
      "Kanban y sistemas Pull",
      "Kaizen y eventos de mejora rapida",
      "Estandarizacion de procesos",
    ],
  },
  {
    id: "six-sigma-green-belt",
    title: "Six Sigma Green Belt",
    category: "calidad",
    categoryIcon: CheckCircle2,
    duration: "80 horas",
    level: "Avanzado",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Obten la certificacion Green Belt y aprende a liderar proyectos de mejora utilizando la metodologia DMAIC para reducir variabilidad y defectos.",
    topics: [
      "Metodologia DMAIC",
      "Herramientas estadisticas",
      "Control Estadistico de Procesos (CEP)",
      "Analisis de causa raiz",
      "Gestion de proyectos Six Sigma",
    ],
  },
  {
    id: "iso-9001",
    title: "Auditor Interno ISO 9001:2015",
    category: "calidad",
    categoryIcon: CheckCircle2,
    duration: "24 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Capacitate como auditor interno de Sistemas de Gestion de Calidad bajo la norma ISO 9001:2015, con enfoque practico en auditorias reales.",
    topics: [
      "Requisitos de ISO 9001:2015",
      "Planificacion de auditorias",
      "Tecnicas de entrevista y recopilacion de evidencia",
      "Redaccion de hallazgos",
      "Acciones correctivas y seguimiento",
    ],
  },
  {
    id: "5s-implementacion",
    title: "Implementacion de 5S en la Industria",
    category: "calidad",
    categoryIcon: CheckCircle2,
    duration: "16 horas",
    level: "Basico",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Aprende a implementar la metodologia 5S para crear ambientes de trabajo organizados, limpios y eficientes que impacten directamente en la productividad.",
    topics: [
      "Seiri (Clasificar)",
      "Seiton (Ordenar)",
      "Seiso (Limpiar)",
      "Seiketsu (Estandarizar)",
      "Shitsuke (Disciplina)",
    ],
  },
  {
    id: "desarrollo-organizacional",
    title: "Desarrollo Organizacional y Liderazgo",
    category: "desarrollo",
    categoryIcon: Building2,
    duration: "32 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Fortalece las competencias de liderazgo y gestion del cambio en tu organizacion para crear equipos de alto rendimiento y una cultura de mejora continua.",
    topics: [
      "Diagnostico organizacional",
      "Gestion del cambio",
      "Liderazgo situacional",
      "Comunicacion efectiva",
      "Formacion de equipos de alto desempeno",
    ],
  },
  {
    id: "plan-negocios",
    title: "Elaboracion de Plan de Negocios",
    category: "desarrollo",
    categoryIcon: Building2,
    duration: "24 horas",
    level: "Basico",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Aprende a estructurar un plan de negocios solido que te permita obtener financiamiento y guiar el crecimiento estrategico de tu empresa.",
    topics: [
      "Analisis de mercado",
      "Modelo de negocio Canvas",
      "Proyecciones financieras",
      "Estrategias de comercializacion",
      "Presentacion a inversionistas",
    ],
  },
  {
    id: "administracion-rh",
    title: "Administracion de Recursos Humanos",
    category: "desarrollo",
    categoryIcon: Building2,
    duration: "28 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Domina las mejores practicas en gestion de talento humano, desde reclutamiento y seleccion hasta desarrollo y retencion de personal clave.",
    topics: [
      "Reclutamiento y seleccion",
      "Evaluacion del desempeno",
      "Capacitacion y desarrollo",
      "Clima laboral",
      "Normativa laboral mexicana (LFT)",
    ],
  },
  {
    id: "layout-planta",
    title: "Ingenieria y Layout de Planta",
    category: "ingenieria",
    categoryIcon: Cog,
    duration: "32 horas",
    level: "Avanzado",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Diseña y optimiza la distribucion de planta para maximizar el flujo de materiales, reducir tiempos muertos y mejorar la eficiencia operativa.",
    topics: [
      "Metodos de distribucion de planta",
      "Analisis de flujo de materiales",
      "Simulacion de procesos",
      "Ergonomia en estaciones de trabajo",
      "Implementacion y validacion",
    ],
  },
  {
    id: "planeacion-estrategica",
    title: "Planeacion Estrategica Industrial",
    category: "ingenieria",
    categoryIcon: Cog,
    duration: "20 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Desarrolla la capacidad de crear y ejecutar planes estrategicos orientados a la competitividad y sostenibilidad de operaciones industriales.",
    topics: [
      "Analisis FODA y PESTEL",
      "Balanced Scorecard",
      "KPIs y metricas industriales",
      "Gestion por objetivos (MBO)",
      "Planes de accion y seguimiento",
    ],
  },
  {
    id: "mantenimiento-industrial",
    title: "Gestion del Mantenimiento Industrial",
    category: "mantenimiento",
    categoryIcon: Wrench,
    duration: "36 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Aprende a implementar programas de mantenimiento preventivo, predictivo y correctivo para maximizar la disponibilidad de equipos.",
    topics: [
      "TPM (Mantenimiento Productivo Total)",
      "Mantenimiento centrado en confiabilidad (RCM)",
      "Analisis de vibraciones",
      "Termografia industrial",
      "Gestion de repuestos y CMMS",
    ],
  },
  {
    id: "seguridad-industrial",
    title: "Seguridad Industrial y Salud Ocupacional",
    category: "seguridad",
    categoryIcon: Shield,
    duration: "40 horas",
    level: "Intermedio",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Forma profesionales capaces de identificar, evaluar y controlar riesgos laborales conforme a la normativa mexicana e internacional vigente.",
    topics: [
      "NOM de seguridad e higiene",
      "Identificacion de peligros y riesgos",
      "Equipos de proteccion personal",
      "Investigacion de accidentes",
      "Comisiones mixtas de seguridad",
    ],
  },
  {
    id: "software-empresarial",
    title: "Implementacion de Software Empresarial",
    category: "tecnologia",
    categoryIcon: Monitor,
    duration: "20 horas",
    level: "Basico",
    certified: true,
    price: COURSE_PRICE,
    description:
      "Conoce las mejores practicas para seleccionar, implementar y administrar soluciones de software que impulsen la productividad de tu empresa.",
    topics: [
      "Evaluacion de necesidades tecnologicas",
      "Sistemas ERP y CRM",
      "Gestion del cambio tecnologico",
      "Seguridad de la informacion",
      "Mantenimiento y soporte tecnico",
    ],
  },
]

const levelColors: Record<string, string> = {
  Basico: "bg-emerald-100 text-emerald-700",
  Intermedio: "bg-amber-100 text-amber-700",
  Avanzado: "bg-red-100 text-red-700",
}

export function Courses() {
  const [activeFilter, setActiveFilter] = useState("todos")
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false)

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course)
    setIsEnrollmentOpen(true)
  }

  const filteredCourses =
    activeFilter === "todos"
      ? courses
      : courses.filter((c) => c.category === activeFilter)

  return (
    <section id="cursos" className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Formacion Profesional
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Cursos y Certificaciones
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Fortalece las competencias de tu equipo con nuestros programas
            certificados impartidos por especialistas con experiencia industrial
            comprobada.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mx-auto mb-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: `${courses.length}+`, label: "Cursos", icon: Award },
            { value: "100%", label: "Certificados", icon: CheckCircle2 },
            { value: "500+", label: "Egresados", icon: Users },
            { value: "6", label: "Especialidades", icon: Filter },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-background p-4 shadow-sm"
            >
              <stat.icon className="mb-2 h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeFilter === cat.value
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-background text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isExpanded = expandedCourse === course.id
            return (
              <div
                key={course.id}
                className={`group flex flex-col overflow-hidden rounded-xl border bg-background transition-all duration-300 ${
                  isExpanded
                    ? "border-accent/30 shadow-lg shadow-accent/5"
                    : "border-border hover:border-accent/20 hover:shadow-md"
                }`}
              >
                {/* Card Header with Price */}
                <div className="flex items-center justify-end border-b border-border bg-secondary/30 px-5 py-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Inversion</span>
                    <p className="text-lg font-bold text-accent">
                      ${course.price.toLocaleString("es-MX")} <span className="text-xs font-normal text-muted-foreground">MXN</span>
                    </p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex items-start gap-3 p-5 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <course.categoryIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-tight text-foreground">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColors[course.level]}`}
                      >
                        {course.level}
                      </span>
                      {course.certified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <Award className="h-3 w-3" />
                          Certificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Duration & Description */}
                <div className="flex-1 px-5 pb-4">
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {course.duration}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                </div>

                {/* Expandable Topics */}
                <div
                  className={`grid transition-all duration-300 ${
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border px-5 pb-4 pt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                        Temario
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {course.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                  <button
                    onClick={() =>
                      setExpandedCourse(isExpanded ? null : course.id)
                    }
                    className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    {isExpanded ? "Ocultar temario" : "Ver temario"}
                  </button>
                  <span className="flex-1" />
                  <Button
                    size="sm"
                    onClick={() => handleEnrollClick(course)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Inscribirme
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="mb-4 text-muted-foreground">
            ¿Necesitas un curso a la medida para tu empresa?
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <a href="#contacto">
              Solicitar Programa Personalizado
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Enrollment Flow Modal */}
      {selectedCourse && (
        <EnrollmentFlow
          course={{
            id: selectedCourse.id,
            title: selectedCourse.title,
            duration: selectedCourse.duration,
            level: selectedCourse.level,
            price: selectedCourse.price,
          }}
          isOpen={isEnrollmentOpen}
          onClose={() => {
            setIsEnrollmentOpen(false)
            setSelectedCourse(null)
          }}
        />
      )}
    </section>
  )
}
