'use client'
// components/forms/Bloques456.tsx
// Bloque 4: Lesiones y atención médica
// Bloque 5: Causas (5 Porqués + 6M)
// Bloque 6: EPP y Capacitación

import { Campo, CampoSelect, CampoToggle, Grid, SubSeccion, CampoChecklist, ListaDinamica } from './CamposBase'
import type { FormularioAccidenteData, Categoria6M } from '@/types'

const CATEGORIAS_6M: { key: Categoria6M; label: string; icon: string; placeholder: string }[] = [
  { key: 'maquina',       label: 'MÁQUINA',        icon: '⚙', placeholder: 'Ej: Guarda de protección retirada, sin mantenimiento preventivo...' },
  { key: 'metodo',        label: 'MÉTODO',         icon: '📋', placeholder: 'Ej: Sin procedimiento LOTO, JSA no realizado...' },
  { key: 'mano_obra',     label: 'MANO DE OBRA',   icon: '👷', placeholder: 'Ej: Sin capacitación, fatiga, exceso de confianza...' },
  { key: 'materiales',    label: 'MATERIALES',     icon: '📦', placeholder: 'Ej: EPP inadecuado, herramienta dañada...' },
  { key: 'medio_ambiente',label: 'MEDIO AMBIENTE', icon: '🌡', placeholder: 'Ej: Iluminación deficiente, piso húmedo, ruido excesivo...' },
  { key: 'medicion',      label: 'MEDICIÓN',       icon: '📊', placeholder: 'Ej: Sin inspecciones, sin KPIs de seguridad...' },
]

const EPP_TIPOS = ['Casco de seguridad','Guantes','Botas de seguridad','Lentes / Careta','Arnés y línea de vida','Protección auditiva','Respirador','Ropa de trabajo','Careta facial','Otro']
const CAP_TEMAS = ['Inducción general HSE','Trabajo en la tarea específica','Manejo del equipo involucrado','Procedimientos de emergencia','Uso correcto de EPP','Trabajo en altura','Bloqueo y etiquetado (LOTO)','Manejo de sustancias químicas','Primeros auxilios']

