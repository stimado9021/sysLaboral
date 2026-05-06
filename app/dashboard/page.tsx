'use client'
// app/dashboard/page.tsx — v2: filtros dinámicos + HHT desde configuración
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, CartesianGrid, LabelList
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { interpretarIF } from '@/lib/calcularKPIs'
import { toast } from 'sonner'

const COLORS = ['#e63946','#f4a261','#e9c46a','#2a9d8f','#457b9d','#7b5ea7','#26de81']

interface DashboardData {
  kpisAnuales: {
    total_accidentes: number
    total_incidentes: number
    dias_perdidos: number
    if: number; ig: number; ii: number; ili: number
  }
  accidentes_mortales: number
  porMes: { mes: string; accidentes: number; incidentes: number; dias_perdidos: number }[]
  porArea: { area: string; total: number }[]
  porLesion: { tipo_lesion: string; total: number }[]
  porTurno: { turno: string; total: number }[]
  topCausas: { descripcion: string; frecuencia: number }[]
  estadoAcciones: { estado: string; total: number }[]
}

const meses: Record<string, string> = {
  '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun',
  '07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic'
}

const AÑOS_DISPONIBLES = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

const TIPOS_EVENTO = [
  { value: '', label: 'Todos los eventos' },
  { value: 'accidente_lesion', label: 'Accidentes con lesión' },
  { value: 'accidente_mortal', label: 'Accidentes mortales' },
  { value: 'incidente_peligroso', label: 'Incidentes peligrosos' },
  { value: 'casi_accidente', label: 'Casi accidentes' },
  { value: 'dano_propiedad', label: 'Daño a propiedad' },
  { value: 'enfermedad_laboral', label: 'Enfermedad laboral' },
]

function FilterSelect({
  id, label, value, onChange, children
}: {
  id: string; label: string; value: string | number;
  onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
      <label htmlFor={id} style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px',
      }}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '6px 10px', cursor: 'pointer', outline: 'none',
        }}
      >
        {children}
      </select>
    </div>
  )
}

