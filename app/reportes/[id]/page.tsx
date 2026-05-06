'use client'
// app/reportes/[id]/page.tsx
// Vista completa de un reporte individual con exportación PDF

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import EvidenciaUpload from '@/components/EvidenciaUpload'

interface AccidenteDetalle {
  id: number
  tipo_evento: string
  fecha_accidente: string
  hora_accidente: string
  area: string
  ubicacion_especifica: string
  turno: string
  descripcion: string
  forma_accidente: string
  agente_causante: string
  equipo_involucrado: string
  tipo_lesion: string
  parte_cuerpo: string
  gravedad: string
  dias_incapacidad: number
  requirio_hospitalizacion: boolean
  requirio_cirugia: boolean
  centro_medico: string
  diagnostico: string
  costo_dano_material: number
  horas_paro_produccion: number
  supervisor_nombre: string
  supervisor_presente: boolean
  acciones_inmediatas: string
  se_aviso_arl: boolean
  se_suspendio_actividad: boolean
  estado: string
  tenia_procedimiento: boolean
  conocia_procedimiento: boolean
  tenia_analisis_riesgo: boolean
  tenia_permiso_trabajo: boolean
  created_at: string
  // Trabajador
  trabajador_nombre: string
  cedula: string
  cargo: string
  tipo_contrato: string
  fecha_ingreso: string
  empresa_contratista: string
  // Relaciones
  causas: { id: number; tipo: string; descripcion: string; es_causa_raiz: boolean; nivel_porque: number; categoria_6m: string }[]
  acciones: { id: number; descripcion: string; responsable: string; fecha_limite: string; estado: string }[]
  epp: { tipo_epp: string; lo_portaba: boolean | null; buen_estado: boolean | null }[]
  testigos: { nombre: string; cargo: string; declaracion_tomada: boolean }[]
}

const ESTADO_COLOR: Record<string, string> = {
  borrador: 'var(--muted)', en_investigacion: 'var(--yellow)', cerrado: 'var(--green)'
}
const GRAVEDAD_COLOR: Record<string, string> = {
  leve: 'var(--green)', moderada: 'var(--yellow)', grave: 'var(--orange)', fatal: 'var(--red)'
}
const ACCION_COLOR: Record<string, string> = {
  pendiente: 'var(--yellow)', en_curso: 'var(--blue)', cerrado: 'var(--green)', vencido: 'var(--red)'
}

function Fila({ label, value, full = false }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div style={{
      gridColumn: full ? '1 / -1' : undefined,
      borderBottom: '1px solid var(--border)',
      padding: '10px 14px',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
        {value || <span style={{ color: 'var(--border)' }}>—</span>}
      </div>
    </div>
  )
}

function SeccionHeader({ titulo, icono }: { titulo: string; icono: string }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'var(--dim)',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderBottom: '1px solid var(--border)',
    }}>
      <span>{icono}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 700 }}>
        {titulo}
      </span>
    </div>
  )
}

