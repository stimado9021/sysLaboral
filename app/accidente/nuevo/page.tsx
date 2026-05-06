'use client'
// app/accidente/nuevo/page.tsx
// Página contenedora del formulario multi-paso
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormularioAccidente from '@/components/forms/FormularioAccidente'
import type { FormularioAccidenteData } from '@/types'

export default function NuevoAccidentePage() {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(data: FormularioAccidenteData) {
    setGuardando(true)
    setError('')
    try {
      const res = await fetch('/api/accidentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar')
      router.push(`/reportes/${json.data.id}?nuevo=1`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setGuardando(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--red)', letterSpacing: '2px', marginBottom: '6px',
        }}>// NUEVO REPORTE</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
          Registro de Accidente / Incidente
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          Complete los 10 bloques — El formulario guarda automáticamente como borrador
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(230,57,70,0.1)', border: '1px solid var(--red)',
          color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '12px 16px', marginBottom: '20px',
        }}>
          ⚠ {error}
        </div>
      )}

      <FormularioAccidente onSubmit={handleSubmit} guardando={guardando} />
    </div>
  )
}
