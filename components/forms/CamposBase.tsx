'use client'
// components/forms/CamposBase.tsx
// Componentes base reutilizables para todos los bloques del formulario

import { ReactNode } from 'react'

// ── Campo texto ────────────────────────────────────────────
interface InputProps {
  label: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  hint?: string
  disabled?: boolean
}

export function Campo({ label, value, onChange, type = 'text', placeholder, required, hint, disabled }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label}{required && <span className="text-[var(--red)] ml-0.5">*</span>}
      </label>
      <input
        className="input-base w-full"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 'normal', opacity: 0.9 }}>
          ℹ {hint}
        </span>
      )}
    </div>
  )
}

// ── Campo textarea ─────────────────────────────────────────
interface TextareaProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  required?: boolean
  rows?: number
  hint?: string
}

export function CampoTexto({ label, value, onChange, placeholder, required, rows = 4, hint }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label}{required && <span className="text-[var(--red)] ml-0.5">*</span>}
      </label>
      <textarea
        className="input-base w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
      />
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 'normal', opacity: 0.9 }}>
          ℹ {hint}
        </span>
      )}
    </div>
  )
}

// ── Select / Dropdown ──────────────────────────────────────
interface SelectProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  hint?: string
}

export function CampoSelect({ label, value, onChange, options, required, placeholder = 'Seleccionar...', hint }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label}{required && <span className="text-[var(--red)] ml-0.5">*</span>}
      </label>
      <select
        className="input-base w-full cursor-pointer"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 'normal', opacity: 0.9 }}>
          ℹ {hint}
        </span>
      )}
    </div>
  )
}

// ── Toggle Sí/No ───────────────────────────────────────────
interface ToggleProps {
  label: string
  value: boolean
  onChange: (val: boolean) => void
  hint?: string
}

export function CampoToggle({ label, value, onChange, hint }: ToggleProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[{ v: true, l: '✓ Sí' }, { v: false, l: '✗ No' }].map(opt => (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            style={{
              flex: 1,
              padding: '9px',
              border: `1px solid ${value === opt.v ? (opt.v ? 'var(--green)' : 'var(--red)') : 'rgba(234,179,8,0.5)'}`,
              background: value === opt.v ? (opt.v ? 'rgba(42,157,143,0.12)' : 'rgba(230,57,70,0.12)') : 'transparent',
              color: value === opt.v ? (opt.v ? 'var(--green)' : 'var(--red)') : 'var(--yellow)',
              fontSize: '12px', fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.l}
          </button>
        ))}
      </div>
      {hint && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', lineHeight: 1.5 }}>
          ℹ {hint}
        </span>
      )}
    </div>
  )
}

// ── Grupo de campos en grid ────────────────────────────────
export function Grid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '16px',
    }}>
      {children}
    </div>
  )
}

// ── Separador de sección dentro de un bloque ──────────────
export function SubSeccion({ titulo }: { titulo: string }) {
  return (
    <div style={{
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: 'var(--red)',
      paddingTop: '20px',
      paddingBottom: '6px',
      borderBottom: '1px solid var(--border)',
      marginBottom: '16px',
      opacity: 0.9
    }}>
      // {titulo}
    </div>
  )
}

// ── Checkbox múltiple ──────────────────────────────────────
interface ChecklistProps {
  label: string
  opciones: string[]
  seleccionados: string[]
  onChange: (vals: string[]) => void
}

export function CampoChecklist({ label, opciones, seleccionados, onChange }: ChecklistProps) {
  function toggle(op: string) {
    if (seleccionados.includes(op)) {
      onChange(seleccionados.filter(s => s !== op))
    } else {
      onChange([...seleccionados, op])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {opciones.map(op => {
          const sel = seleccionados.includes(op)
          return (
            <button
              key={op}
              type="button"
              onClick={() => toggle(op)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${sel ? 'var(--orange)' : 'rgba(234,179,8,0.5)'}`,
                background: sel ? 'rgba(244,162,97,0.12)' : 'transparent',
                color: sel ? 'var(--orange)' : 'var(--yellow)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {sel ? '✓ ' : ''}{op}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Lista dinámica (ej: los 5 porqués) ────────────────────
interface ListaDinamicaProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  maxItems?: number
  numerada?: boolean
}

export function ListaDinamica({ label, items, onChange, placeholder = 'Descripción...', maxItems = 10, numerada = false }: ListaDinamicaProps) {
  function actualizar(idx: number, val: string) {
    const nuevo = [...items]
    nuevo[idx] = val
    onChange(nuevo)
  }
  function agregar() {
    if (items.length < maxItems) onChange([...items, ''])
  }
  function eliminar(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label className="form-label">{label}</label>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {numerada && (
            <div style={{
              width: '28px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--dim)',
              fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
              flexShrink: 0,
            }}>{idx + 1}</div>
          )}
          <input
            className="input-base"
            value={item}
            onChange={e => actualizar(idx, e.target.value)}
            placeholder={`${placeholder} ${numerada ? (idx + 1) : ''}`}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => eliminar(idx)}
            style={{
              width: '36px', height: '36px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '16px',
              flexShrink: 0,
            }}
          >×</button>
        </div>
      ))}
      {items.length < maxItems && (
        <button
          type="button"
          onClick={agregar}
          style={{
            padding: '8px',
            background: 'transparent',
            border: '1px dashed var(--border)',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            cursor: 'pointer',
            letterSpacing: '1px',
            transition: 'border-color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--muted)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          + Agregar {label.toLowerCase()}
        </button>
      )}
    </div>
  )
}
