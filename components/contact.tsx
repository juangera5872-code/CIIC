"use client"

import { useState } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Contact() {
  const [formState, setFormState] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setFormState({ nombre: "", email: "", telefono: "", mensaje: "" })
  }

  return (
    <section id="contacto" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Contacto
          </span>
          <h2 className="mb-6 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Hablemos de tu Proyecto
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Estamos listos para ayudarte. Completa el formulario o contactanos
            directamente.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold text-card-foreground">
                Informacion de Contacto
              </h3>

              <div className="flex flex-col gap-5">
                <a
                  href="tel:+524611234567"
                  className="flex items-start gap-4 text-muted-foreground transition-colors hover:text-accent"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Telefono
                    </p>
                    <p className="text-sm">+52 (461) 123 4567</p>
                  </div>
                </a>

                <a
                  href="mailto:contacto@ciic.mx"
                  className="flex items-start gap-4 text-muted-foreground transition-colors hover:text-accent"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Correo
                    </p>
                    <p className="text-sm">contacto@ciic.mx</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Ubicacion
                    </p>
                    <p className="text-sm">Celaya, Guanajuato, Mexico</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Horario
                    </p>
                    <p className="text-sm">Lun - Vie: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/524611234567?text=Hola%2C%20me%20interesa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 text-base font-semibold text-[#ffffff] transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              Escribenos por WhatsApp
            </a>

            {/* Embedded Map */}
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Ubicacion CIIC Celaya"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119433.28248088277!2d-100.88539485!3d20.52884195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842cbf84aa1c47a5%3A0x1f72b1b3b5f0edaf!2sCelaya%2C%20Gto.!5e0!3m2!1ses!2smx!4v1700000000000!5m2!1ses!2smx"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <h3 className="mb-6 text-lg font-semibold text-card-foreground">
                Enviar Mensaje
              </h3>

              <div className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="nombre"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formState.nombre}
                    onChange={(e) =>
                      setFormState({ ...formState, nombre: e.target.value })
                    }
                    className="h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-card-foreground"
                    >
                      Correo electronico
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefono"
                      className="mb-1.5 block text-sm font-medium text-card-foreground"
                    >
                      Telefono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      value={formState.telefono}
                      onChange={(e) =>
                        setFormState({ ...formState, telefono: e.target.value })
                      }
                      className="h-12 w-full rounded-lg border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="+52 (XXX) XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    required
                    rows={5}
                    value={formState.mensaje}
                    onChange={(e) =>
                      setFormState({ ...formState, mensaje: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Cuentanos sobre tu proyecto o necesidad..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {submitted ? (
                    "Mensaje Enviado"
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