// ─────────────────────────────────────────────────────────────
// BLOQUE 4 — Lesiones y Atención Médica
// ─────────────────────────────────────────────────────────────
export function Bloque4({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque4']
  onChange: (d: FormularioAccidenteData['bloque4']) => void
}) {
  const u = (key: keyof typeof data, val: string | number | boolean) =>
    onChange({ ...data, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Naturaleza de la lesión" />
      <Grid cols={2}>
        <CampoSelect
          label="Tipo de lesión"
          value={data.tipo_lesion}
          onChange={v => u('tipo_lesion', v)}
          required
          options={[
            { value: 'fractura',      label: '🦴 Fractura' },
            { value: 'luxacion',      label: '🔄 Luxación / Dislocación' },
            { value: 'esguince',      label: '⚡ Esguince / Torcedura' },
            { value: 'laceracion',    label: '✂ Laceración / Corte' },
            { value: 'contusion',     label: '💢 Contusión / Golpe' },
            { value: 'quemadura',     label: '🔥 Quemadura' },
            { value: 'amputacion',    label: '✂✂ Amputación' },
            { value: 'lesion_ocular', label: '👁 Lesión ocular' },
            { value: 'lesion_interna',label: '🫀 Lesión interna' },
            { value: 'intoxicacion',  label: '☠ Intoxicación' },
            { value: 'muerte',        label: '⚫ Muerte' },
            { value: 'otro',          label: 'Otro' },
          ]}
        />
        <CampoSelect
          label="Gravedad de la lesión"
          value={data.gravedad}
          onChange={v => u('gravedad', v)}
          required
          options={[
            { value: 'leve',     label: '🟡 Leve — Sin incapacidad o < 3 días' },
            { value: 'moderada', label: '🟠 Moderada — 3 a 30 días incapacidad' },
            { value: 'grave',    label: '🔴 Grave — > 30 días o secuela permanente' },
            { value: 'fatal',    label: '⚫ Fatal — Muerte' },
          ]}
        />
      </Grid>
      <Grid cols={2}>
        <Campo label="Parte del cuerpo afectada" value={data.parte_cuerpo} onChange={v => u('parte_cuerpo', v)} required placeholder="Ej: Mano derecha — dedo índice y medio" hint="Ser específico: lado, dígito, articulación" />
        <CampoSelect
          label="Lado afectado"
          value={data.lado_afectado ?? ''}
          onChange={v => u('lado_afectado' as keyof typeof data, v)}
          options={[
            { value: 'derecho',    label: 'Derecho' },
            { value: 'izquierdo',  label: 'Izquierdo' },
            { value: 'bilateral',  label: 'Bilateral (ambos lados)' },
            { value: 'no_aplica',  label: 'No aplica' },
          ]}
        />
      </Grid>

      <SubSeccion titulo="Atención médica" />
      <Grid cols={2}>
        <CampoToggle label="¿Requirió hospitalización?" value={data.requirio_hospitalizacion} onChange={v => u('requirio_hospitalizacion', v)} />
        <CampoToggle label="¿Requirió cirugía?" value={data.requirio_cirugia} onChange={v => u('requirio_cirugia', v)} />
      </Grid>
      <Grid cols={2}>
        <Campo label="Días de incapacidad prescritos" value={data.dias_incapacidad} onChange={v => u('dias_incapacidad', parseInt(v) || 0)} type="number" placeholder="0" hint="Días certificados por médico tratante" />
        <Campo label="Centro médico / IPS / Hospital" value={data.centro_medico} onChange={v => u('centro_medico', v)} placeholder="Nombre de la institución médica" />
      </Grid>
      <Campo label="Diagnóstico médico inicial" value={data.diagnostico} onChange={v => u('diagnostico', v)} placeholder="Diagnóstico del médico tratante — incluir CIE-10 si disponible" />

      <SubSeccion titulo="Daños a la propiedad" />
      <Grid cols={2}>
        <Campo label="Costo estimado del daño material (COP)" value={data.costo_dano_material} onChange={v => u('costo_dano_material', parseFloat(v) || 0)} type="number" placeholder="0" hint="Reparación o reposición del equipo/instalación" />
        <Campo label="Horas de paro de producción" value={data.horas_paro_produccion} onChange={v => u('horas_paro_produccion', parseFloat(v) || 0)} type="number" placeholder="0" hint="Horas que paró la operación por el accidente" />
      </Grid>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 5 — Causas: 5 Porqués + 6M
// ─────────────────────────────────────────────────────────────
export function Bloque5({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque5']
  onChange: (d: FormularioAccidenteData['bloque5']) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Actos inseguros identificados" />
      <CampoChecklist
        label="Selecciona los actos inseguros presentes"
        opciones={[
          'Operó sin autorización','No usó EPP','Omitió procedimiento de seguridad',
          'No señalizó / aisló la zona','Uso incorrecto de herramientas',
          'Posición peligrosa','Distracción / Descuido','No verificó condiciones previas',
          'Exceso de velocidad / prisa','Trabajó bajo influencia de sustancias',
        ]}
        seleccionados={data.actos_inseguros}
        onChange={v => onChange({ ...data, actos_inseguros: v })}
      />

      <SubSeccion titulo="Condiciones inseguras identificadas" />
      <CampoChecklist
        label="Selecciona las condiciones inseguras presentes"
        opciones={[
          'Guardas retiradas / defectuosas','Herramienta o equipo dañado',
          'Piso húmedo / resbaladizo','Iluminación deficiente',
          'Señalización inexistente o inadecuada','Espacio de trabajo reducido',
          'Ruido excesivo','Temperatura extrema',
          'Sustancias peligrosas sin rotular','Orden y aseo deficientes',
          'Sin mantenimiento preventivo al día',
        ]}
        seleccionados={data.condiciones_inseguras}
        onChange={v => onChange({ ...data, condiciones_inseguras: v })}
      />

      <SubSeccion titulo="Análisis 5 porqués — Causa raíz" />
      <div style={{
        background: 'rgba(230,57,70,0.05)',
        border: '1px solid rgba(230,57,70,0.2)',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: '8px',
      }}>
        ▸ Comienza con el evento y pregunta "¿Por qué ocurrió?" repetidamente hasta llegar a la causa raíz del sistema.
        El último "porqué" es la causa raíz real. Agrega entre 3 y 5 niveles.
      </div>
      <ListaDinamica
        label="Porqués (causa raíz al final)"
        items={data.porques.length > 0 ? data.porques : ['', '', '']}
        onChange={v => onChange({ ...data, porques: v })}
        placeholder="¿Por qué...?"
        numerada
        maxItems={5}
      />

      <SubSeccion titulo="Factores del sistema — Diagrama 6M (Ishikawa)" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {CATEGORIAS_6M.map(cat => (
          <div key={cat.key} style={{
            border: '1px solid var(--border)',
            padding: '12px',
            background: 'var(--panel)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--orange)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {cat.icon} {cat.label}
            </div>
            <textarea
              className="input-base"
              rows={2}
              placeholder={cat.placeholder}
              value={(data.factores_6m[cat.key] as string) || ''}
              onChange={e => onChange({
                ...data,
                factores_6m: { ...data.factores_6m, [cat.key]: e.target.value }
              })}
              style={{ resize: 'none', fontSize: '12px', lineHeight: 1.5 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 6 — EPP y Capacitación
// ─────────────────────────────────────────────────────────────
export function Bloque6({
  data, onChange,
}: {
  data: FormularioAccidenteData['bloque6']
  onChange: (d: FormularioAccidenteData['bloque6']) => void
}) {
  type EPPItem = { tipo_epp: string; lo_portaba: boolean | null; buen_estado: boolean | null; fecha_ultima_entrega?: string }
  type CapItem = { tema: string; recibio_capacitacion: boolean; fecha_ultima?: string; aprobo_evaluacion: boolean | null }

  function actualizarEPP(idx: number, campo: string, valor: boolean | null | string) {
    const nuevo = [...(data.epp as EPPItem[])]
    nuevo[idx] = { ...nuevo[idx], [campo]: valor }
    onChange({ ...data, epp: nuevo })
  }

  function actualizarCap(idx: number, campo: string, valor: boolean | null | string) {
    const nuevo = [...(data.capacitaciones as CapItem[])]
    nuevo[idx] = { ...nuevo[idx], [campo]: valor }
    onChange({ ...data, capacitaciones: nuevo })
  }

  const eppData = data.epp.length > 0 ? data.epp as EPPItem[] : EPP_TIPOS.map(t => ({ tipo_epp: t, lo_portaba: null, buen_estado: null, fecha_ultima_entrega: '' }))
  const capData = data.capacitaciones.length > 0 ? data.capacitaciones as CapItem[] : CAP_TEMAS.map(t => ({ tema: t, recibio_capacitacion: false, fecha_ultima: '', aprobo_evaluacion: null }))

  const btnTri = (actual: boolean | null, val: boolean | null, label: string, color: string) => (
    <button
      type="button"
      onClick={() => {}}
      style={{
        flex: 1,
        padding: '4px',
        border: `1px solid ${actual === val ? color : 'var(--border)'}`,
        background: actual === val ? `${color}20` : 'transparent',
        color: actual === val ? color : 'var(--muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        cursor: 'pointer',
      }}
    >{label}</button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Equipos de protección personal (EPP)" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--dim)' }}>
              {['EPP Requerido','¿Lo portaba?','¿Buen estado?','Última entrega'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eppData.map((epp, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text)', fontSize: '12px' }}>{epp.tipo_epp}</td>
                <td style={{ padding: '6px 12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {([{ v: true, l: 'Sí', c: 'var(--green)' }, { v: false, l: 'No', c: 'var(--red)' }, { v: null, l: 'N/A', c: 'var(--muted)' }] as const).map(opt => (
                      <button key={String(opt.v)} type="button"
                        onClick={() => actualizarEPP(idx, 'lo_portaba', opt.v)}
                        style={{
                          padding: '4px 8px', fontSize: '9px', fontFamily: 'var(--font-mono)',
                          border: `1px solid ${epp.lo_portaba === opt.v ? opt.c : 'rgba(234,179,8,0.5)'}`,
                          background: epp.lo_portaba === opt.v ? `${opt.c}20` : 'transparent',
                          color: epp.lo_portaba === opt.v ? opt.c : 'var(--yellow)',
                          cursor: 'pointer',
                        }}>{opt.l}</button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {([{ v: true, l: 'Sí', c: 'var(--green)' }, { v: false, l: 'No', c: 'var(--red)' }, { v: null, l: 'N/A', c: 'var(--muted)' }] as const).map(opt => (
                      <button key={String(opt.v)} type="button"
                        onClick={() => actualizarEPP(idx, 'buen_estado', opt.v)}
                        style={{
                          padding: '4px 8px', fontSize: '9px', fontFamily: 'var(--font-mono)',
                          border: `1px solid ${epp.buen_estado === opt.v ? opt.c : 'rgba(234,179,8,0.5)'}`,
                          background: epp.buen_estado === opt.v ? `${opt.c}20` : 'transparent',
                          color: epp.buen_estado === opt.v ? opt.c : 'var(--yellow)',
                          cursor: 'pointer',
                        }}>{opt.l}</button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <input
                    type="date"
                    className="input-base"
                    value={epp.fecha_ultima_entrega || ''}
                    onChange={e => actualizarEPP(idx, 'fecha_ultima_entrega', e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px', width: '140px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubSeccion titulo="Registro de capacitaciones" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--dim)' }}>
              {['Tema de capacitación','¿Recibió?','Fecha última','¿Aprobó?'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capData.map((cap, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text)', fontSize: '12px' }}>{cap.tema}</td>
                <td style={{ padding: '6px 12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {([{ v: true, l: 'Sí', c: 'var(--green)' }, { v: false, l: 'No', c: 'var(--red)' }] as const).map(opt => (
                      <button key={String(opt.v)} type="button"
                        onClick={() => actualizarCap(idx, 'recibio_capacitacion', opt.v)}
                        style={{
                          padding: '4px 8px', fontSize: '9px', fontFamily: 'var(--font-mono)',
                          border: `1px solid ${cap.recibio_capacitacion === opt.v ? opt.c : 'rgba(234,179,8,0.5)'}`,
                          background: cap.recibio_capacitacion === opt.v ? `${opt.c}20` : 'transparent',
                          color: cap.recibio_capacitacion === opt.v ? opt.c : 'var(--yellow)',
                          cursor: 'pointer',
                        }}>{opt.l}</button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <input
                    type="date"
                    className="input-base"
                    value={cap.fecha_ultima || ''}
                    onChange={e => actualizarCap(idx, 'fecha_ultima', e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px', width: '140px' }}
                    disabled={!cap.recibio_capacitacion}
                  />
                </td>
                <td style={{ padding: '6px 12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {([{ v: true, l: 'Sí', c: 'var(--green)' }, { v: false, l: 'No', c: 'var(--red)' }, { v: null, l: 'Sin eval.', c: 'var(--muted)' }] as const).map(opt => (
                      <button key={String(opt.v)} type="button"
                        onClick={() => actualizarCap(idx, 'aprobo_evaluacion', opt.v)}
                        disabled={!cap.recibio_capacitacion}
                        style={{
                          padding: '4px 8px', fontSize: '9px', fontFamily: 'var(--font-mono)',
                          border: `1px solid ${cap.aprobo_evaluacion === opt.v ? opt.c : 'rgba(234,179,8,0.5)'}`,
                          background: cap.aprobo_evaluacion === opt.v ? `${opt.c}20` : 'transparent',
                          color: cap.aprobo_evaluacion === opt.v ? opt.c : 'var(--yellow)',
                          cursor: 'pointer',
                          opacity: !cap.recibio_capacitacion ? 0.4 : 1,
                        }}>{opt.l}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
