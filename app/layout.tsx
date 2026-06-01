import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A1F3F',
}

export const metadata: Metadata = {
  title: 'CIIC - Colegio de Ingenieros Industriales Celaya',
  description:
    'Servicios integrales de consultoría industrial, capacitación empresarial, ingeniería y desarrollo empresarial en Celaya, Guanajuato. CIIC impulsa la competitividad y crecimiento sostenible.',
  keywords: [
    'consultoría industrial en Celaya',
    'capacitación empresarial Guanajuato',
    'ingeniería industrial CIIC',
    'desarrollo empresarial Celaya',
    'consultoría de calidad',
    'Six Sigma Celaya',
    'Lean Manufacturing Guanajuato',
  ],
  openGraph: {
    title: 'CIIC - Colegio de Ingenieros Industriales Celaya',
    description:
      'Servicios integrales de consultoría, capacitación e ingeniería industrial.',
    locale: 'es_MX',
    type: 'website',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
