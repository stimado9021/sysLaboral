// app/layout.tsx
import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { SidebarProvider } from '@/components/SidebarProvider'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Sistema SST'} — Seguridad Industrial`,
  description: 'Sistema de Gestión de Seguridad y Salud en el Trabajo',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${spaceMono.variable}`}>
      <body>
        <SidebarProvider>
          <Providers>{children}</Providers>
        </SidebarProvider>
      </body>
    </html>
  )
}
