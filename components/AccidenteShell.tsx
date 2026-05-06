'use client'
// components/AccidenteShell.tsx
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useSidebar } from './SidebarProvider'

export default function AccidenteShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <div className="app-shell">
      <TopBar />
      <Sidebar />
      <main
        className="app-main bg-grid"
        style={{ '--sidebar-w': collapsed ? '60px' : '220px' } as React.CSSProperties}
      >
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  )
}
