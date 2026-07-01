"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  MessageCircle,
  Clock,
  Award,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/*  Config - Datos bancarios y de contacto (faciles de modificar)     */
/* ------------------------------------------------------------------ */
const BANK_INFO = {
  banco: "BBVA Mexico",
  beneficiario: "Colegio de Ingenieros Industriales Celaya A.C.",
  clabe: "012180001234567890",
  cuenta: "0123456789",
  referencia: "CURSO-CIIC",
}

const WHATSAPP_NUMBER = "524792235255"
const WHATSAPP_MESSAGE = (courseName: string, userName: string) =>
  `Hola, soy ${userName}. Acabo de realizar el pago para el curso "${courseName}". Adjunto mi comprobante de pago.`

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Course {
  id: string
  title: string
  duration: string
  level: string
  price: number
}

interface EnrollmentFlowProps {
  course: Course
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  nombre: string
  email: string
  telefono: string
  empresa?: string
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
export function EnrollmentFlow({ course, isOpen, onClose }: EnrollmentFlowProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setFormData({ nombre: "", email: "", telefono: "", empresa: "" })
      setCopiedField(null)
      setIsRedirecting(false)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handlePaymentConfirmed = () => {
    setStep(3)
    setIsRedirecting(true)
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      const message = encodeURIComponent(WHATSAPP_MESSAGE(course.title, formData.nombre))
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank")
    }, 3000)
  }

  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGE(course.title, formData.nombre))
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank")
    onClose()
  }

  const isFormValid = formData.nombre.trim() && formData.email.trim() && formData.telefono.trim()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="relative border-b border-border bg-primary px-6 py-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-primary-foreground/70 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Progress Steps */}
          <div className="mb-3 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    step >= s
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/20 text-primary-foreground/60"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`mx-2 h-0.5 w-8 transition-all duration-300 ${
                      step > s ? "bg-accent" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <h2 className="text-center text-lg font-semibold text-primary-foreground">
            {step === 1 && "Confirma tu Curso"}
            {step === 2 && "Registro y Pago"}
            {step === 3 && "Casi Listo"}
          </h2>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Step 1: Course Confirmation */}
          {step === 1 && (
            <div className="p-6 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
              <div className="mb-6 rounded-xl border border-border bg-secondary/50 overflow-hidden">
                {/* Logo and Price Header */}
                <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
                  <Image
                    src="/images/ciic-logo-emblema.png"
                    alt="CIIC Logo"
                    width={100}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Inversion</span>
                    <p className="text-xl font-bold text-accent">
                      ${course.price.toLocaleString("es-MX")} <span className="text-sm font-normal text-muted-foreground">MXN</span>
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <Award className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {course.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                          {course.level}
                        </span>
                      </div>
                    </div>
                  </div>
                
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Certificacion oficial incluida
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Material didactico digital
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Acceso a plataforma de seguimiento
                  </div>
                </div>
              </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                Continuar con Inscripcion
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Registration & Payment */}
          {step === 2 && (
            <div className="p-6 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
              {/* Registration Form */}
              <div className="mb-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                  <User className="h-4 w-4 text-accent" />
                  Datos de Registro
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Juan Perez Garcia"
                        className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Correo electronico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Telefono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="461 123 4567"
                        className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Empresa (opcional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        placeholder="Mi Empresa S.A. de C.V."
                        className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                  <CreditCard className="h-4 w-4 text-accent" />
                  Pago por Transferencia
                </h3>
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-accent/10 p-3">
                    <span className="text-sm font-medium text-foreground">Total a pagar:</span>
                    <span className="text-xl font-bold text-accent">
                      ${course.price.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Realiza tu transferencia a la siguiente cuenta y guarda tu comprobante:
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: "Banco", value: BANK_INFO.banco, field: "banco" },
                      { label: "Beneficiario", value: BANK_INFO.beneficiario, field: "beneficiario" },
                      { label: "CLABE", value: BANK_INFO.clabe, field: "clabe" },
                      { label: "No. Cuenta", value: BANK_INFO.cuenta, field: "cuenta" },
                      { label: "Referencia", value: BANK_INFO.referencia, field: "referencia" },
                    ].map((item) => (
                      <div
                        key={item.field}
                        className="flex items-center justify-between rounded-lg bg-background p-3"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(item.value, item.field)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
                        >
                          {copiedField === item.field ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atras
                </Button>
                <Button
                  onClick={handlePaymentConfirmed}
                  disabled={!isFormValid}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                >
                  He realizado el pago
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {!isFormValid && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  * Completa todos los campos obligatorios
                </p>
              )}
            </div>
          )}

          {/* Step 3: Success & WhatsApp Redirect */}
          {step === 3 && (
            <div className="p-6 text-center transition-all duration-300 animate-in fade-in slide-in-from-right-4">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Casi Listo!
              </h3>
              <p className="mb-6 text-muted-foreground">
                Gracias, <span className="font-semibold text-foreground">{formData.nombre}</span>.
                <br />
                Solo falta enviarnos tu comprobante de pago por WhatsApp para confirmar tu inscripcion al curso.
              </p>

              <div className="mb-6 rounded-xl border border-border bg-secondary/50 p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Curso seleccionado:
                </p>
                <p className="text-lg font-semibold text-accent">
                  {course.title}
                </p>
              </div>

              {isRedirecting && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo a WhatsApp en 3 segundos...
                </div>
              )}

              <Button
                onClick={handleWhatsAppRedirect}
                size="lg"
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Enviar Comprobante por WhatsApp
              </Button>

              <p className="mt-4 text-xs text-muted-foreground">
                Te enviaremos la confirmacion y detalles del curso a tu correo electronico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
