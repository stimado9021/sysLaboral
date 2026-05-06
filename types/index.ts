// ─────────────────────────────────────────────────────────────
// TIPOS GLOBALES DEL SISTEMA SST
// Todos los tipos TypeScript usados en el proyecto
// ─────────────────────────────────────────────────────────────

// ── ENUMS ──────────────────────────────────────────────────
export type TipoEvento =
  | 'accidente_lesion'
  | 'accidente_mortal'
  | 'incidente_peligroso'
  | 'casi_accidente'
  | 'dano_propiedad'
  | 'enfermedad_laboral'

export type TipoLesion =
  | 'fractura'
  | 'luxacion'
  | 'esguince'
  | 'laceración'
  | 'contusion'
  | 'quemadura'
  | 'amputacion'
  | 'lesion_ocular'
  | 'lesion_interna'
  | 'intoxicacion'
  | 'muerte'
  | 'otro'

export type GravedadLesion = 'leve' | 'moderada' | 'grave' | 'fatal'

export type TipoCausa = 'acto_inseguro' | 'condicion_insegura' | 'causa_raiz' | 'factor_sistema'

export type Categoria6M = 'maquina' | 'metodo' | 'mano_obra' | 'materiales' | 'medio_ambiente' | 'medicion'

export type EstadoAccion = 'pendiente' | 'en_curso' | 'cerrado' | 'vencido'

export type RolUsuario = 'admin' | 'hsse' | 'supervisor' | 'gerente' | 'auditor'

export type TipoContrato = 'directo' | 'contratista' | 'temporal' | 'aprendiz'

// ── TRABAJADOR ─────────────────────────────────────────────
export interface Trabajador {
  id: number
  nombre: string
  cedula: string
  fecha_nacimiento: string
  genero: string
  cargo: string
  area: string
  tipo_contrato: TipoContrato
  empresa_contratista?: string
  fecha_ingreso: string
  nivel_educacion?: string
  activo: boolean
  created_at: string
}

// ── ACCIDENTE (formulario completo) ───────────────────────
export interface Accidente {
  id: number
  trabajador_id: number
  usuario_id: number          // quien registró
  
  // Bloque 1 — Información general
  tipo_evento: TipoEvento
  fecha_accidente: string
  hora_accidente: string
  fecha_reporte: string
  empresa: string
  direccion: string
  area: string
  ubicacion_especifica: string
  condiciones_climaticas?: string
  turno: 'manana' | 'tarde' | 'noche'
  hora_inicio_turno: string
  horas_trabajadas: number

  // Bloque 3 — Descripción
  descripcion: string
  forma_accidente: string
  agente_causante: string
  equipo_involucrado?: string
  tenia_procedimiento: boolean
  conocia_procedimiento: boolean
  tenia_analisis_riesgo: boolean
  tenia_permiso_trabajo: boolean

  // Bloque 4 — Lesiones
  tipo_lesion: TipoLesion
  parte_cuerpo: string
  lado_afectado?: string
  gravedad: GravedadLesion
  requirio_hospitalizacion: boolean
  requirio_cirugia: boolean
  dias_incapacidad: number
  fecha_reintegro_estimada?: string
  centro_medico?: string
  diagnostico?: string
  costo_dano_material?: number
  horas_paro_produccion?: number

  // Bloque 8 — Gestión
  supervisor_nombre: string
  supervisor_presente: boolean
  acciones_inmediatas?: string
  se_aviso_arl: boolean
  se_suspendio_actividad: boolean

  // Estado del reporte
  estado: 'borrador' | 'en_investigacion' | 'cerrado'
  created_at: string
  updated_at: string

  // Relaciones (para joins)
  trabajador?: Trabajador
  causas?: Causa[]
  acciones?: AccionCorrectiva[]
  epp_registros?: EPPRegistro[]
}

// ── CAUSA ──────────────────────────────────────────────────
export interface Causa {
  id: number
  accidente_id: number
  tipo: TipoCausa
  descripcion: string
  categoria_6m?: Categoria6M
  es_causa_raiz: boolean
  nivel_porque: number        // 0=evento, 1=1er porqué, 2=2do porqué...
  causa_padre_id?: number     // para el árbol
  created_at: string
}

// ── ACCIÓN CORRECTIVA ──────────────────────────────────────
export interface AccionCorrectiva {
  id: number
  accidente_id: number
  descripcion: string
  responsable: string
  fecha_limite: string
  estado: EstadoAccion
  fecha_cierre?: string
  verificado_por?: string
  created_at: string
  updated_at: string
}

