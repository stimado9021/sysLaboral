// app/api/reportes/consolidado/route.ts
// GET → Exporta todos los accidentes del año en formato CSV o JSON
// ?formato=csv|json  &año=YYYY  &area=X  &estado=X
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const año     = searchParams.get('año') || new Date().getFullYear().toString()
  const area    = searchParams.get('area') || ''
  const estado  = searchParams.get('estado') || ''
  const formato = searchParams.get('formato') || 'csv'

  try {
    const filtroArea   = area   ? sql`AND a.area = ${area}`    : sql``
    const filtroEstado = estado ? sql`AND a.estado = ${estado}` : sql``

    const registros = await sql`
      SELECT
        a.id,
        a.fecha_accidente,
        a.hora_accidente,
        a.tipo_evento,
        a.area,
        a.ubicacion_especifica,
        a.turno,
        a.descripcion,
        a.forma_accidente,
        a.agente_causante,
        a.tipo_lesion,
        a.parte_cuerpo,
        a.gravedad,
        a.dias_incapacidad,
        a.requirio_hospitalizacion,
        a.requirio_cirugia,
        a.centro_medico,
        a.diagnostico,
        a.costo_dano_material,
        a.horas_paro_produccion,
        a.supervisor_nombre,
        a.supervisor_presente,
        a.se_aviso_arl,
        a.se_suspendio_actividad,
        a.acciones_inmediatas,
        a.estado,
        a.created_at,
        t.nombre      AS trabajador_nombre,
        t.cedula,
        t.cargo,
        t.area        AS area_trabajador,
        t.tipo_contrato,
        t.empresa_contratista
      FROM accidentes a
      LEFT JOIN trabajadores t ON a.trabajador_id = t.id
      WHERE EXTRACT(YEAR FROM a.fecha_accidente) = ${año}
        AND a.estado != 'borrador'
        ${filtroArea}
        ${filtroEstado}
      ORDER BY a.fecha_accidente DESC
    `

    // ── Resumen KPIs ──────────────────────────────────────
    const [resumen] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE tipo_evento IN ('accidente_lesion','accidente_mortal')) AS total_accidentes,
        COUNT(*) FILTER (WHERE tipo_evento IN ('incidente_peligroso','casi_accidente')) AS total_incidentes,
        COUNT(*) FILTER (WHERE tipo_evento = 'accidente_mortal') AS accidentes_mortales,
        COALESCE(SUM(dias_incapacidad), 0) AS dias_perdidos,
        COALESCE(SUM(costo_dano_material), 0) AS costo_total,
        COALESCE(SUM(horas_paro_produccion), 0) AS horas_paro_total
      FROM accidentes
      WHERE EXTRACT(YEAR FROM fecha_accidente) = ${año}
        AND estado != 'borrador'
        ${filtroArea}
        ${filtroEstado}
    ` as [{ total_accidentes: number; total_incidentes: number; accidentes_mortales: number; dias_perdidos: number; costo_total: number; horas_paro_total: number }]

    if (formato === 'json') {
      return NextResponse.json({ año, area, estado, resumen, registros })
    }

    // ── Generar CSV ───────────────────────────────────────
    const esc = (v: unknown): string => {
      if (v === null || v === undefined) return ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }

    const CABECERA = [
      'ID','Fecha','Hora','Tipo Evento','Área','Ubicación','Turno',
      'Descripción','Forma Accidente','Agente Causante',
      'Tipo Lesión','Parte Cuerpo','Gravedad','Días Incapacidad',
      'Hospitalización','Cirugía','Centro Médico','Diagnóstico',
      'Costo Daño Material','Horas Paro','Supervisor','Supervisor Presente',
      'ARL Avisada','Actividad Suspendida','Acciones Inmediatas','Estado',
      'Trabajador','Cédula','Cargo','Tipo Contrato','Empresa Contratista',
    ]

    const filas = registros.map(r => [
      r.id, r.fecha_accidente, r.hora_accidente, r.tipo_evento?.replace(/_/g,' '),
      r.area, r.ubicacion_especifica, r.turno, r.descripcion,
      r.forma_accidente?.replace(/_/g,' '), r.agente_causante?.replace(/_/g,' '),
      r.tipo_lesion?.replace(/_/g,' '), r.parte_cuerpo, r.gravedad,
      r.dias_incapacidad,
      r.requirio_hospitalizacion ? 'Sí' : 'No',
      r.requirio_cirugia ? 'Sí' : 'No',
      r.centro_medico, r.diagnostico,
      r.costo_dano_material, r.horas_paro_produccion,
      r.supervisor_nombre, r.supervisor_presente ? 'Sí' : 'No',
      r.se_aviso_arl ? 'Sí' : 'No',
      r.se_suspendio_actividad ? 'Sí' : 'No',
      r.acciones_inmediatas, r.estado?.replace(/_/g,' '),
      r.trabajador_nombre, r.cedula, r.cargo, r.tipo_contrato?.replace(/_/g,' '), r.empresa_contratista,
    ].map(esc).join(','))

    // Líneas resumen al final
    const resumenLineas = [
      '',
      `RESUMEN ${año}${area ? ' · ' + area : ''}`,
      `Total accidentes,${resumen.total_accidentes}`,
      `Total incidentes,${resumen.total_incidentes}`,
      `Accidentes mortales,${resumen.accidentes_mortales}`,
      `Días de incapacidad,${resumen.dias_perdidos}`,
      `Costo total daños,${Number(resumen.costo_total).toLocaleString('es-CO')}`,
      `Horas paro producción,${resumen.horas_paro_total}`,
    ]

    // BOM UTF-8 para que Excel abra correctamente con tildes y ñ
    const BOM = '\uFEFF'
    const csv = BOM + [CABECERA.join(','), ...filas, ...resumenLineas].join('\r\n')

    const filename = `SST-Reporte-Consolidado-${año}${area ? '-' + area.replace(/\s/g,'-') : ''}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error GET /api/reportes/consolidado:', error)
    return NextResponse.json({ error: 'Error al generar reporte consolidado' }, { status: 500 })
  }
}
