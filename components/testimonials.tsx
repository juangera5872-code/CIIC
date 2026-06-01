"use client"

import { useState, useEffect, useCallback } from "react"
import { Quote, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    name: "Ing. Roberto Hernandez",
    role: "Director General, Manufactura del Bajio",
    content:
      "Gracias a la consultoria del CIIC, logramos implementar un sistema de gestion de calidad que nos permitio obtener nuestra certificacion en tiempo record. Su equipo es altamente profesional.",
  },
  {
    name: "Lic. Maria Guadalupe Torres",
    role: "Fundadora, Servicios Integra",
    content:
      "El apoyo que recibimos para constituir nuestra empresa fue invaluable. Desde el marco legal hasta la mercadotecnia, el CIIC nos acompano en cada paso del proceso.",
  },
  {
    name: "Ing. Carlos Ramirez Soto",
    role: "Gerente de Planta, Industrial Celaya",
    content:
      "La implementacion de Lean Manufacturing y 5S transformo nuestra planta. Redujimos costos operativos en un 30% y mejoramos significativamente la productividad.",
  },
  {
    name: "Arq. Patricia Mendoza",
    role: "Directora, Grupo Constructor PMG",
    content:
      "Los renders y recorridos virtuales que nos entregaron superaron nuestras expectativas. Sus diseños nos ayudaron a cerrar varios proyectos de inversion.",
  },
  {
    name: "Lic. Fernando Garcia",
    role: "Gerente de Operaciones, AgroTech MX",
    content:
      "El plan de negocios que desarrollo el CIIC fue fundamental para obtener financiamiento. Su enfoque profesional y detallado marco la diferencia.",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, next])

  return (
    <section id="testimonios" className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Testimonios
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Lo que Dicen Nuestros Clientes
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm md:p-12">
            <Quote className="mb-6 h-10 w-10 text-accent/30" />
            <blockquote className="mb-8 text-lg leading-relaxed text-foreground md:text-xl">
              &ldquo;{testimonials[current].content}&rdquo;
            </blockquote>
            <div>
              <p className="text-base font-semibold text-foreground">
                {testimonials[current].name}
              </p>
              <p className="text-sm text-muted-foreground">
                {testimonials[current].role}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-accent"
                      : "w-2.5 bg-border hover:bg-muted-foreground"
                  }`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