export default function ReporteDetallePage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const reporteRef   = useRef<HTMLDivElement>(null)

  const [data, setData]           = useState<AccidenteDetalle | null>(null)
  const [loading, setLoading]     = useState(true)
  const [exportando, setExportando] = useState(false)
  const [estadoActualizando, setEstadoActualizando] = useState(false)
  const esNuevo = searchParams.get('nuevo') === '1'

  const id = params.id as string

  useEffect(() => {
    fetch(`/api/accidentes/${id}`)
      .then(r => r.json())
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [id])

  async function cambiarEstado(nuevoEstado: string) {
    setEstadoActualizando(true)
    await fetch(`/api/accidentes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setData(prev => prev ? { ...prev, estado: nuevoEstado } : prev)
    setEstadoActualizando(false)
  }

  async function exportarPDF() {
    setExportando(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210; const M = 15; const CW = W - M * 2

      // Colores
      const ROJO   = [230, 57, 70]   as [number, number, number]
      const OSCURO = [14, 17, 23]    as [number, number, number]
      const GRIS   = [26, 32, 48]    as [number, number, number]
      const TEXTO  = [232, 237, 245] as [number, number, number]
      const MUTED  = [90, 101, 128]  as [number, number, number]

      // Fondo negro
      doc.setFillColor(...OSCURO)
      doc.rect(0, 0, W, 297, 'F')

      // Header rojo
      doc.setFillColor(...ROJO)
      doc.rect(0, 0, W, 28, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('REPORTE DE INVESTIGACIÓN DE ACCIDENTE', M, 12)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`FOR-SST-INVEST-001 | ID: #${data?.id} | ${new Date(data?.created_at || '').toLocaleDateString('es-CO')}`, M, 20)
      doc.text(data?.estado?.replace('_', ' ').toUpperCase() || '', W - M, 20, { align: 'right' })

      let y = 36

      const seccion = (titulo: string) => {
        doc.setFillColor(...GRIS)
        doc.rect(M, y, CW, 7, 'F')
        doc.setTextColor(...ROJO)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text(`// ${titulo}`, M + 3, y + 5)
        y += 11
      }

      const campo = (label: string, value: string, x: number, ancho: number) => {
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.text(label.toUpperCase(), x, y)
        doc.setTextColor(...TEXTO)
        doc.setFontSize(9)
        doc.text(value || '—', x, y + 5)
        return y + 12
      }

      // ── Sección 1 ──────────────────────────────────
      seccion('INFORMACIÓN GENERAL DEL EVENTO')
      campo('Tipo de evento', data?.tipo_evento?.replace(/_/g, ' ') || '—', M, CW / 3)
      campo('Fecha', new Date(data?.fecha_accidente || '').toLocaleDateString('es-CO'), M + CW / 3, CW / 3)
      campo('Hora', data?.hora_accidente || '—', M + (CW * 2) / 3, CW / 3)
      y += 12
      campo('Área', data?.area || '—', M, CW / 2)
      campo('Ubicación específica', data?.ubicacion_especifica || '—', M + CW / 2, CW / 2)
      y += 12

      // ── Sección 2 ──────────────────────────────────
      seccion('DATOS DEL TRABAJADOR')
      campo('Nombre completo', data?.trabajador_nombre || '—', M, CW / 2)
      campo('Cédula', data?.cedula || '—', M + CW / 2, CW / 2)
      y += 12
      campo('Cargo', data?.cargo || '—', M, CW / 2)
      campo('Tipo de contrato', data?.tipo_contrato || '—', M + CW / 2, CW / 2)
      y += 12

      // ── Sección 3 ──────────────────────────────────
      seccion('DESCRIPCIÓN DEL ACCIDENTE')
      doc.setTextColor(...MUTED)
      doc.setFontSize(7)
      doc.text('DESCRIPCIÓN', M, y)
      y += 4
      doc.setTextColor(...TEXTO)
      doc.setFontSize(9)
      const lineas = doc.splitTextToSize(data?.descripcion || '—', CW)
      doc.text(lineas, M, y)
      y += lineas.length * 5 + 6

      campo('Forma del accidente', data?.forma_accidente?.replace(/_/g, ' ') || '—', M, CW / 2)
      campo('Agente causante', data?.agente_causante?.replace(/_/g, ' ') || '—', M + CW / 2, CW / 2)
      y += 12

      // ── Sección 4 ──────────────────────────────────
      if (y > 230) { doc.addPage(); doc.setFillColor(...OSCURO); doc.rect(0, 0, W, 297, 'F'); y = 15 }
      seccion('LESIONES Y ATENCIÓN MÉDICA')
      campo('Tipo de lesión', data?.tipo_lesion?.replace(/_/g, ' ') || '—', M, CW / 3)
      campo('Parte del cuerpo', data?.parte_cuerpo || '—', M + CW / 3, CW / 3)
      campo('Gravedad', data?.gravedad || '—', M + (CW * 2) / 3, CW / 3)
      y += 12
      campo('Días de incapacidad', String(data?.dias_incapacidad || 0), M, CW / 3)
      campo('Diagnóstico', data?.diagnostico || '—', M + CW / 3, (CW * 2) / 3)
      y += 12

      // ── Sección 5: Causas ──────────────────────────
      if (y > 210) { doc.addPage(); doc.setFillColor(...OSCURO); doc.rect(0, 0, W, 297, 'F'); y = 15 }
      seccion('ANÁLISIS DE CAUSAS — 5 PORQUÉS')
      const porques = data?.causas?.filter(c => c.tipo === 'causa_raiz').sort((a, b) => a.nivel_porque - b.nivel_porque) || []
      if (porques.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['#', 'Porqué', 'Causa Raíz']],
          body: porques.map(c => [c.nivel_porque, c.descripcion, c.es_causa_raiz ? '★ SÍ' : '']),
          theme: 'plain',
          styles: { fillColor: OSCURO, textColor: TEXTO, fontSize: 8, font: 'helvetica' },
          headStyles: { fillColor: GRIS, textColor: MUTED, fontSize: 7 },
          columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 20 } },
          margin: { left: M, right: M },
        })
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
      }

      // ── Sección 6: Acciones ────────────────────────
      if (y > 210) { doc.addPage(); doc.setFillColor(...OSCURO); doc.rect(0, 0, W, 297, 'F'); y = 15 }
      seccion('PLAN DE ACCIÓN CORRECTIVA')
      if (data?.acciones?.length) {
        autoTable(doc, {
          startY: y,
          head: [['Acción', 'Responsable', 'Fecha Límite', 'Estado']],
          body: data.acciones.map(a => [a.descripcion, a.responsable, new Date(a.fecha_limite).toLocaleDateString('es-CO'), a.estado]),
          theme: 'plain',
          styles: { fillColor: OSCURO, textColor: TEXTO, fontSize: 8 },
          headStyles: { fillColor: GRIS, textColor: MUTED, fontSize: 7 },
          margin: { left: M, right: M },
        })
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
      }

      // ── Firmas ─────────────────────────────────────
      if (y > 240) { doc.addPage(); doc.setFillColor(...OSCURO); doc.rect(0, 0, W, 297, 'F'); y = 15 }
      seccion('FIRMAS Y VALIDACIÓN')
      const firmas = ['Investigador HSE', 'Supervisor Directo', 'Trabajador Lesionado']
      firmas.forEach((firma, i) => {
        const x = M + i * (CW / 3)
        doc.setDrawColor(...GRIS)
        doc.line(x, y + 16, x + CW / 3 - 8, y + 16)
        doc.setTextColor(...MUTED)
        doc.setFontSize(7)
        doc.text(firma.toUpperCase(), x, y + 22)
      })

      // Footer en cada página
      const totalPaginas = doc.getNumberOfPages()
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        doc.setFillColor(...GRIS)
        doc.rect(0, 287, W, 10, 'F')
        doc.setTextColor(...MUTED)
        doc.setFontSize(7)
        doc.text(`Sistema SST | Reporte #${data?.id} | Pág. ${i} de ${totalPaginas}`, M, 293)
        doc.text(new Date().toLocaleString('es-CO'), W - M, 293, { align: 'right' })
      }

      doc.save(`Reporte-Accidente-${data?.id}-${data?.trabajador_nombre?.split(' ')[0] || 'SST'}.pdf`)
    } catch (err) {
      console.error('Error al exportar PDF:', err)
      alert('Error al generar el PDF. Revisa la consola.')
    }
    setExportando(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '2px' }}>⟳ Cargando reporte...</div>
    </div>
  )

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Reporte no encontrado</div>
      <Link href="/reportes" style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '12px', marginTop: '8px', display: 'block' }}>← Volver a reportes</Link>
    </div>
  )

  return (
    <div ref={reporteRef}>
      {/* Éxito al crear */}
      {esNuevo && (
        <div style={{
          background: 'rgba(42,157,143,0.12)', border: '1px solid var(--green)',
          color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          ✓ Reporte #{data.id} creado exitosamente y guardado en la base de datos.
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <Link href="/reportes" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textDecoration: 'none', letterSpacing: '1px' }}>
            ← REPORTES
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', marginBottom: '4px' }}>
            Reporte #{data.id}
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: ESTADO_COLOR[data.estado] || 'var(--muted)',
              border: `1px solid ${ESTADO_COLOR[data.estado]}40`,
              padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              {data.estado?.replace('_', ' ')}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
              {new Date(data.fecha_accidente).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Cambiar estado */}
          {data.estado !== 'cerrado' && (
            <button
              onClick={() => cambiarEstado(data.estado === 'borrador' ? 'en_investigacion' : 'cerrado')}
              disabled={estadoActualizando}
              className="btn btn-secondary"
              style={{ fontSize: '10px' }}
            >
              {estadoActualizando ? '⟳' : data.estado === 'borrador' ? '→ Iniciar investigación' : '✓ Cerrar reporte'}
            </button>
          )}

          {/* Exportar PDF */}
          <button
            onClick={exportarPDF}
            disabled={exportando}
            className="btn btn-primary"
          >
            {exportando ? '⟳ Generando...' : '↓ Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Contenido del reporte */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>

        {/* Bloque 1 + 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <SeccionHeader titulo="Información General del Evento" icono="📍" />
          <Fila label="Tipo de evento" value={data.tipo_evento?.replace(/_/g, ' ')} />
          <Fila label="Área" value={data.area} />
          <Fila label="Hora del accidente" value={data.hora_accidente} />
          <Fila label="Turno" value={data.turno} />
          <Fila label="Ubicación específica" value={data.ubicacion_especifica} full />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <SeccionHeader titulo="Trabajador Lesionado" icono="👷" />
          <Fila label="Nombre completo" value={data.trabajador_nombre} />
          <Fila label="Cédula / ID" value={data.cedula} />
          <Fila label="Cargo" value={data.cargo} />
          <Fila label="Tipo de contrato" value={data.tipo_contrato?.replace(/_/g, ' ')} />
          {data.empresa_contratista && <Fila label="Empresa contratista" value={data.empresa_contratista} full />}
          <Fila label="Fecha de ingreso" value={data.fecha_ingreso ? new Date(data.fecha_ingreso).toLocaleDateString('es-CO') : '—'} />
          <Fila label="Tenía procedimiento" value={data.tenia_procedimiento ? '✓ Sí' : '✗ No'} />
        </div>

        {/* Bloque 3 */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <SeccionHeader titulo="Descripción del Accidente" icono="📝" />
            <Fila label="Descripción completa" value={data.descripcion} full />
            <Fila label="Forma del accidente" value={data.forma_accidente?.replace(/_/g, ' ')} />
            <Fila label="Agente causante" value={data.agente_causante?.replace(/_/g, ' ')} />
            {data.equipo_involucrado && <Fila label="Equipo / Máquina involucrada" value={data.equipo_involucrado} full />}
          </div>
        </div>

        {/* Bloque 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <SeccionHeader titulo="Lesiones y Atención Médica" icono="🏥" />
          <Fila label="Tipo de lesión" value={data.tipo_lesion?.replace(/_/g, ' ')} />
          <Fila label="Gravedad" value={
            <span style={{ color: GRAVEDAD_COLOR[data.gravedad] || 'var(--text)', textTransform: 'uppercase', fontWeight: 700 }}>
              {data.gravedad}
            </span>
          } />
          <Fila label="Parte del cuerpo afectada" value={data.parte_cuerpo} />
          <Fila label="Días de incapacidad" value={
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--orange)' }}>
              {data.dias_incapacidad}
            </span>
          } />
          <Fila label="Diagnóstico médico" value={data.diagnostico} full />
          <Fila label="Requirió hospitalización" value={data.requirio_hospitalizacion ? '✓ Sí' : '✗ No'} />
          <Fila label="Requirió cirugía" value={data.requirio_cirugia ? '✓ Sí' : '✗ No'} />
          {data.costo_dano_material > 0 && (
            <Fila label="Costo daño material" value={`$ ${data.costo_dano_material.toLocaleString('es-CO')}`} />
          )}
          {data.horas_paro_produccion > 0 && (
            <Fila label="Horas paro producción" value={`${data.horas_paro_produccion} hrs`} />
          )}
        </div>

        {/* Causas */}
        {data.causas?.length > 0 && (
          <div style={{ border: '1px solid var(--border)', background: 'var(--panel)', padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
              <SeccionHeader titulo="Análisis de Causas — 5 Porqués" icono="🔍" />
            </div>
            <div style={{ padding: '16px' }}>
              {data.causas.filter(c => c.tipo === 'causa_raiz').sort((a, b) => a.nivel_porque - b.nivel_porque).map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    background: c.es_causa_raiz ? 'var(--red)' : 'var(--dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                    color: c.es_causa_raiz ? '#fff' : 'var(--muted)',
                  }}>
                    {c.nivel_porque}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', marginBottom: '2px' }}>{c.descripcion}</div>
                    {c.es_causa_raiz && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--red)', letterSpacing: '1px' }}>
                        ★ CAUSA RAÍZ
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Actos y condiciones inseguras */}
              {data.causas.filter(c => c.tipo !== 'causa_raiz').length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Actos y condiciones inseguras
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {data.causas.filter(c => c.tipo !== 'causa_raiz').map(c => (
                      <span key={c.id} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10px',
                        padding: '4px 10px',
                        border: `1px solid ${c.tipo === 'acto_inseguro' ? 'var(--orange)' : 'var(--blue)'}40`,
                        color: c.tipo === 'acto_inseguro' ? 'var(--orange)' : 'var(--blue)',
                      }}>
                        {c.tipo === 'acto_inseguro' ? '⚡' : '⚠'} {c.descripcion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones correctivas */}
        {data.acciones?.length > 0 && (
          <div style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
              <SeccionHeader titulo="Plan de Acción Correctiva" icono="✅" />
            </div>
            <div style={{ padding: '0' }}>
              {data.acciones.map((a, idx) => (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 160px 140px 100px',
                  gap: '0', padding: '12px 16px',
                  borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: '13px' }}>{a.descripcion}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>{a.responsable}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                    {new Date(a.fecha_limite).toLocaleDateString('es-CO')}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: ACCION_COLOR[a.estado] || 'var(--muted)',
                    border: `1px solid ${ACCION_COLOR[a.estado]}40`,
                    padding: '3px 8px', textTransform: 'uppercase', textAlign: 'center',
                  }}>
                    {a.estado?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testigos */}
        {data.testigos?.length > 0 && (
          <div style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
              <SeccionHeader titulo="Testigos" icono="👁" />
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {data.testigos.map((t, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', padding: '10px 14px', minWidth: '180px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.nombre}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{t.cargo}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: t.declaracion_tomada ? 'var(--green)' : 'var(--muted)', marginTop: '6px' }}>
                    {t.declaracion_tomada ? '✓ Declaración tomada' : '○ Sin declaración'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidencias */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            <SeccionHeader titulo="Evidencias y Documentos" icono="📎" />
          </div>
          <div style={{ padding: '20px' }}>
            <EvidenciaUpload
              accidenteId={data.id}
              readOnly={data.estado === 'cerrado'}
            />
          </div>
        </div>

        {/* Supervisor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', background: 'var(--panel)' }}>
          <SeccionHeader titulo="Supervisor y Gestión" icono="👔" />
          <Fila label="Supervisor directo" value={data.supervisor_nombre} />
          <Fila label="Estaba presente" value={data.supervisor_presente ? '✓ Sí' : '✗ No'} />
          <Fila label="Se avisó a la ARL" value={data.se_aviso_arl ? '✓ Sí' : '✗ No'} />
          <Fila label="Se suspendió la actividad" value={data.se_suspendio_actividad ? '✓ Sí' : '✗ No'} />
          {data.acciones_inmediatas && <Fila label="Acciones inmediatas tomadas" value={data.acciones_inmediatas} full />}
        </div>

      </div>
    </div>
  )
}
