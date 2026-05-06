'use client'
// components/forms/CollapsibleSection.tsx
import { useState } from 'react'

interface Props {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({ title, icon, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--panel)] transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors border-none bg-transparent cursor-pointer"
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="font-semibold text-sm flex-1 text-[var(--text)]">{title}</span>
        <span className={`text-[var(--muted)] text-xs transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="p-4 pt-0 border-t border-[var(--border)]">
          {children}
        </div>
      )}
    </div>
  )
}
