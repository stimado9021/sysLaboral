'use client'
// app/configuracion/page.tsx
import { useState, useEffect } from 'react'

interface Config {
  empresa: string
  nit: string
  arl: string
  ciudad: string
  sector: string
  total_trabajadores: number
  hht_mensual: number
  meta_if: number
  meta_ig: number
}

const SECTORES = [
  'Manufactura / Industria',
  'Construcción',
  'Minería',
  'Oil & Gas / Petroquímica',
  'Agroindustria',
  'Transporte y Logística',
  'Salud',
  'Comercio y Servicios',
  'Servicios Públicos',
  'Otro',
]

export default function ConfiguracionPage() {
  const [config, setConfig]     = useState<Config>({
    empresa: '', nit: '', arl: '', ciudad: '', sector: '',
    total_trabajadores: 0, hht_mensual: 0, meta_if: 3, meta_ig: 50,
  })
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito]         = useState('')
  const [tab, setTab]             = useState<'empresa' | 'indicadores' | 'sistema'>('empresa')

  // Cargar config guardada en localStorage
  useEffect(() => {
    try {
      const guardada = localStorage.getItem('sst_config')
      if (guardada) setConfig(JSON.parse(guardada))
    } catch {}
  }, [])

  async function guardar() {
    setGuardando(true)
    try {
      localStorage.setItem('sst_config', JSON.stringify(config))
      setExito('Configuración guardada correctamente')
      setTimeout(() => setExito(''), 3000)
    } catch {
      alert('Error al guardar')
    }
    setGuardando(false)
  }

  const u = (key: keyof Config, val: string | number) => setConfig(prev => ({ ...prev, [key]: val }))

  const tabs = [
    { key: 'empresa',      label: '🏢 Empresa',    },
    { key: 'indicadores',  label: '📊 Indicadores', },
    { key: 'sistema',      label: '⚙ Sistema',     },
  ] as const

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '6px', opacity: 0.8 }}>
          // ADMIN · CONFIGURACIÓN
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Configuración del Sistema</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          Datos de la empresa y parámetros base para los indicadores
        </p>
      </div>

      {exito && (
        <div style={{
          background: 'rgba(42,157,143,0.12)', border: '1px solid var(--green)',
          color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '10px 16px', marginBottom: '16px',
        }}>
          ✓ {exito}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px',
              background: tab === t.key ? 'var(--panel)' : 'transparent',
              border: `1px solid ${tab === t.key ? 'var(--red)' : 'var(--border)'}`,
              borderBottom: tab === t.key ? '1px solid var(--panel)' : '1px solid var(--border)',
              color: tab === t.key ? 'var(--text)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel-dark" style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderTop: '2px solid var(--red)', padding: '28px' }}>

        {/* ── Tab: Empresa ── */}
        {tab === 'empresa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '4px', opacity: 0.8 }}>
              // DATOS DE LA EMPRESA
            </div>

            <div>
              <label className="form-label">Razón social / Nombre de la empresa *</label>
              <input className="input-base" value={config.empresa} onChange={e => u('empresa', e.target.value)} placeholder="Mi Empresa S.A.S" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">NIT</label>
                <input className="input-base" value={config.nit} onChange={e => u('nit', e.target.value)} placeholder="900.000.000-0" />
              </div>
              <div>
                <label className="form-label">Ciudad / Municipio</label>
                <input className="input-base" value={config.ciudad} onChange={e => u('ciudad', e.target.value)} placeholder="Bogotá, D.C." />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">ARL (Aseguradora de Riesgos Laborales)</label>
                <input className="input-base" value={config.arl} onChange={e => u('arl', e.target.value)} placeholder="Positiva, Sura, Colmena..." />
              </div>
              <div>
                <label className="form-label">Sector económico</label>
                <select className="input-base" value={config.sector} onChange={e => u('sector', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Indicadores ── */}
        {tab === 'indicadores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '4px', opacity: 0.8 }}>
              // DATOS BASE PARA CÁLCULO DE KPIs
            </div>

            <div style={{
              background: 'rgba(69,123,157,0.08)', border: '1px solid rgba(69,123,157,0.3)',
              padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--muted)', lineHeight: 1.7,
            }}>
              ▸ Estos valores se usan como denominador para calcular IF, IG, II e ILI en el dashboard.
              Actualízalos mensualmente para mayor precisión.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Número total de trabajadores (promedio del período)</label>
                <input className="input-base" type="number" value={config.total_trabajadores || ''} onChange={e => u('total_trabajadores', parseInt(e.target.value) || 0)} placeholder="Ej: 120" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  Incluye directos y contratistas
                </span>
              </div>
              <div>
                <label className="form-label">Horas-Hombre Trabajadas (HHT) del período</label>
                <input className="input-base" type="number" value={config.hht_mensual || ''} onChange={e => u('hht_mensual', parseInt(e.target.value) || 0)} placeholder="Ej: 25000" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  Trabajadores × horas × días laborados
                </span>
              </div>
            </div>

            {/* Vista previa */}
            {config.total_trabajadores > 0 && config.hht_mensual > 0 && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>
                  REFERENCIA — Cálculo IF con 1 accidente y {config.hht_mensual.toLocaleString()} HHT:
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--red)' }}>
                  IF = {((1 * 1_000_000) / config.hht_mensual).toFixed(2)}
                </div>
              </div>
            )}

            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '14px', opacity: 0.8 }}>
                // METAS DE SEGURIDAD
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Meta Índice de Frecuencia (IF) ≤</label>
                  <input className="input-base" type="number" step="0.1" value={config.meta_if} onChange={e => u('meta_if', parseFloat(e.target.value) || 0)} placeholder="3.0" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Referencia sector: 2–6
                  </span>
                </div>
                <div>
                  <label className="form-label">Meta Índice de Gravedad (IG) ≤</label>
                  <input className="input-base" type="number" step="1" value={config.meta_ig} onChange={e => u('meta_ig', parseFloat(e.target.value) || 0)} placeholder="50" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Referencia sector: 30–100
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Sistema ── */}
        {tab === 'sistema' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '4px', opacity: 0.8 }}>
              // INFO DEL SISTEMA
            </div>

            {[
              { label: 'Versión del sistema',   value: 'v1.0.0 — Sistema SST' },
              { label: 'Framework',             value: 'Next.js 16 + React 18' },
              { label: 'Base de datos',         value: 'PostgreSQL (Neon Serverless)' },
              { label: 'Autenticación',         value: 'NextAuth.js + JWT' },
              { label: 'Normativa de referencia', value: 'Decreto 1072/2015 · Resolución 0312/2019 · ISO 45001' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)' }}>{item.value}</span>
              </div>
            ))}

            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', marginBottom: '14px', opacity: 0.8 }}>
                // ZONA DE PELIGRO
              </div>
              <div style={{
                border: '1px solid rgba(230,57,70,0.3)',
                padding: '16px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', marginBottom: '8px', fontWeight: 700 }}>
                  ⚠ Limpiar borradores del formulario
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                  Elimina los datos guardados localmente en este navegador. No afecta la base de datos.
                </p>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro? Esto eliminará los borradores guardados en este navegador.')) {
                      localStorage.removeItem('sst_form_draft')
                      alert('Borradores eliminados')
                    }
                  }}
                  style={{
                    padding: '8px 16px', background: 'transparent',
                    border: '1px solid var(--red)', color: 'var(--red)',
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    cursor: 'pointer', letterSpacing: '1px',
                  }}
                >
                  Limpiar borradores
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón guardar */}
        {tab !== 'sistema' && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={guardar}
              disabled={guardando}
              className="btn btn-primary"
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {guardando ? '⟳ Guardando...' : '✓ Guardar configuración'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
