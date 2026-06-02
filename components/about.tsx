import { Target, Users, TrendingUp, Award } from "lucide-react"

const highlights = [
  {
    icon: Target,
    title: "Mision",
    description:
      "Brindar soluciones integrales de consultoria e ingenieria que impulsen la productividad y competitividad empresarial.",
  },
  {
    icon: TrendingUp,
    title: "Vision",
    description:
      "Ser el referente en consultoria y desarrollo empresarial en la region del Bajio y a nivel nacional.",
  },
  {
    icon: Users,
    title: "Equipo",
    description:
      "Profesionales multidisciplinarios con amplia experiencia en diversos sectores industriales y empresariales.",
  },
  {
    icon: Award,
    title: "Valores",
    description:
      "Compromiso, innovacion, integridad y excelencia en cada proyecto que emprendemos.",
  },
]

export function About() {
  return (
    <section id="nosotros" className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Sobre Nosotros
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Impulsamos el Crecimiento de tu Empresa
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            El Colegio de Ingenieros Industriales Celaya (CIIC) es una
            organizacion especializada en brindar servicios integrales de
            consultoria, capacitacion, ingenieria y desarrollo empresarial,
            impulsando la competitividad y crecimiento sostenible de empresas e
            instituciones.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
