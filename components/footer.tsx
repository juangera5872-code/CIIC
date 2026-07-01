import { Phone, Mail, MapPin, Facebook, MessageCircle } from "lucide-react"

const serviceLinks = [
  "Calidad",
  "Desarrollo de Empresas",
  "Diseno",
  "Comunicacion",
  "Gestion de Proyectos",
  "Ingenieria",
  "Mantenimiento",
  "Tecnologia",
]

const quickLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Servicios", href: "#servicios" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <span className="text-lg font-bold text-accent-foreground">CI</span>
              </div>
              <div>
                <span className="text-sm font-bold leading-tight">CIIC</span>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-primary-foreground/65">
              Colegio de Ingenieros Industriales Celaya. Servicios integrales de
              consultoria, capacitacion e ingenieria industrial.
            </p>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/65">
              <a
                href="tel:+524611234567"
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4" />
                +52 (461) 123 4567
              </a>
              <a
                href="mailto:contacto@ciic.mx"
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4" />
                contacto@ciic.mx
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Celaya, Guanajuato
              </span>
            </div>

            {/* Social / Contact Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.facebook.com/share/14fYCXfiZQg/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siguenos en Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground/80 transition-all hover:-translate-y-0.5 hover:bg-[#1877F2] hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/524792235255"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribenos por WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground/80 transition-all hover:-translate-y-0.5 hover:bg-[#25D366] hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Enlaces
            </h4>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Servicios
            </h4>
            <ul className="flex flex-col gap-2.5">
              {serviceLinks.map((service) => (
                <li key={service}>
                  <a
                    href="#servicios"
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              Horario de Atencion
            </h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/60">
              <div className="flex justify-between">
                <span>Lunes - Viernes</span>
                <span className="text-primary-foreground/80">9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sabado</span>
                <span className="text-primary-foreground/80">9:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo</span>
                <span className="text-primary-foreground/80">Cerrado</span>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-accent/10 p-4">
              <p className="text-xs leading-relaxed text-primary-foreground/70">
                Nuestro chatbot con IA esta disponible 24/7 para responder tus
                preguntas y agendar citas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-primary-foreground/50 sm:flex-row lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Colegio de Ingenieros Industriales
            Celaya. Todos los derechos reservados.
          </p>
          <p>
            Celaya, Guanajuato, Mexico
          </p>
        </div>
      </div>
    </footer>
  )
}
