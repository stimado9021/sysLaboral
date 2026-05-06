'use client'
// components/SidebarProvider.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => setCollapsed(p => !p), [])
  const toggleMobile = useCallback(() => setMobileOpen(p => !p), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar debe usarse dentro de <SidebarProvider>')
  return ctx
}
