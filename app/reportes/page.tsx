'use client'
// app/reportes/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Reporte {
  id: number
  tipo_evento: string
  fecha_accidente: string
  area: string
  gravedad: string
  estado: string
  trabajador_nombre: string
  trabajador_cargo: string
  dias_incapacidad: number
}

const TIPO_LABEL: Record<string, { label: string; color: string }> = {
  accidente_lesion:    { label: 'Accidente con lesión',   color: 'var(--red)' },
  accidente_mortal:   { label: 'Accidente mortal',        color: '#000' },
  incidente_peligroso:{ label: 'Incidente peligroso',     color: 'var(--orange)' },
  casi_accidente:     { label: 'Casi-accidente',          color: 'var(--yellow)' },
  dano_propiedad:     { label: 'Daño a propiedad',        color: 'var(--blue)' },
  enfermedad_laboral: { label: 'Enfermedad laboral',      color: 'var(--purple)' },
}

const ESTADO_COLOR: Record<string, string> = {
  borrador:         'var(--muted)',
  en_investigacion: 'var(--yellow)',
  cerrado:          'var(--green)',
}

const GRAVEDAD_COLOR: Record<string, string> = {
  leve:     'var(--green)',
  moderada: 'var(--yellow)',
  grave:    'var(--orange)',
  fatal:    'var(--red)',
}

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroArea, setFiltroArea]     = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    if (filtroArea)   params.set('area', filtroArea)

    fetch(`/api/accidentes?${params}`)
      .then(r => r.json())
      .then(r => { setReportes(r.data || []); setTotal(r.total || 0) })
      .finally(() => setLoading(false))
  }, [filtroEstado, filtroArea])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '6px' }}>
            // REPORTES
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            Historial de Accidentes
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            {total} reporte{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/accidente/nuevo" className="btn btn-primary">+ Nuevo Reporte</Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select
          className="input-base"
          style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="en_investigacion">En investigación</option>
          <option value="cerrado">Cerrado</option>
          <option value="borrador">Borrador</option>
        </select>

        <input
          className="input-base"
          style={{ width: '200px', padding: '8px 12px', fontSize: '12px' }}
          placeholder="Filtrar por área..."
          value={filtroArea}
          onChange={e => setFiltroArea(e.target.value)}
        />

        {(filtroEstado || filtroArea) && (
          <button
            onClick={() => { setFiltroEstado(''); setFiltroArea('') }}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '10px' }}
          >
            × Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          ⟳ Cargando reportes...
        </div>
      ) : reportes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          border: '1px dashed var(--border)',
          fontFamily: 'var(--font-mono)', color: 'var(--muted)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <div>No hay reportes registrados aún</div>
          <Link href="/accidente/nuevo" style={{ color: 'var(--red)', textDecoration: 'none', fontSize: '12px', marginTop: '8px', display: 'block' }}>
            → Crear el primer reporte
          </Link>
        </div>
      ) : (
        <div className="reportes-table panel-dark">
          {/* Cabecera — oculta en móvil */}
          <div className="reportes-table-header">
            <span>ID</span>
            <span>Fecha</span>
            <span>Trabajador / Área</span>
            <span>Tipo</span>
            <span>Gravedad</span>
            <span>Estado</span>
            <span className="reportes-col-dias">Días Inc.</span>
            <span className="reportes-col-link"></span>
          </div>

          {/* Filas */}
          {reportes.map((r, idx) => {
            const tipo = TIPO_LABEL[r.tipo_evento] || { label: r.tipo_evento, color: 'var(--muted)' }
            return (
              <div
                key={r.id}
                className="reportes-table-row"
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                  #{r.id}
                </span>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                  {new Date(r.fecha_accidente).toLocaleDateString('es-CO')}
                </span>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
                    {r.trabajador_nombre || 'Sin nombre'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
                    {r.trabajador_cargo || '—'} · {r.area}
                  </div>
                </div>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  color: tipo.color, letterSpacing: '0.5px',
                  border: `1px solid ${tipo.color}40`,
                  padding: '3px 8px',
                  whiteSpace: 'nowrap',
                }}>
                  {tipo.label}
                </span>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: GRAVEDAD_COLOR[r.gravedad] || 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {r.gravedad || '—'}
                </span>

                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: ESTADO_COLOR[r.estado] || 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {r.estado?.replace('_', ' ') || '—'}
                </span>

                <span className="reportes-col-dias font-mono text-xs text-center">
                  {r.dias_incapacidad ?? '—'}
                </span>

                <Link
                  href={`/reportes/${r.id}`}
                  className="reportes-col-link"
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--blue)', textDecoration: 'none',
                    border: '1px solid rgba(69,123,157,0.4)',
                    padding: '5px 10px',
                    display: 'inline-block',
                    transition: 'all 0.15s',
                  }}
                >
                  Ver →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
