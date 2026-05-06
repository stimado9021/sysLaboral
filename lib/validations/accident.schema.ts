// lib/validations/accident.schema.ts
import { z } from 'zod'

export const accidentReportSchema = z.object({
  bloque1: z.object({
    tipo_evento: z.string().min(1),
    fecha_accidente: z.string().min(1),
    hora_accidente: z.string().min(1),
    area: z.string().min(1),
    ubicacion_especifica: z.string().optional(),
    condiciones_climaticas: z.string().optional(),
    turno: z.string().optional(),
    hora_inicio_turno: z.string().optional(),
    horas_trabajadas: z.number().optional().or(z.string().transform(v => parseFloat(v))),
  }),
  bloque2: z.object({
    nombre: z.string().min(1),
    cedula: z.string().min(1),
    cargo: z.string().min(1),
    tipo_contrato: z.string().optional(),
    empresa_contratista: z.string().optional(),
    fecha_ingreso: z.string().optional(),
  }),
  bloque3: z.object({
    descripcion: z.string().min(5),
    forma_accidente: z.string().optional(),
    agente_causante: z.string().optional(),
    equipo_involucrado: z.string().optional(),
    tenia_procedimiento: z.boolean().optional(),
    conocia_procedimiento: z.boolean().optional(),
    tenia_analisis_riesgo: z.boolean().optional(),
    tenia_permiso_trabajo: z.boolean().optional(),
  }),
  bloque4: z.object({
    tipo_lesion: z.string().optional(),
    parte_cuerpo: z.string().optional(),
    gravedad: z.string().optional(),
    dias_incapacidad: z.number().optional().or(z.string().transform(v => parseInt(v))),
    requirio_hospitalizacion: z.boolean().optional(),
    requirio_cirugia: z.boolean().optional(),
    centro_medico: z.string().optional(),
    diagnostico: z.string().optional(),
    costo_dano_material: z.number().optional().or(z.string().transform(v => parseFloat(v))),
    horas_paro_produccion: z.number().optional().or(z.string().transform(v => parseFloat(v))),
  }),
  // Otros bloques simplificados para validación básica
  bloque5: z.any().optional(),
  bloque6: z.any().optional(),
  bloque7: z.any().optional(),
  bloque8: z.any().optional(),
  bloque9: z.any().optional(),
})

export const evidenceSchema = z.object({
  accidente_id: z.number().int().positive().or(z.string().transform(v => parseInt(v))),
  nombre_archivo: z.string().min(1),
  url: z.string().min(1),
  tipo_mime: z.string().optional(),
  tamaño_bytes: z.number().optional(),
  tipo: z.enum(['foto', 'documento', 'video', 'otro']).default('foto'),
  descripcion: z.string().optional(),
})

export type EvidenceInput = z.infer<typeof evidenceSchema>