export default function DashboardPage() {
  const [año, setAño]         = useState(new Date().getFullYear().toString())
  const [area, setArea]       = useState('')
  const [tipoEvento, setTipoEvento] = useState('')
  const [hht, setHht]         = useState(200000)
  const [trabajadores, setTrabajadores] = useState(100)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Leer configuración de empresa desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sst_config')
      if (raw) {
        const cfg = JSON.parse(raw)
        if (cfg.hht_mensual > 0) setHht(cfg.hht_mensual * 12)
        if (cfg.total_trabajadores > 0) setTrabajadores(cfg.total_trabajadores)
      }
    } catch {}
  }, [])

  // Query para áreas disponibles
  const { data: areasData } = useQuery({
    queryKey: ['areas', año, hht, trabajadores],
    queryFn: async () => {
      const r = await fetch(`/api/indicadores?año=${año}&hht=${hht}&trabajadores=${trabajadores}&soloAreas=true`)
      if (!r.ok) throw new Error('Error al cargar áreas')
      return r.json()
    }
  })
  const areasDisponibles = (areasData?.data?.porArea || []).map((p: { area: string }) => p.area)

  // Query principal del Dashboard
  const { data: dashboardResult, isLoading: loading, error } = useQuery({
    queryKey: ['dashboard', año, area, tipoEvento, hht, trabajadores],
    queryFn: async () => {
      const params = new URLSearchParams({ año, hht: hht.toString(), trabajadores: trabajadores.toString() })
      if (area) params.set('area', area)
      if (tipoEvento) params.set('tipo_evento', tipoEvento)
      
      const r = await fetch(`/api/indicadores?${params.toString()}`)
      if (!r.ok) throw new Error('Error al cargar indicadores')
      return r.json()
    }
  })

  useEffect(() => {
    if (error) toast.error('No se pudieron cargar los datos del dashboard')
  }, [error])

  const data = dashboardResult?.data as DashboardData | null

  const kpis = data?.kpisAnuales
  const ifInterpretacion = kpis ? interpretarIF(kpis.if) : null

  const porMesFormateado = (data?.porMes || []).map(m => ({
    ...m,
    mes: meses[m.mes?.split('-')[1]] || m.mes,
  }))

  const hayFiltrosActivos = area !== '' || tipoEvento !== ''

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
        <div>
          <div className="text-[12px] font-bold text-[var(--red)] tracking-wider mb-1.5 opacity-80">
            // DASHBOARD PRINCIPAL
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            Indicadores SST — {año}
            {hayFiltrosActivos && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--orange)', fontWeight: 400,
                marginLeft: '10px', verticalAlign: 'middle',
              }}>
                ● filtrado
              </span>
            )}
          </h1>
          <p className="font-sans text-[13px] md:text-[14px] text-[var(--text-secondary)] font-medium mt-1">
            Actualizado en tiempo real · HHT {hht.toLocaleString()} · {trabajadores} trabajadores
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <button
            id="btn-filtros"
            onClick={() => setMostrarFiltros(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              hayFiltrosActivos 
                ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' 
                : 'bg-white text-[#111827] border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            ⚙ Filtros {hayFiltrosActivos ? `(${[area, tipoEvento].filter(Boolean).length})` : ''}
          </button>
          <a
            id="btn-exportar-csv"
            href={`/api/reportes/consolidado?año=${año}&formato=csv${area ? '&area=' + encodeURIComponent(area) : ''}`}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border bg-white text-[#111827] border-gray-300 hover:bg-gray-50 hover:text-[var(--green)] hover:border-[var(--green)] shadow-sm no-underline"
          >
            ↓ Exportar CSV
          </a>
          <Link href="/accidente/nuevo" className="btn btn-primary">
            + Nuevo Reporte
          </Link>
        </div>
      </div>

      {/* ── PANEL DE FILTROS ─────────────────────────────────── */}
      {mostrarFiltros && (
        <div className="animate-fade-up panel-dark" style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderTop: '2px solid var(--red)', padding: '20px',
          marginBottom: '20px', display: 'flex',
          flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end',
        }}>
          <FilterSelect id="filtro-año" label="Año" value={año} onChange={setAño}>
            {AÑOS_DISPONIBLES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </FilterSelect>

          <FilterSelect id="filtro-area" label="Área" value={area} onChange={setArea}>
            <option value="">Todas las áreas</option>
            {areasDisponibles.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </FilterSelect>

          <FilterSelect id="filtro-tipo" label="Tipo de evento" value={tipoEvento} onChange={setTipoEvento}>
            {TIPOS_EVENTO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </FilterSelect>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
            <label htmlFor="filtro-hht" style={{
              fontSize: '11px', fontWeight: 600,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>HHT Anuales</label>
            <input
              id="filtro-hht"
              type="number"
              value={hht}
              onChange={e => setHht(parseInt(e.target.value) || 200000)}
              style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px',
                padding: '6px 10px', width: '120px', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' }}>
            <label htmlFor="filtro-trab" style={{
              fontSize: '11px', fontWeight: 600,
              color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>Trabajadores</label>
            <input
              id="filtro-trab"
              type="number"
              value={trabajadores}
              onChange={e => setTrabajadores(parseInt(e.target.value) || 100)}
              style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '11px',
                padding: '6px 10px', width: '100px', outline: 'none',
              }}
            />
          </div>

          {hayFiltrosActivos && (
            <button
              id="btn-limpiar-filtros"
              onClick={() => { setArea(''); setTipoEvento('') }}
              style={{
                padding: '6px 14px',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px',
                cursor: 'pointer', letterSpacing: '1px', alignSelf: 'flex-end',
              }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── LOADING ──────────────────────────────────────────── */}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
          <div style={{ fontFamily:'var(--font-mono)', color:'var(--muted)', letterSpacing:'2px' }}>
            ⟳ Cargando indicadores...
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* ── KPI CARDS ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label:'Índice de Frecuencia', val: kpis?.if?.toFixed(2) ?? '—', sub:'(IF = accid. × 10⁶ / HHT)', color:'var(--red)', border:'var(--red)' },
              { label:'Índice de Gravedad',   val: kpis?.ig?.toFixed(2) ?? '—', sub:'(IG = días × 10⁶ / HHT)',   color:'var(--orange)', border:'var(--orange)' },
              { label:'Índice de Incidencia', val: kpis?.ii?.toFixed(2) ?? '—', sub:'(II = accid. / trab. × 1000)', color:'var(--yellow)', border:'var(--yellow)' },
              { label:'Total Accidentes',     val: kpis?.total_accidentes ?? '—', sub:`${data?.accidentes_mortales ?? 0} mortales`, color:'var(--blue)', border:'var(--blue)' },
            ].map((kpi, i) => (
              <div key={i} className="card animate-fade-up kpi-card" style={{
                animationDelay:`${i * 0.06}s`,
                border: 'none', boxShadow: 'var(--shadow)',
              }}>
                <div className="text-[11px] font-bold text-[var(--text-secondary)] tracking-wider uppercase mb-2 opacity-90">
                  {kpi.label}
                </div>
                <div className="text-4xl md:text-[36px] font-extrabold leading-none mb-1" style={{ color: kpi.color }}>
                  {kpi.val}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted)]">
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── NIVEL IF ─────────────────────────────────────── */}
          {ifInterpretacion && (
            <div className="animate-fade-up delay-4" style={{
              background:`${ifInterpretacion.color}15`,
              border:`1px solid ${ifInterpretacion.color}50`,
              padding:'10px 16px', marginBottom:'20px',
              display:'flex', alignItems:'center', gap:'12px',
              fontFamily:'var(--font-mono)', fontSize:'11px',
            }}>
              <span style={{ color:ifInterpretacion.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>
                IF {ifInterpretacion.nivel.toUpperCase()}
              </span>
              <span style={{ color:'var(--muted)' }}>→</span>
              <span style={{ color:'var(--text)' }}>{ifInterpretacion.mensaje}</span>
            </div>
          )}

          {/* ── GRÁFICOS FILA 1 ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Tendencia mensual */}
            <div className="card animate-fade-up delay-5 chart-card">
              <div className="card-title">Tendencia mensual — Accidentes vs Incidentes</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={porMesFormateado}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill:'var(--text-secondary)', fontSize:10, fontFamily:'var(--font-mono)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-secondary)', fontSize:10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--font-mono)', fontSize:11 }} labelStyle={{ color:'var(--text)' }} />
                  <Legend wrapperStyle={{ fontFamily:'var(--font-mono)', fontSize:10, paddingTop: 10, color: 'var(--text)' }} />
                  <Area type="monotone" dataKey="accidentes" name="Accidentes" stroke="var(--red)" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                  <Area type="monotone" dataKey="incidentes" name="Incidentes" stroke="var(--green)" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Por turno */}
            <div className="card animate-fade-up delay-5 chart-card">
              <div className="card-title">Distribución por Turno</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data?.porTurno || []}
                    dataKey="total" nameKey="turno"
                    cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={85}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent||0)*100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data?.porTurno || []).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8, fontFamily:'var(--font-mono)', fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── GRÁFICOS FILA 2 ──────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Por área */}
            <div className="card chart-card">
              <div className="card-title">Accidentes por Área Crítica</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.porArea || []} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="area" width={100} tick={{ fill:'var(--text-secondary)', fontSize:10, fontFamily:'var(--font-mono)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8 }} />
                  <Bar dataKey="total" name="Accidentes" fill="var(--red)" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="total" position="right" fill="var(--text)" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top causas raíz */}
            <div className="card chart-card">
              <div className="card-title">Top 5 Causas Raíz</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.topCausas || []} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="descripcion" width={130} tick={{ fill:'var(--text-secondary)', fontSize:9, fontFamily:'var(--font-mono)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8 }} />
                  <Bar dataKey="frecuencia" name="Frecuencia" fill="var(--orange)" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="frecuencia" position="right" fill="var(--text)" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── TIPO DE LESIÓN ───────────────────────────────── */}
          {(data?.porLesion?.length ?? 0) > 0 && (
            <div className="card mb-4">
              <div className="card-title">Distribución por tipo de lesión</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data?.porLesion || []}>
                  <XAxis dataKey="tipo_lesion" tick={{ fill:'var(--text-secondary)', fontSize:9, fontFamily:'var(--font-mono)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:8 }} />
                  <Bar dataKey="total" name="Total" fill="var(--blue)" radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList dataKey="total" position="top" fill="var(--text)" style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                    {(data?.porLesion || []).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── ACCIONES CORRECTIVAS ─────────────────────────── */}
          <details className="card group" open>
            <summary className="flex justify-between items-center cursor-pointer list-none mb-4">
              <div className="card-title" style={{ margin:0 }}>Estado de acciones correctivas</div>
              <div className="flex items-center gap-3">
                <Link href="/acciones" className="font-mono text-[10px] text-[var(--blue)] no-underline tracking-wider">
                  Ver todas →
                </Link>
                <span className="text-[var(--muted)] group-open:rotate-90 transition-transform">▶</span>
              </div>
            </summary>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(data?.estadoAcciones || []).map((item, i) => {
                const colors: Record<string, string> = {
                  pendiente:'var(--yellow)', en_curso:'var(--blue)',
                  cerrado:'var(--green)', vencido:'var(--red)'
                }
                const color = colors[item.estado] || 'var(--muted)'
                return (
                  <div key={i} className="rounded-lg p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={{
                    background:`${color}10`, border:`1px solid ${color}30`,
                  }}>
                    <div className="text-2xl md:text-[28px] font-extrabold" style={{ color }}>{item.total}</div>
                    <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-wider mt-1">
                      {item.estado.replace('_',' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        </>
      )}
    </motion.div>
  )
}
