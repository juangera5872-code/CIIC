"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Menu, X, Phone, GraduationCap, Facebook, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Servicios", href: "#servicios" },
  { label: "Cursos", href: "#cursos" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2">
          <Image
            src="/images/ciic-logo.png"
            alt="CIIC - Colegio de Ingenieros Industriales Celaya"
            width={140}
            height={56}
            className="h-10 w-auto object-contain md:h-12"
            priority
          />
        </a>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Social Icons */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <a
              href="https://www.facebook.com/share/14fYCXfiZQg/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Siguenos en Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 transition-all hover:bg-[#1877F2] hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me/524792235255"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribenos por WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 transition-all hover:bg-[#25D366] hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="hidden text-primary-foreground/80 hover:bg-white/10 hover:text-accent sm:inline-flex"
          >
            <a href="/plataforma">
              <GraduationCap className="mr-2 h-4 w-4" />
              Plataforma
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="hidden bg-accent text-accent-foreground hover:bg-accent/90 sm:inline-flex"
          >
            <a href="#contacto">
              <Phone className="mr-2 h-4 w-4" />
              Solicitar Asesoria
            </a>
          </Button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-primary-foreground lg:hidden"
            aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary/95 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 pt-2 border-t border-primary-foreground/10">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start text-primary-foreground/80 hover:bg-white/10 hover:text-accent"
              >
                <a href="/plataforma" onClick={() => setMobileOpen(false)}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Plataforma de Cursos
                </a>
              </Button>
            </li>
            <li className="pt-2">
              <Button
                asChild
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <a href="#contacto" onClick={() => setMobileOpen(false)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Solicitar Asesoria
                </a>
              </Button>
            </li>
            <li className="mt-3 flex items-center justify-center gap-3 pt-3">
              <a
                href="https://www.facebook.com/share/14fYCXfiZQg/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siguenos en Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground/80 transition-all hover:bg-[#1877F2] hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/524792235255"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribenos por WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground/80 transition-all hover:bg-[#25D366] hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
