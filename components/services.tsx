"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Building2,
  Palette,
  Megaphone,
  FolderKanban,
  Cog,
  Wrench,
  Monitor,
  ChevronDown,
} from "lucide-react"

const serviceAreas = [
  {
    icon: CheckCircle2,
    title: "Calidad",
    color: "bg-accent",
    items: [
      "Sistema de gestion de calidad",
      "Distintivo Guanajuato Crece",
      "Normas Oficiales Mexicanas",
      "Calidad en el servicio",
      "Analisis y Mapeo de Procesos",
      "QFD (Despliegue de la Funcion de Calidad)",
      "Implementacion de 5S",
      "Asesoria en programas educativos",
      "Lean Manufacturing",
      "Certificaciones y proyectos Six Sigma",
    ],
  },
  {
    icon: Building2,
    title: "Creacion y Desarrollo de Empresas",
    color: "bg-primary",
    items: [
      "Constitucion del Marco Legal",
      "Contabilidad y Fiscal",
      "Administracion",
      "Recursos Humanos",
      "Mercadotecnia",
      "Desarrollo Organizacional",
      "Entrenamiento y Formacion",
    ],
  },
  {
    icon: Palette,
    title: "Diseno",
    color: "bg-accent",
    items: [
      "Planos de proyectos industriales, residenciales y de servicios",
      "Desarrollo de planos",
      "Perspectivas",
      "Renders",
      "Animaciones en 3D",
      "Recorridos virtuales y fotomontajes",
    ],
  },
  {
    icon: Megaphone,
    title: "Comunicacion y Publicidad",
    color: "bg-primary",
    items: [
      "Diseno Grafico",
      "Imagen Corporativa",
      "Catalogos y Revistas",
      "Logotipos",
      "Poster y carteles",
      "Papeleria",
      "Ilustraciones y lonas",
      "Invitaciones",
      "Tarjetas de presentacion",
      "Senaletica personalizada",
      "Manual Corporativo",
      "Instalacion de toldos",
      "Rotulos, placas y rotulos luminosos",
    ],
  },
  {
    icon: FolderKanban,
    title: "Gestion de Proyectos",
    color: "bg-accent",
    items: [
      "Plan de negocios",
      "Proyectos de inversion",
      "Agro-negocios",
      "Financiamiento",
      "Sector publico",
      "Proyectos educativos (presencial y a distancia)",
    ],
  },
  {
    icon: Cog,
    title: "Ingenieria",
    color: "bg-primary",
    items: [
      "Mejora continua",
      "Ingenieria y layout de planta",
      "Reduccion de stock",
      "Soporte e implementacion",
      "Estrategias de planeacion",
      "Seguridad industrial",
    ],
  },
  {
    icon: Wrench,
    title: "Mantenimiento",
    color: "bg-accent",
    items: [
      "Predictivo",
      "Preventivo",
      "Correctivo",
      "Programas en edificios e instalaciones",
      "Maquinaria industrial",
      "Transporte y logistica",
    ],
  },
  {
    icon: Monitor,
    title: "Tecnologia de la Informacion",
    color: "bg-primary",
    items: [
      "Software empresarial",
      "Sistemas de videovigilancia",
      "Mantenimiento de equipo de computo",
    ],
  },
]

export function Services() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="servicios" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Nuestros Servicios
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Soluciones Integrales para tu Negocio
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Contamos con 8 areas especializadas para cubrir todas las necesidades
            de consultoria, ingenieria y desarrollo de tu empresa.
          </p>
        </div>

        {/* Service Accordion Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {serviceAreas.map((area, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={area.title}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? "border-accent/30 shadow-lg shadow-accent/5"
                    : "border-border hover:border-accent/20"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${area.color} text-primary-foreground transition-transform ${
                      isOpen ? "scale-110" : ""
                    }`}
                  >
                    <area.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-base font-semibold text-foreground">
                    {area.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {area.items.length}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="border-t border-border px-5 pb-5 pt-4">
                      {area.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 py-1.5 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
