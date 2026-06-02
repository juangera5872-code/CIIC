import { UserCheck, Users, Briefcase, Layers } from "lucide-react"

const benefits = [
  {
    icon: UserCheck,
    title: "Atencion Personalizada",
    description:
      "Cada proyecto es unico. Diseñamos estrategias a la medida de tus necesidades y objetivos empresariales.",
  },
  {
    icon: Users,
    title: "Equipo Multidisciplinario",
    description:
      "Ingenieros, consultores, disenadores y especialistas trabajando juntos para ofrecerte las mejores soluciones.",
  },
  {
    icon: Briefcase,
    title: "Experiencia Industrial",
    description:
      "Anos de trayectoria en el sector industrial y empresarial nos respaldan con casos de exito comprobados.",
  },
  {
    icon: Layers,
    title: "Soluciones en un Solo Lugar",
    description:
      "Desde consultoria de calidad hasta tecnologia de la informacion, todo lo que necesitas bajo un mismo techo.",
  },
]

export function Benefits() {
  return (
    <section id="beneficios" className="bg-primary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Por que Elegirnos
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            Tu Socio Estrategico en Crecimiento
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-primary-foreground/70">
            Combinamos experiencia, innovacion y compromiso para llevar tu
            empresa al siguiente nivel.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => (
            <div key={benefit.title} className="group text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110">
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-primary-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-primary-foreground/65">
                {benefit.description}
              </p>
              {/* Decorative number */}
              <span className="mt-4 inline-block text-4xl font-bold text-primary-foreground/5">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