// ── EPP REGISTRO ───────────────────────────────────────────
export interface EPPRegistro {
  id: number
  accidente_id: number
  tipo_epp: string
  lo_portaba: boolean | null   // null = no aplica
  buen_estado: boolean | null
  fecha_ultima_entrega?: string
}

// ── CAPACITACIÓN ───────────────────────────────────────────
export interface Capacitacion {
  id: number
  accidente_id: number
  tema: string
  recibio_capacitacion: boolean
  fecha_ultima?: string
  aprobo_evaluacion: boolean | null
}

// ── TESTIGO ────────────────────────────────────────────────
export interface Testigo {
  id: number
  accidente_id: number
  nombre: string
  cargo: string
  telefono?: string
  declaracion_tomada: boolean
}

// ── USUARIO ────────────────────────────────────────────────
export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: RolUsuario
  activo: boolean
  created_at: string
}

// ── INDICADORES KPI ────────────────────────────────────────
export interface Indicadores {
  periodo: string              // 'YYYY-MM' o 'YYYY'
  total_accidentes: number
  total_incidentes: number
  dias_perdidos: number
  horas_hombre_trabajadas: number
  num_trabajadores: number
  if: number                   // Índice de Frecuencia
  ig: number                   // Índice de Gravedad
  ii: number                   // Índice de Incidencia
  ili: number                  // Índice de Lesión Incapacitante
}

// ── FORMULARIO MULTI-PASO ──────────────────────────────────
// Tipo para el estado del formulario en el cliente
export interface FormularioAccidenteData {
  // Bloque 1
  bloque1: {
    tipo_evento: TipoEvento | ''
    fecha_accidente: string
    hora_accidente: string
    area: string
    ubicacion_especifica: string
    turno: string
    horas_trabajadas: number
    condiciones_climaticas: string
  }
  // Bloque 2
  bloque2: {
    trabajador_id: number | null
    nombre: string
    cedula: string
    cargo: string
    tipo_contrato: TipoContrato | ''
    empresa_contratista: string
    fecha_ingreso: string
    antiguedad_cargo: string
    tarea_habitual: boolean
    en_induccion: boolean
  }
  // Bloque 3
  bloque3: {
    descripcion: string
    forma_accidente: string
    agente_causante: string
    equipo_involucrado: string
    tenia_procedimiento: boolean
    conocia_procedimiento: boolean
    tenia_analisis_riesgo: boolean
    tenia_permiso_trabajo: boolean
  }
  // Bloque 4
  bloque4: {
    tipo_lesion: TipoLesion | ''
    parte_cuerpo: string
    lado_afectado: string
    gravedad: GravedadLesion | ''
    dias_incapacidad: number
    requirio_hospitalizacion: boolean
    requirio_cirugia: boolean
    centro_medico: string
    diagnostico: string
    costo_dano_material: number
    horas_paro_produccion: number
  }
  // Bloque 5 — Causas (array dinámico)
  bloque5: {
    actos_inseguros: string[]
    condiciones_inseguras: string[]
    porques: string[]           // Los 5 porqués en orden
    factores_6m: Partial<Record<Categoria6M, string>>
  }
  // Bloque 6 — EPP
  bloque6: {
    epp: { tipo_epp: string; lo_portaba: boolean | null; buen_estado: boolean | null; fecha_ultima_entrega?: string }[]
    capacitaciones: { tema: string; recibio_capacitacion: boolean; fecha_ultima?: string; aprobo_evaluacion: boolean | null }[]
  }
  // Bloque 7 — Testigos
  bloque7: {
    testigos: Omit<Testigo, 'id' | 'accidente_id'>[]
    evidencias: string[]        // checklist de evidencias recolectadas
    documentos: string[]        // checklist de documentos recolectados
  }
  // Bloque 8 — Supervisor
  bloque8: {
    supervisor_nombre: string
    supervisor_presente: boolean
    realizo_inspeccion: boolean
    hubo_accidentes_previos: boolean
    acciones_inmediatas: string
    se_aviso_arl: boolean
    hora_aviso_arl: string
    se_suspendio_actividad: boolean
    se_notifico_gerencia: boolean
  }
  // Bloque 9 — Acciones
  bloque9: {
    acciones: { descripcion: string; responsable: string; fecha_limite: string; estado: string }[]
  }
  // Bloque 10 — KPIs
  bloque10: {
    total_trabajadores: number
    horas_hombre_trabajadas: number
  }
}

// ── RESPUESTAS API ─────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
