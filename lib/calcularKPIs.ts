// ─────────────────────────────────────────────────────────────
// lib/calcularKPIs.ts
// Lógica de cálculo de indicadores de seguridad
// Todos los índices según normativa colombiana (Decreto 1072/2015)
// e internacional (OSHA / ISO 45001)
// ─────────────────────────────────────────────────────────────
import { Indicadores } from '@/types'

interface DatosBase {
  total_accidentes: number
  total_incidentes: number
  dias_perdidos: number
  horas_hombre_trabajadas: number
  num_trabajadores: number
}

/**
 * Calcula todos los índices de accidentalidad
 * 
 * IF  = Índice de Frecuencia  → (accidentes × 1.000.000) / HHT
 * IG  = Índice de Gravedad    → (días perdidos × 1.000.000) / HHT
 * II  = Índice de Incidencia  → (accidentes / trabajadores) × 1.000
 * ILI = Índice de Lesión Inc. → (IF × IG) / 1.000
 */
export function calcularIndicadores(
  datos: DatosBase,
  periodo: string
): Indicadores {
  const { total_accidentes, total_incidentes, dias_perdidos, horas_hombre_trabajadas, num_trabajadores } = datos

  // Evitar división por cero
  const hht = horas_hombre_trabajadas || 1
  const trabajadores = num_trabajadores || 1

  const IF_val  = (total_accidentes * 1_000_000) / hht
  const IG_val  = (dias_perdidos * 1_000_000) / hht
  const II_val  = (total_accidentes / trabajadores) * 1_000
  const ILI_val = (IF_val * IG_val) / 1_000

  return {
    periodo,
    total_accidentes,
    total_incidentes,
    dias_perdidos,
    horas_hombre_trabajadas,
    num_trabajadores,
    if: parseFloat(IF_val.toFixed(4)),
    ig: parseFloat(IG_val.toFixed(4)),
    ii: parseFloat(II_val.toFixed(4)),
    ili: parseFloat(ILI_val.toFixed(4)),
  }
}

/**
 * Interpreta el nivel de riesgo según el IF
 */
export function interpretarIF(if_valor: number): {
  nivel: 'excelente' | 'bueno' | 'aceptable' | 'critico'
  color: string
  mensaje: string
} {
  if (if_valor === 0)    return { nivel: 'excelente', color: '#26de81', mensaje: 'Sin accidentes en el período' }
  if (if_valor < 3)     return { nivel: 'bueno',      color: '#45aaf2', mensaje: 'Por debajo del promedio sectorial' }
  if (if_valor < 6)     return { nivel: 'aceptable',  color: '#f7b731', mensaje: 'Dentro del promedio — requiere atención' }
  return                       { nivel: 'critico',    color: '#e63946', mensaje: 'Por encima del promedio — acción inmediata' }
}

/**
 * Calcula el porcentaje de variación entre dos períodos
 */
export function calcularVariacion(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0
  return parseFloat((((actual - anterior) / anterior) * 100).toFixed(1))
}
