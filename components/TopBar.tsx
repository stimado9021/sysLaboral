'use client'
// components/TopBar.tsx
// Barra superior visible SOLO en móvil y tablet (< lg)
// Contiene: hamburguesa, logo/título de página, y avatar de usuario
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSidebar } from './SidebarProvider'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/accidente/nuevo':  'Nuevo Reporte',
  '/reportes':         'Reportes',
  '/trabajadores':     'Trabajadores',
  '/acciones':         'Acciones',
  '/usuarios':         'Usuarios',
  '/configuracion':    'Configuración',
}

function getTitle(pathname: string): string {
  // Ruta exacta
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Ruta dinámica (/reportes/123)
  for (const key of Object.keys(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return PAGE_TITLES[key]
  }
  return 'SST'
}

export default function TopBar() {
  const { toggleMobile, mobileOpen } = useSidebar()
  const pathname = usePathname()
  const { data: session } = useSession()

  const title = getTitle(pathname)
  const initials = session?.user?.name
    ? session.user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  return (
    <header className="topbar">
      {/* Botón hamburguesa */}
      <button
        id="mobile-menu-toggle"
        onClick={toggleMobile}
        className="topbar-hamburger"
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
      >
        <span className={`hamburger-line ${mobileOpen ? 'open-1' : ''}`} />
        <span className={`hamburger-line ${mobileOpen ? 'open-2' : ''}`} />
        <span className={`hamburger-line ${mobileOpen ? 'open-3' : ''}`} />
      </button>

      {/* Logo + Título */}
      <div className="topbar-brand">
        <div className="topbar-logo">⚠</div>
        <span className="topbar-title">{title}</span>
      </div>

      {/* Avatar usuario */}
      <div className="topbar-avatar" title={session?.user?.name || ''}>
        {initials}
      </div>
    </header>
  )
}
