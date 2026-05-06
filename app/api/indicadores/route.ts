// app/api/indicadores/route.ts
// GET → Calcula y retorna todos los KPIs para el dashboard
// Soporta filtros: año, área, tipo_evento, soloAreas
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { calcularIndicadores } from '@/lib/calcularKPIs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const año          = searchParams.get('año') || new Date().getFullYear().toString()
  const hht          = parseInt(searchParams.get('hht') || '200000')
  const numTrabajadores = parseInt(searchParams.get('trabajadores') || '100')
  const area         = searchParams.get('area') || ''
  const tipoEvento   = searchParams.get('tipo_evento') || ''
  const soloAreas    = searchParams.get('soloAreas') === 'true'

  try {
    // ── Modo soloAreas: retorna solo las áreas con eventos ──
    if (soloAreas) {
      const porArea = await sql`
        SELECT DISTINCT area
        FROM accidentes
        WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
          AND estado != 'borrador'
          AND area IS NOT NULL
        ORDER BY area
      `
      return NextResponse.json({ data: { porArea } })
    }

    // ── Cláusulas de filtro dinámicas ───────────────────────
    // Construimos el WHERE adicional como fragmentos
    const filtroArea       = area       ? sql`AND area = ${area}` : sql``
    const filtroTipoEvento = tipoEvento ? sql`AND tipo_evento = ${tipoEvento}` : sql``

    // ── KPIs del año completo ───────────────────────────────
    const [resumenAnual] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE tipo_evento = 'accidente_lesion' OR tipo_evento = 'accidente_mortal') AS total_accidentes,
        COUNT(*) FILTER (WHERE tipo_evento IN ('incidente_peligroso','casi_accidente'))              AS total_incidentes,
        COALESCE(SUM(dias_incapacidad), 0) AS dias_perdidos,
        COUNT(*) FILTER (WHERE tipo_evento = 'accidente_mortal')                                    AS accidentes_mortales
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND estado != 'borrador'
        ${filtroArea}
        ${filtroTipoEvento}
    ` as [{ total_accidentes: number; total_incidentes: number; dias_perdidos: number; accidentes_mortales: number }]

    const kpisAnuales = calcularIndicadores(
      {
        total_accidentes: Number(resumenAnual.total_accidentes),
        total_incidentes: Number(resumenAnual.total_incidentes),
        dias_perdidos: Number(resumenAnual.dias_perdidos),
        horas_hombre_trabajadas: hht,
        num_trabajadores: numTrabajadores,
      },
      año
    )

    // ── KPIs por mes ────────────────────────────────────────
    const porMes = await sql`
      SELECT
        TO_CHAR(fecha_accidente, 'YYYY-MM') AS mes,
        COUNT(*) FILTER (WHERE tipo_evento IN ('accidente_lesion','accidente_mortal')) AS accidentes,
        COUNT(*) FILTER (WHERE tipo_evento IN ('incidente_peligroso','casi_accidente')) AS incidentes,
        COALESCE(SUM(dias_incapacidad), 0) AS dias_perdidos
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND estado != 'borrador'
        ${filtroArea}
        ${filtroTipoEvento}
      GROUP BY mes
      ORDER BY mes
    `

    // ── Accidentes por área ─────────────────────────────────
    const porArea = await sql`
      SELECT area, COUNT(*) AS total
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND tipo_evento IN ('accidente_lesion','accidente_mortal')
        AND estado != 'borrador'
        ${filtroTipoEvento}
      GROUP BY area
      ORDER BY total DESC
      LIMIT 10
    `

    // ── Accidentes por tipo de lesión ───────────────────────
    const porLesion = await sql`
      SELECT tipo_lesion, COUNT(*) AS total
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND tipo_lesion IS NOT NULL
        AND estado != 'borrador'
        ${filtroArea}
        ${filtroTipoEvento}
      GROUP BY tipo_lesion
      ORDER BY total DESC
    `

    // ── Accidentes por turno ────────────────────────────────
    const porTurno = await sql`
      SELECT turno, COUNT(*) AS total
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND turno IS NOT NULL
        AND estado != 'borrador'
        ${filtroArea}
        ${filtroTipoEvento}
      GROUP BY turno
    `

    // ── Top causas raíz ────────────────────────────────────
    const topCausas = await sql`
      SELECT c.descripcion, COUNT(*) AS frecuencia
      FROM causas c
      JOIN accidentes a ON c.accidente_id = a.id
      WHERE c.es_causa_raiz = true
        AND EXTRACT(YEAR FROM a.fecha_accidente) = ${año}
        ${area ? sql`AND a.area = ${area}` : sql``}
        ${tipoEvento ? sql`AND a.tipo_evento = ${tipoEvento}` : sql``}
      GROUP BY c.descripcion
      ORDER BY frecuencia DESC
      LIMIT 8
    `

    // ── Estado acciones correctivas ────────────────────────
    const estadoAcciones = await sql`
      SELECT ac.estado, COUNT(*) AS total
      FROM acciones_correctivas ac
      JOIN accidentes a ON ac.accidente_id = a.id
      WHERE EXTRACT(YEAR FROM a.fecha_accidente) = ${año}
        ${area ? sql`AND a.area = ${area}` : sql``}
      GROUP BY ac.estado
    `

    return NextResponse.json({
      data: {
        kpisAnuales,
        accidentes_mortales: Number(resumenAnual.accidentes_mortales),
        porMes,
        porArea,
        porLesion,
        porTurno,
        topCausas,
        estadoAcciones,
      }
    })

  } catch (error) {
    console.error('Error GET /api/indicadores:', error)
    return NextResponse.json({ error: 'Error al calcular indicadores' }, { status: 500 })
  }
}
