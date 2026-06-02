import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/75" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-32 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent opacity-0 animate-fade-in-up">
          Celaya, Guanajuato
        </div>

        <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-primary-foreground opacity-0 animate-fade-in-up animate-delay-100 md:text-5xl lg:text-6xl">
          Servicios Integrales de{" "}
          <span className="text-accent">Consultoria</span> y{" "}
          <span className="text-accent">Capacitacion</span>
        </h1>

        <p className="mb-8 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80 opacity-0 animate-fade-in-up animate-delay-200 md:text-xl">
          Impulsamos la competitividad y el crecimiento sostenible de empresas e
          instituciones con soluciones de ingenieria y desarrollo empresarial.
        </p>

        <div className="flex flex-col items-center gap-4 opacity-0 animate-fade-in-up animate-delay-300 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 min-w-[200px] bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href="#contacto">
              Solicitar Asesoria
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 min-w-[200px] border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <a href="#servicios">Nuestros Servicios</a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 opacity-0 animate-fade-in-up animate-delay-400 md:grid-cols-4">
          {[
            { value: "15+", label: "Anos de experiencia" },
            { value: "500+", label: "Proyectos realizados" },
            { value: "8", label: "Areas de servicio" },
            { value: "100%", label: "Compromiso" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-accent md:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-primary-foreground/70 md:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#nosotros"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 transition-colors hover:text-accent"
        aria-label="Desplazarse hacia abajo"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </a>
    </section>
  )
}
