'use client'
// components/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useSidebar } from './SidebarProvider'

const navItems = [
  { href: '/dashboard',        icon: '▦', label: 'Dashboard' },
  { href: '/accidente/nuevo',  icon: '+', label: 'Nuevo Reporte' },
  { href: '/reportes',         icon: '≡', label: 'Reportes' },
  { href: '/trabajadores',     icon: '⊙', label: 'Trabajadores' },
  { href: '/acciones',         icon: '✓', label: 'Acciones' },
]

const adminItems = [
  { href: '/usuarios',  icon: '◈', label: 'Usuarios' },
  { href: '/configuracion', icon: '⚙', label: 'Configuración' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar()
  const rol = (session?.user as { role?: string })?.role

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen z-[100]
        bg-[var(--panel)] border-r border-[var(--border)]
        flex flex-col
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${collapsed ? 'w-[60px]' : 'w-[220px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Botón toggle (solo desktop) */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-[var(--panel)] border border-[var(--border)] rounded-full items-center justify-center text-[10px] text-[var(--muted)] hover:text-[var(--text)] transition-colors z-10"
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
            ⚠
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm">{process.env.NEXT_PUBLIC_APP_NAME || 'SST'}</div>
              <div className="font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-wider opacity-90">Sistema SST</div>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className={`font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-widest px-3 py-2 opacity-90 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? '//' : '// Principal'}
          </div>

          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`
                flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium
                transition-all duration-200 no-underline
                ${isActive(item.href)
                  ? 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]'
                  : 'text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="font-mono text-sm flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {rol === 'admin' && (
            <>
              <div className={`font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-widest px-3 py-2 mt-4 opacity-90 ${collapsed ? 'text-center' : ''}`}>
                {collapsed ? '//' : '// Admin'}
              </div>
              {adminItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium
                    transition-all duration-200 no-underline
                    ${isActive(item.href)
                      ? 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24]'
                      : 'text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="font-mono text-sm flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Usuario + Logout */}
        <div className="p-4 border-t border-[var(--border)]">
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs font-semibold">{session?.user?.name}</div>
              <div className="font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider opacity-90">{rol}</div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`
              w-full bg-transparent border border-[var(--border)] text-[var(--text-secondary)]
              font-mono text-[11px] uppercase tracking-wider py-2 rounded-lg
              hover:bg-[var(--bg-secondary)] transition-colors
              ${collapsed ? 'px-0' : 'px-3'}
            `}
          >
            {collapsed ? '←' : '← Cerrar sesión'}
          </button>
        </div>
      </aside>
    </>
  )
}
