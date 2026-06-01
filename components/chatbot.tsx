"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Phone,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  CONFIGURACION FACIL DE PERSONALIZAR                               */
/* ------------------------------------------------------------------ */
const CONFIG = {
  businessName: "CIIC",
  assistantName: "Asistente CIIC",
  welcomeMessage:
    "¡Hola! Bienvenido al CIIC. Soy tu asistente virtual. Puedo ayudarte con informacion sobre nuestros servicios, cursos certificados, horarios y mas. ¿En que puedo ayudarte?",
  availabilityText: "Disponible 24/7",
  inputPlaceholder: "Escribe tu mensaje...",
  whatsappNumber: "524611234567",
  phoneNumber: "+52 (461) 123 4567",
  localStorageKey: "ciic-chat-history",
}

const QUICK_ACTIONS = [
  { label: "Ver servicios", message: "¿Que servicios ofrecen?" },
  { label: "Cursos disponibles", message: "Quiero informacion sobre cursos" },
  { label: "Contacto y horarios", message: "¿Cual es su horario y contacto?" },
  { label: "Solicitar cotizacion", message: "Quiero solicitar una cotizacion" },
]

/* ------------------------------------------------------------------ */
/*  TIPOS                                                              */
/* ------------------------------------------------------------------ */
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

/* ------------------------------------------------------------------ */
/*  COMPONENTE PRINCIPAL                                               */
/* ------------------------------------------------------------------ */
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [hasError, setHasError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---- Cargar historial de localStorage al montar ---- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONFIG.localStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[]
        setMessages(parsed)
      }
    } catch {
      // Si hay error, simplemente empezamos sin historial
    }
  }, [])

  /* ---- Guardar en localStorage cuando cambian los mensajes ---- */
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(messages))
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  }, [messages])

  /* ---- Scroll automatico al ultimo mensaje ---- */
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  /* ---- Focus en input al abrir chat ---- */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  /* ---- Limpiar historial ---- */
  function clearHistory() {
    setMessages([])
    localStorage.removeItem(CONFIG.localStorageKey)
  }

  /* ---- Enviar mensaje ---- */
  async function handleSend(text: string) {
    if (!text.trim() || isLoading) return
    setHasError(false)

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      })

      if (!res.ok) throw new Error("API error")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      const assistantId = crypto.randomUUID()

      // Agregar mensaje vacio del asistente
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ])
      setIsTyping(false)

      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter(Boolean)

        for (const line of lines) {
          if (line.startsWith("2:")) {
            try {
              const textChunk = JSON.parse(line.slice(2))
              fullContent += textChunk
              const captured = fullContent
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: captured } : m
                )
              )
            } catch {
              // Ignorar errores de parsing
            }
          }
        }
      }
    } catch {
      setHasError(true)
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Boton flotante para abrir chat */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Indicador de notificacion */}
        {messages.length === 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            1
          </span>
        )}
      </button>

      {/* Ventana de chat */}
      <div
        className={`fixed bottom-4 right-4 z-50 flex h-[min(560px,90dvh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Bot className="h-5 w-5 text-accent-foreground" />
              {/* Indicador de online */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-foreground">
                {CONFIG.assistantName}
              </p>
              <p className="text-[11px] text-primary-foreground/70">
                {CONFIG.availabilityText}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label="Limpiar historial"
                title="Limpiar historial"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <a
              href={`https://wa.me/${CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Contactar por WhatsApp"
              title="WhatsApp"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-4">
              {/* Mensaje de bienvenida */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
                  {CONFIG.welcomeMessage}
                </div>
              </div>

              {/* Acciones rapidas */}
              <div className="flex flex-col gap-2 pl-10">
                <p className="text-xs font-medium text-muted-foreground">
                  Preguntas frecuentes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.message)}
                      className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-accent hover:bg-accent/5 hover:text-accent active:scale-95"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-accent text-accent-foreground"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "rounded-br-sm bg-accent text-accent-foreground"
                          : "rounded-bl-sm bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.content || (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                          <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Indicador de escribiendo */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current" />
                    </span>
                  </div>
                </div>
              )}

              {/* Mensaje de error */}
              {hasError && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-red-50 px-4 py-2.5 text-sm leading-relaxed text-red-700">
                    Lo sentimos, ocurrio un error. Por favor intentalo de nuevo o{" "}
                    <a
                      href={`https://wa.me/${CONFIG.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      contactanos por WhatsApp
                    </a>
                    .
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
          className="flex items-center gap-2 border-t border-border bg-card p-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={CONFIG.inputPlaceholder}
            disabled={isLoading}
            className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-all hover:bg-accent/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        {/* Footer con marca */}
        <div className="border-t border-border bg-secondary/50 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            Asistente virtual de {CONFIG.businessName} | Respuestas automaticas
          </p>
        </div>
      </div>
    </>
  )
}
