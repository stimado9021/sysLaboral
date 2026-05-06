'use client'
// app/acciones/page.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

interface Accion {
  id: number
  accidente_id: number
  descripcion: string
  responsable: string
  fecha_limite: string
  estado: string
  fecha_cierre: string | null
  created_at: string
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'var(--yellow)',
  en_curso:  'var(--blue)',
  cerrado:   'var(--green)',
  vencido:   'var(--red)',
}

const QUERY_KEY = ['acciones']

function fetchAcciones() {
  return fetch('/api/acciones').then(res => res.json())
}

export default function AccionesPage() {
  const queryClient = useQueryClient()
  const [filtro, setFiltro] = useState('')

  const { data: res, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAcciones,
    select: (r) => r.data as Accion[],
  })

  const acciones = res || []

  const cambiarEstadoMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => fetch(`/api/acciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    }).then(r => r.json()),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Accion[]>(QUERY_KEY)

      queryClient.setQueryData<Accion[]>(QUERY_KEY, (old) =>
        old?.map(a => a.id === id ? { ...a, estado } : a)
      )

      return { previous }
    },
    onError: (_err, vars, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    cambiarEstadoMut.mutate({ id, estado: nuevoEstado })
  }

  const filtradas = acciones.filter(a =>
    !filtro || a.estado === filtro
  )

  const conteos = {
    pendiente: acciones.filter(a => a.estado === 'pendiente').length,
    en_curso:  acciones.filter(a => a.estado === 'en_curso').length,
    vencido:   acciones.filter(a => a.estado === 'vencido').length,
    cerrado:   acciones.filter(a => a.estado === 'cerrado').length,
  }

  const hoy = new Date()
  const isPending = cambiarEstadoMut.isPending

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '6px' }}>
            // ACCIONES CORRECTIVAS
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            Plan de Acción
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            Seguimiento de acciones derivadas de investigaciones
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', marginBottom: '20px' }}>
        {[
          { key: 'pendiente', label: 'Pendientes',  icon: '○' },
          { key: 'en_curso',  label: 'En curso',    icon: '◑' },
          { key: 'vencido',   label: 'Vencidas',    icon: '⚠' },
          { key: 'cerrado',   label: 'Cerradas',    icon: '✓' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFiltro(filtro === key ? '' : key)}
            className="panel-dark"
            style={{
              background: filtro === key ? `${ESTADO_COLOR[key]}15` : 'var(--panel)',
              border: `1px solid ${filtro === key ? ESTADO_COLOR[key] : 'var(--border)'}`,
              borderTop: `2px solid ${ESTADO_COLOR[key]}`,
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 800, color: ESTADO_COLOR[key], lineHeight: 1 }}>
              {conteos[key as keyof typeof conteos]}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              {icon} {label}
            </div>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          ⟳ Cargando...
        </div>
      ) : filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          No hay acciones {filtro ? `con estado "${filtro}"` : 'registradas'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {filtradas.map(a => {
            const vencida  = new Date(a.fecha_limite) < hoy && a.estado !== 'cerrado'
            const diasRest = Math.ceil((new Date(a.fecha_limite).getTime() - hoy.getTime()) / 86400000)
            return (
              <div key={a.id} className="panel-dark" style={{
                background: 'var(--panel)',
                border: `1px solid ${vencida ? 'rgba(230,57,70,0.3)' : 'var(--border)'}`,
                borderLeft: `3px solid ${ESTADO_COLOR[a.estado]}`,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 180px 140px 160px',
                gap: '16px',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    {a.descripcion}
                  </div>
                  <Link
                    href={`/reportes/${a.accidente_id}`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--blue)', textDecoration: 'none', letterSpacing: '0.5px' }}
                  >
                    → Ver reporte #{a.accidente_id}
                  </Link>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '3px', textTransform: 'uppercase' }}>Responsable</div>
                  <div style={{ fontSize: '12px' }}>{a.responsable}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '3px', textTransform: 'uppercase' }}>Fecha límite</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: vencida ? 'var(--red)' : 'var(--text)' }}>
                    {new Date(a.fecha_limite).toLocaleDateString('es-CO')}
                  </div>
                  {a.estado !== 'cerrado' && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: vencida ? 'var(--red)' : diasRest <= 5 ? 'var(--orange)' : 'var(--muted)', marginTop: '2px' }}>
                      {vencida ? `⚠ Vencida hace ${Math.abs(diasRest)} días` : `${diasRest} días restantes`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: ESTADO_COLOR[a.estado],
                    border: `1px solid ${ESTADO_COLOR[a.estado]}40`,
                    padding: '3px 10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {a.estado.replace('_', ' ')}
                  </span>

                  {a.estado !== 'cerrado' && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {a.estado === 'pendiente' && (
                        <button
                          onClick={() => cambiarEstado(a.id, 'en_curso')}
                          disabled={isPending}
                          style={{
                            padding: '4px 10px',
                            background: 'transparent',
                            border: '1px solid var(--blue)',
                            color: 'var(--blue)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                          }}
                        >
                          → En curso
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(a.id, 'cerrado')}
                        disabled={isPending}
                        style={{
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid var(--green)',
                          color: 'var(--green)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          cursor: 'pointer',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {isPending ? '⟳' : '✓ Cerrar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}