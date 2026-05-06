'use client'
// components/forms/Bloques123.tsx
// Bloque 1: Información general del evento
// Bloque 2: Datos del trabajador
// Bloque 3: Descripción del accidente

import { Campo, CampoSelect, CampoToggle, CampoTexto, Grid, SubSeccion } from './CamposBase'
import type { FormularioAccidenteData } from '@/types'

// ─────────────────────────────────────────────────────────────
// BLOQUE 1 — Información General
// ─────────────────────────────────────────────────────────────
export function Bloque1({
  data,
  onChange,
}: {
  data: FormularioAccidenteData['bloque1']
  onChange: (d: FormularioAccidenteData['bloque1']) => void
}) {
  const u = (key: keyof typeof data, val: string | number) =>
    onChange({ ...data, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <SubSeccion titulo="Tipo de evento" />
      <CampoSelect
        label="Tipo de evento"
        value={data.tipo_evento}
        onChange={v => u('tipo_evento', v)}
        required
        options={[
          { value: 'accidente_lesion',    label: '🔴 Accidente con lesión' },
          { value: 'accidente_mortal',    label: '⚫ Accidente mortal' },
          { value: 'incidente_peligroso', label: '🟠 Incidente peligroso' },
          { value: 'casi_accidente',      label: '🟡 Casi-accidente (Near miss)' },
          { value: 'dano_propiedad',      label: '🔵 Daño a la propiedad' },
          { value: 'enfermedad_laboral',  label: '🟣 Enfermedad laboral' },
        ]}
        hint="Selecciona el tipo que mejor describe el evento ocurrido"
      />

      <SubSeccion titulo="Fecha y hora" />
      <Grid cols={2}>
        <Campo label="Fecha del accidente" value={data.fecha_accidente} onChange={v => u('fecha_accidente', v)} type="date" required />
        <Campo label="Hora exacta del accidente" value={data.hora_accidente} onChange={v => u('hora_accidente', v)} type="time" required hint="Hora lo más exacta posible — no aproximada" />
      </Grid>

      <SubSeccion titulo="Lugar del evento" />
      <Campo label="Área / Departamento" value={data.area} onChange={v => u('area', v)} required placeholder="Ej: Planta de producción, Almacén, Oficinas" />
      <Campo
        label="Ubicación específica"
        value={data.ubicacion_especifica}
        onChange={v => u('ubicacion_especifica', v)}
        required
        placeholder="Ej: Línea 3 — Máquina selladora #5, Pasillo B nivel 2"
        hint="Cuanto más específico, mejor para la investigación"
      />

      <SubSeccion titulo="Condiciones del turno" />
      <Grid cols={3}>
        <CampoSelect
          label="Turno de trabajo"
          value={data.turno}
          onChange={v => u('turno', v)}
          required
          options={[
            { value: 'manana', label: '☀ Mañana (6am–2pm)' },
            { value: 'tarde',  label: '🌤 Tarde (2pm–10pm)' },
            { value: 'noche',  label: '🌙 Noche (10pm–6am)' },
          ]}
        />
        <Campo label="Hora inicio del turno" value={data.turno === 'manana' ? '06:00' : data.turno === 'tarde' ? '14:00' : '22:00'} onChange={v => u('hora_inicio_turno' as keyof typeof data, v)} type="time" />
        <Campo label="Horas trabajadas al momento" value={data.horas_trabajadas} onChange={v => u('horas_trabajadas', parseFloat(v) || 0)} type="number" placeholder="Ej: 3.5" hint="Horas desde inicio del turno" />
      </Grid>
      <Campo label="Condiciones climáticas (si aplica)" value={data.condiciones_climaticas} onChange={v => u('condiciones_climaticas', v)} placeholder="Ej: Lluvia, calor extremo, neblina" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 2 — Datos del Trabajador
// ─────────────────────────────────────────────────────────────
export function Bloque2({
  data,
  onChange,
}: {
  data: FormularioAccidenteData['bloque2']
  onChange: (d: FormularioAccidenteData['bloque2']) => void
}) {
  const u = (key: keyof typeof data, val: string | number | boolean | null) =>
    onChange({ ...data, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Identificación personal" />
      <Grid cols={2}>
        <Campo label="Nombre completo" value={data.nombre} onChange={v => u('nombre', v)} required placeholder="Apellidos y nombres" />
        <Campo label="Cédula / ID" value={data.cedula} onChange={v => u('cedula', v)} required placeholder="Número de identificación" hint="Si ya existe en el sistema se cargará automáticamente" />
      </Grid>

      <SubSeccion titulo="Datos laborales" />
      <Grid cols={2}>
        <Campo label="Cargo / Puesto" value={data.cargo} onChange={v => u('cargo', v)} required placeholder="Ej: Operario de producción" />
        <CampoSelect
          label="Tipo de contrato"
          value={data.tipo_contrato}
          onChange={v => u('tipo_contrato', v)}
          required
          options={[
            { value: 'directo',      label: 'Contrato directo con la empresa' },
            { value: 'contratista',  label: 'Contratista / Proveedor externo' },
            { value: 'temporal',     label: 'Temporal / Agencia' },
            { value: 'aprendiz',     label: 'Aprendiz / Practicante' },
          ]}
        />
      </Grid>
      {data.tipo_contrato === 'contratista' && (
        <Campo label="Nombre de la empresa contratista" value={data.empresa_contratista} onChange={v => u('empresa_contratista', v)} required placeholder="Razón social de la empresa contratista" />
      )}
      <Grid cols={2}>
        <Campo label="Fecha de ingreso a la empresa" value={data.fecha_ingreso} onChange={v => u('fecha_ingreso', v)} type="date" required hint="Clave para calcular antigüedad" />
        <Campo label="Antigüedad en el cargo actual" value={data.antiguedad_cargo} onChange={v => u('antiguedad_cargo', v)} placeholder="Ej: 2 años 3 meses" hint="Si lleva menos tiempo que en la empresa" />
      </Grid>

      <SubSeccion titulo="Contexto del trabajo" />
      <Grid cols={2}>
        <CampoToggle
          label="¿Realizaba su tarea habitual?"
          value={data.tarea_habitual}
          onChange={v => u('tarea_habitual', v)}
          hint="No habitual = mayor riesgo de accidente"
        />
        <CampoToggle
          label="¿Estaba en período de inducción o entrenamiento?"
          value={data.en_induccion}
          onChange={v => u('en_induccion', v)}
          hint="Los primeros 6 meses son los de mayor riesgo"
        />
      </Grid>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOQUE 3 — Descripción del Accidente
// ─────────────────────────────────────────────────────────────
export function Bloque3({
  data,
  onChange,
}: {
  data: FormularioAccidenteData['bloque3']
  onChange: (d: FormularioAccidenteData['bloque3']) => void
}) {
  const u = (key: keyof typeof data, val: string | boolean) =>
    onChange({ ...data, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SubSeccion titulo="Narrativa del evento" />
      <CampoTexto
        label="Descripción detallada del accidente"
        value={data.descripcion}
        onChange={v => u('descripcion', v)}
        required
        rows={6}
        placeholder="Describir en orden cronológico: qué hacía el trabajador ANTES del evento, CÓMO ocurrió el contacto o daño, qué elementos estaban involucrados, qué pasó DESPUÉS. Usar hechos observados, sin hipótesis ni conclusiones."
        hint="Responder: ¿Qué? ¿Cómo? ¿Dónde? ¿Con qué? — Solo hechos, no opiniones"
      />

      <SubSeccion titulo="Clasificación del evento" />
      <Grid cols={2}>
        <CampoSelect
          label="Forma / Tipo de accidente"
          value={data.forma_accidente}
          onChange={v => u('forma_accidente', v)}
          required
          options={[
            { value: 'caida_altura',       label: '📉 Caída desde altura' },
            { value: 'caida_nivel',        label: '🚶 Caída al mismo nivel' },
            { value: 'atrapamiento',       label: '🔩 Atrapamiento / Aplastamiento' },
            { value: 'golpe_choque',       label: '💥 Golpe / Choque con objeto' },
            { value: 'corte_laceracion',   label: '✂ Corte / Laceración' },
            { value: 'quemadura',          label: '🔥 Quemadura (térmica/química)' },
            { value: 'electrico',          label: '⚡ Contacto eléctrico' },
            { value: 'sobresfuerzo',       label: '💪 Sobreesfuerzo / Ergonómico' },
            { value: 'proyeccion',         label: '🎯 Proyección de partículas' },
            { value: 'intoxicacion',       label: '☠ Intoxicación / Inhalación' },
            { value: 'accidente_transito', label: '🚗 Accidente de tránsito' },
            { value: 'otro',              label: 'Otro' },
          ]}
        />
        <CampoSelect
          label="Agente causante principal"
          value={data.agente_causante}
          onChange={v => u('agente_causante', v)}
          required
          options={[
            { value: 'maquinaria',        label: '⚙ Maquinaria / Equipos' },
            { value: 'herramientas',      label: '🔧 Herramientas manuales' },
            { value: 'material_objeto',   label: '📦 Material / Objeto' },
            { value: 'vehiculo',          label: '🚙 Vehículo / Montacargas' },
            { value: 'sustancia_quimica', label: '🧪 Sustancia química' },
            { value: 'animal',            label: '🐾 Animal' },
            { value: 'esfuerzo_fisico',   label: '🏋 Esfuerzo físico' },
            { value: 'instalacion_elect', label: '🔌 Instalación eléctrica' },
            { value: 'estructura',        label: '🏗 Estructura / Instalación' },
            { value: 'otro',             label: 'Otro' },
          ]}
        />
      </Grid>
      <Campo
        label="Equipo / Máquina específica involucrada"
        value={data.equipo_involucrado}
        onChange={v => u('equipo_involucrado', v)}
        placeholder="Ej: Torno CNC marca Haas SL-20, Serie 12345 — Prensa hidráulica #3"
        hint="Incluir marca, modelo y número de serie si es posible"
      />

      <SubSeccion titulo="Verificación de controles previos" />
      <Grid cols={2}>
        <CampoToggle
          label="¿Existía procedimiento escrito para la tarea?"
          value={data.tenia_procedimiento}
          onChange={v => u('tenia_procedimiento', v)}
        />
        <CampoToggle
          label="¿El trabajador conocía y había firmado el procedimiento?"
          value={data.conocia_procedimiento}
          onChange={v => u('conocia_procedimiento', v)}
        />
        <CampoToggle
          label="¿Se realizó Análisis de Trabajo Seguro (ATS/APT) antes de iniciar?"
          value={data.tenia_analisis_riesgo}
          onChange={v => u('tenia_analisis_riesgo', v)}
          hint="JSA / ATS / APT firmado antes de la tarea"
        />
        <CampoToggle
          label="¿Había Permiso de Trabajo vigente y emitido?"
          value={data.tenia_permiso_trabajo}
          onChange={v => u('tenia_permiso_trabajo', v)}
          hint="Aplica para trabajo en altura, espacios confinados, energías peligrosas, etc."
        />
      </Grid>
    </div>
  )
}
