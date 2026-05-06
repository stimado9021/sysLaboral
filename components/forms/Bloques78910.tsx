'use client'
// components/forms/Bloques78910.tsx
// Bloque 7: Testigos y evidencias
// Bloque 8: Supervisor y gestión
// Bloque 9: Plan de acción correctiva
// Bloque 10: Datos para KPIs

import { Campo, CampoToggle, CampoTexto, Grid, SubSeccion, CampoChecklist } from './CamposBase'
import type { FormularioAccidenteData } from '@/types'

// ─────────────────────────────────────────────────────────────
// BLOQUE 7 — Testigos y Evidencias
// ─────────────────────────────────────────────────────────────
export function Bloque7({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque7']
  onChange: (d: FormularioAccidenteData['bloque7']) => void
}) {
  type Testigo = { nombre: string; cargo: string; telefono: string; declaracion_tomada: boolean }

  const testigos = data.testigos.length > 0
    ? data.testigos as Testigo[]
    : [{ nombre: '', cargo: '', telefono: '', declaracion_tomada: false }]

  function actualizarTestigo(idx: number, campo: keyof Testigo, val: string | boolean) {
    const nuevos = [...testigos] as Testigo[]
    ;(nuevos[idx] as Record<string, unknown>)[campo] = val
    onChange({ ...data, testigos: nuevos })
  }

  function agregarTestigo() {
    onChange({ ...data, testigos: [...testigos, { nombre: '', cargo: '', telefono: '', declaracion_tomada: false }] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Testigos presenciales" />
      {testigos.map((t, idx) => (
        <div key={idx} style={{ border: '1px solid var(--border)', padding: '14px', background: 'var(--bg)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>
            TESTIGO #{idx + 1}
          </div>
          <Grid cols={2}>
            <Campo label="Nombre completo" value={t.nombre} onChange={v => actualizarTestigo(idx, 'nombre', v)} placeholder="Apellidos y nombres" />
            <Campo label="Cargo" value={t.cargo} onChange={v => actualizarTestigo(idx, 'cargo', v)} placeholder="Cargo del testigo" />
          </Grid>
          <div style={{ marginTop: '12px' }}>
            <Grid cols={2}>
              <Campo label="Teléfono de contacto" value={t.telefono} onChange={v => actualizarTestigo(idx, 'telefono', v)} type="tel" placeholder="+57 300 000 0000" />
              <CampoToggle
                label="¿Se tomó declaración escrita?"
                value={t.declaracion_tomada}
                onChange={v => actualizarTestigo(idx, 'declaracion_tomada', v)}
              />
            </Grid>
          </div>
        </div>
      ))}

      {testigos.length < 5 && (
        <button type="button" onClick={agregarTestigo}
          style={{
            padding: '10px', background: 'transparent',
            border: '1px dashed var(--border)', color: 'var(--muted)',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            cursor: 'pointer', letterSpacing: '1px',
          }}
        >
          + Agregar testigo
        </button>
      )}

      <SubSeccion titulo="Registro fotográfico y de evidencias" />
      <CampoChecklist
        label="Evidencias recolectadas"
        opciones={[
          'Fotografías de la escena (≥ 8 fotos)','Video del evento (CCTV / bodycam)',
          'Fotografías del EPP usado','Fotografías de la lesión (con consentimiento)',
          'Fotografías del agente causante','Plano / croquis del lugar',
          'Muestras de materiales recolectadas','Logs / datos de máquina descargados',
        ]}
        seleccionados={data.evidencias}
        onChange={v => onChange({ ...data, evidencias: v })}
      />

      <SubSeccion titulo="Documentos recolectados en escena" />
      <CampoChecklist
        label="Documentos obtenidos"
        opciones={[
          'Permiso de trabajo vigente','Análisis de Trabajo Seguro (ATS/APT) firmado',
          'Procedimiento Escrito de Trabajo Seguro (PETS)','Hoja de datos de seguridad (HDS/SDS)',
          'Checklist de inspección preoperacional','Registro de mantenimiento del equipo',
          'Hoja de vida del equipo','Registros de capacitación del trabajador',
          'Historia clínica / examen de ingreso','Resultado examen toxicológico',
        ]}
        seleccionados={data.documentos}
        onChange={v => onChange({ ...data, documentos: v })}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 8 — Supervisor y Gestión
// ─────────────────────────────────────────────────────────────
export function Bloque8({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque8']
  onChange: (d: FormularioAccidenteData['bloque8']) => void
}) {
  const u = (key: keyof typeof data, val: string | boolean) =>
    onChange({ ...data, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Datos del supervisor directo" />
      <Grid cols={2}>
        <Campo label="Nombre del supervisor" value={data.supervisor_nombre} onChange={v => u('supervisor_nombre', v)} required placeholder="Nombre completo del supervisor" />
        <CampoToggle label="¿Estaba presente al momento del accidente?" value={data.supervisor_presente} onChange={v => u('supervisor_presente', v)} />
      </Grid>
      <Grid cols={2}>
        <CampoToggle label="¿Realizó inspección de inicio de turno ese día?" value={data.realizo_inspeccion} onChange={v => u('realizo_inspeccion', v)} />
        <CampoToggle label="¿Hubo accidentes o reportes similares previos en el área?" value={data.hubo_accidentes_previos} onChange={v => u('hubo_accidentes_previos', v)} />
      </Grid>

      <SubSeccion titulo="Acciones tomadas post-accidente" />
      <CampoTexto
        label="Acciones inmediatas tomadas en la escena"
        value={data.acciones_inmediatas}
        onChange={v => u('acciones_inmediatas', v)}
        rows={3}
        placeholder="Describir qué se hizo inmediatamente: primeros auxilios, aislamiento del área, paro del equipo, etc."
      />
      <Grid cols={2}>
        <CampoToggle label="¿Se suspendió la actividad o equipo involucrado?" value={data.se_suspendio_actividad} onChange={v => u('se_suspendio_actividad', v)} />
        <CampoToggle label="¿Se notificó a gerencia / dirección?" value={data.se_notifico_gerencia} onChange={v => u('se_notifico_gerencia', v)} />
      </Grid>

      <SubSeccion titulo="Notificaciones obligatorias" />
      <Grid cols={2}>
        <CampoToggle
          label="¿Se dio aviso a la ARL / ART / Seguro?"
          value={data.se_aviso_arl}
          onChange={v => u('se_aviso_arl', v)}
          hint="Obligatorio en las primeras 24 horas según normativa"
        />
        {data.se_aviso_arl && (
          <Campo
            label="Hora del aviso a la ARL"
            value={data.hora_aviso_arl}
            onChange={v => u('hora_aviso_arl', v)}
            type="time"
          />
        )}
      </Grid>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 9 — Plan de Acción Correctiva
// ─────────────────────────────────────────────────────────────
export function Bloque9({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque9']
  onChange: (d: FormularioAccidenteData['bloque9']) => void
}) {
  type Accion = { descripcion: string; responsable: string; fecha_limite: string; estado: string }

  const acciones = data.acciones.length > 0
    ? data.acciones as Accion[]
    : [{ descripcion: '', responsable: '', fecha_limite: '', estado: 'pendiente' }]

  function actualizarAccion(idx: number, campo: keyof Accion, val: string) {
    const nuevas = [...acciones] as Accion[]
    nuevas[idx] = { ...nuevas[idx], [campo]: val }
    onChange({ ...data, acciones: nuevas })
  }

  function agregarAccion() {
    onChange({ ...data, acciones: [...acciones, { descripcion: '', responsable: '', fecha_limite: '', estado: 'pendiente' }] })
  }

  function eliminarAccion(idx: number) {
    onChange({ ...data, acciones: acciones.filter((_, i) => i !== idx) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: 'rgba(42,157,143,0.08)',
        border: '1px solid rgba(42,157,143,0.3)',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--muted)',
        lineHeight: 1.7,
      }}>
        ▸ Jerarquía de controles (orden de preferencia):<br />
        1. <span style={{ color: 'var(--green)' }}>Eliminación</span> →
        2. <span style={{ color: 'var(--green)' }}>Sustitución</span> →
        3. <span style={{ color: 'var(--yellow)' }}>Controles de ingeniería</span> →
        4. <span style={{ color: 'var(--orange)' }}>Controles administrativos</span> →
        5. <span style={{ color: 'var(--red)' }}>EPP (último recurso)</span>
      </div>

      {acciones.map((accion, idx) => (
        <div key={idx} style={{ border: '1px solid var(--border)', padding: '14px', background: 'var(--bg)', position: 'relative' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '12px',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px' }}>
              ACCIÓN #{idx + 1}
            </span>
            {acciones.length > 1 && (
              <button type="button" onClick={() => eliminarAccion(idx)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px' }}>×</button>
            )}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Campo
              label="Descripción de la acción correctiva / preventiva"
              value={accion.descripcion}
              onChange={v => actualizarAccion(idx, 'descripcion', v)}
              required
              placeholder="Ej: Instalar guarda de protección tipo A en rodillo #3 de selladora"
            />
          </div>
          <Grid cols={2}>
            <Campo label="Responsable de ejecutar" value={accion.responsable} onChange={v => actualizarAccion(idx, 'responsable', v)} required placeholder="Nombre y cargo" />
            <Campo label="Fecha límite" value={accion.fecha_limite} onChange={v => actualizarAccion(idx, 'fecha_limite', v)} type="date" required />
          </Grid>
        </div>
      ))}

      <button type="button" onClick={agregarAccion}
        style={{
          padding: '10px', background: 'transparent',
          border: '1px dashed var(--border)', color: 'var(--muted)',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          cursor: 'pointer', letterSpacing: '1px',
        }}>
        + Agregar acción correctiva
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 10 — Datos para KPIs
// ─────────────────────────────────────────────────────────────
export function Bloque10({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque10']
  onChange: (d: FormularioAccidenteData['bloque10']) => void
}) {
  const hht = data.horas_hombre_trabajadas || 1
  const acc = 1
  const IF_val  = ((acc * 1_000_000) / hht).toFixed(2)
  const IG_val  = ((30 * 1_000_000) / hht).toFixed(2)
  const II_val  = ((acc / (data.total_trabajadores || 1)) * 1_000).toFixed(2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: 'rgba(69,122,157,0.08)',
        border: '1px solid rgba(69,122,157,0.3)',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--muted)',
        lineHeight: 1.7,
      }}>
        ▸ Estos datos se usan para calcular los índices de accidentalidad del período actual.
        Puedes actualizarlos mensualmente en Configuración → Indicadores.
      </div>

      <SubSeccion titulo="Datos del período" />
      <Grid cols={2}>
        <Campo
          label="Número total de trabajadores en la empresa"
          value={data.total_trabajadores}
          onChange={v => onChange({ ...data, total_trabajadores: parseInt(v) || 0 })}
          type="number"
          required
          placeholder="Ej: 120"
          hint="Promedio del mes o período reportado"
        />
        <Campo
          label="Total horas-hombre trabajadas (HHT) en el período"
          value={data.horas_hombre_trabajadas}
          onChange={v => onChange({ ...data, horas_hombre_trabajadas: parseInt(v) || 0 })}
          type="number"
          required
          placeholder="Ej: 25000"
          hint="Trabajadores × horas trabajadas × días del período"
        />
      </Grid>

      <SubSeccion titulo="Vista previa de indicadores con este accidente" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
        {[
          { label: 'Índice de Frecuencia (IF)', val: IF_val, formula: '(1 accidente × 10⁶) / HHT', color: 'var(--red)' },
          { label: 'Índice de Gravedad (IG)', val: IG_val, formula: '(30 días × 10⁶) / HHT', color: 'var(--orange)' },
          { label: 'Índice de Incidencia (II)', val: II_val, formula: '(1 acc / trabajadores) × 1000', color: 'var(--yellow)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ border: `1px solid ${kpi.color}40`, borderTop: `2px solid ${kpi.color}`, padding: '14px', background: 'var(--panel)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '4px' }}>{kpi.formula}</div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', lineHeight: 1.6 }}>
        ℹ Estos valores son una vista previa solo para este accidente. El dashboard consolida todos los accidentes del período.
      </p>
    </div>
  )
}
