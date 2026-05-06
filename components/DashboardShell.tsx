'use client'
// components/DashboardShell.tsx
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useSidebar } from './SidebarProvider'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="app-shell">
      {/* TopBar solo visible en móvil/tablet */}
      <TopBar />

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <main
        className="app-main"
        style={{ '--sidebar-w': collapsed ? '60px' : '220px' } as React.CSSProperties}
      >
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  )
}
