'use client'
// components/MobileMenuButton.tsx
import { useSidebar } from './SidebarProvider'

export default function MobileMenuButton() {
  const { toggleMobile } = useSidebar()

  return (
    <button onClick={toggleMobile} className="mobile-menu-btn lg:hidden">
      ☰
    </button>
  )
}
