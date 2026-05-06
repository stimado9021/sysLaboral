'use client'
// app/trabajadores/page.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Trabajador {
  id: number
  nombre: string
  cedula: string
  cargo: string
  area: string
  tipo_contrato: string
  fecha_ingreso: string
  activo: boolean
  total_accidentes?: number
}

const QUERY_KEY = ['trabajadores']

function fetchTrabajadores() {
  return fetch('/api/trabajadores').then(res => res.json())
}

export default function TrabajadoresPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTrabajadores,
    select: (r) => r.data as Trabajador[],
  })

  const [busqueda, setBusqueda] = useState('')

  const trabajadores = res || []
  const filtrados = trabajadores.filter(t =>
    !busqueda ||
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.cedula.includes(busqueda) ||
    t.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.area.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '6px' }}>
            // TRABAJADORES
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Registro de Personal</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            {trabajadores.length} trabajador{trabajadores.length !== 1 ? 'es' : ''} registrado{trabajadores.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          className="input-base"
          style={{ maxWidth: '320px', padding: '9px 14px', fontSize: '13px' }}
          placeholder="Buscar por nombre, cédula, cargo o área..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>⟳ Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          {busqueda ? 'Sin resultados para la búsqueda' : 'Los trabajadores se agregan automáticamente al registrar accidentes'}
        </div>
      ) : (
        <div className="panel-dark" style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
           <div style={{
             display: 'grid', gridTemplateColumns: '1fr 130px 160px 130px 110px 80px',
             padding: '12px 16px', background: 'var(--bg-secondary)',
             fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)',
             letterSpacing: '1px', textTransform: 'uppercase',
             borderBottom: '1px solid var(--border)'
           }}>
            <span>Trabajador</span><span>Cédula</span><span>Cargo</span><span>Área</span><span>Contrato</span><span>Accidentes</span>
          </div>
          {filtrados.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 130px 160px 130px 110px 80px',
                padding: '12px 16px', borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.nombre}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                  Ingreso: {t.fecha_ingreso ? new Date(t.fecha_ingreso).toLocaleDateString('es-CO') : '—'}
                </div>
              </div>
               <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{t.cedula}</span>
               <span style={{ fontSize: '13px', color: 'white' }}>{t.cargo}</span>
               <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.area}</span>
               <span style={{
                 fontFamily: 'var(--font-mono)', fontSize: '11px',
                 color: t.tipo_contrato === 'contratista' ? 'var(--warning)' : 'var(--text-secondary)',
                 textTransform: 'uppercase', letterSpacing: '0.5px',
               }}>{t.tipo_contrato}</span>
               <span style={{
                 fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800,
                 color: (t.total_accidentes || 0) > 1 ? 'var(--red)' : (t.total_accidentes || 0) === 1 ? 'var(--orange)' : 'var(--green)',
                 textAlign: 'center',
               }}>
                 {t.total_accidentes || 0}
               </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}