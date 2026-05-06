// ─────────────────────────────────────────────────────────────
// app/api/accidentes/route.ts
// GET  → Lista accidentes con filtros
// POST → Crea nuevo reporte completo (accidente + causas + acciones + epp)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { accidentReportSchema } from '@/lib/validations/accident.schema'

// ── GET /api/accidentes ────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const area    = searchParams.get('area')
  const estado  = searchParams.get('estado')
  const desde   = searchParams.get('desde')
  const hasta   = searchParams.get('hasta')
  const limit   = parseInt(searchParams.get('limit') || '50')
  const offset  = parseInt(searchParams.get('offset') || '0')

  try {
    // Query base con JOIN a trabajadores
    const accidentes = await sql`
      SELECT
        a.id,
        a.tipo_evento,
        a.fecha_accidente,
        a.hora_accidente,
        a.area,
        a.gravedad,
        a.tipo_lesion,
        a.dias_incapacidad,
        a.estado,
        a.created_at,
        t.nombre   AS trabajador_nombre,
        t.cargo    AS trabajador_cargo,
        t.cedula   AS trabajador_cedula
      FROM accidentes a
      LEFT JOIN trabajadores t ON a.trabajador_id = t.id
      WHERE 1=1
        ${area   ? sql`AND a.area = ${area}`     : sql``}
        ${estado ? sql`AND a.estado = ${estado}` : sql``}
        ${desde  ? sql`AND a.fecha_accidente >= ${desde}` : sql``}
        ${hasta  ? sql`AND a.fecha_accidente <= ${hasta}`  : sql``}
      ORDER BY a.fecha_accidente DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Total para paginación
    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM accidentes a
      WHERE 1=1
        ${area   ? sql`AND a.area = ${area}`     : sql``}
        ${estado ? sql`AND a.estado = ${estado}` : sql``}
        ${desde  ? sql`AND a.fecha_accidente >= ${desde}` : sql``}
        ${hasta  ? sql`AND a.fecha_accidente <= ${hasta}`  : sql``}
    ` as [{ count: number }]

    return NextResponse.json({ data: accidentes, total: count })

  } catch (error) {
    console.error('Error GET /api/accidentes:', error)
    return NextResponse.json({ error: 'Error al obtener accidentes' }, { status: 500 })
  }
}

// ── POST /api/accidentes ───────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()

    // Validación con Zod
    const validation = accidentReportSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos del reporte incompletos o inválidos', 
        details: validation.error.format() 
      }, { status: 400 })
    }

    const { bloque1, bloque2, bloque3, bloque4, bloque5, bloque6, bloque7, bloque8, bloque9 } = validation.data

    // ── Paso 1: Crear o buscar trabajador ─────────────────
    let trabajadorId: number

    const trabajadoresExistentes = await sql`
      SELECT id FROM trabajadores WHERE cedula = ${bloque2.cedula} LIMIT 1
    `

    if (trabajadoresExistentes.length > 0) {
      trabajadorId = (trabajadoresExistentes[0] as { id: number }).id
    } else {
      const [nuevoTrabajador] = await sql`
        INSERT INTO trabajadores (nombre, cedula, cargo, area, tipo_contrato, empresa_contratista, fecha_ingreso)
        VALUES (
          ${bloque2.nombre},
          ${bloque2.cedula},
          ${bloque2.cargo},
          ${bloque1.area},
          ${bloque2.tipo_contrato},
          ${bloque2.empresa_contratista || null},
          ${bloque2.fecha_ingreso}
        )
        RETURNING id
      ` as [{ id: number }]
      trabajadorId = nuevoTrabajador.id
    }

    // ── Paso 2: Crear el accidente ─────────────────────────
    const usuarioId = parseInt((session.user as { id: string }).id)

    const [accidente] = await sql`
      INSERT INTO accidentes (
        trabajador_id, usuario_id,
        tipo_evento, fecha_accidente, hora_accidente,
        area, ubicacion_especifica, condiciones_climaticas,
        turno, hora_inicio_turno, horas_trabajadas,
        descripcion, forma_accidente, agente_causante, equipo_involucrado,
        tenia_procedimiento, conocia_procedimiento, tenia_analisis_riesgo, tenia_permiso_trabajo,
        tipo_lesion, parte_cuerpo, gravedad, dias_incapacidad,
        requirio_hospitalizacion, requirio_cirugia,
        centro_medico, diagnostico,
        costo_dano_material, horas_paro_produccion,
        supervisor_nombre, supervisor_presente,
        realizo_inspeccion_turno, hubo_accidentes_previos,
        acciones_inmediatas, se_aviso_arl, hora_aviso_arl,
        se_suspendio_actividad, se_notifico_gerencia,
        estado
      ) VALUES (
        ${trabajadorId}, ${usuarioId},
        ${bloque1.tipo_evento}, ${bloque1.fecha_accidente}, ${bloque1.hora_accidente},
        ${bloque1.area}, ${bloque1.ubicacion_especifica}, ${bloque1.condiciones_climaticas || null},
        ${bloque1.turno}, ${bloque1.hora_inicio_turno || null}, ${bloque1.horas_trabajadas},
        ${bloque3.descripcion}, ${bloque3.forma_accidente}, ${bloque3.agente_causante}, ${bloque3.equipo_involucrado || null},
        ${bloque3.tenia_procedimiento}, ${bloque3.conocia_procedimiento}, ${bloque3.tenia_analisis_riesgo}, ${bloque3.tenia_permiso_trabajo},
        ${bloque4.tipo_lesion}, ${bloque4.parte_cuerpo}, ${bloque4.gravedad}, ${bloque4.dias_incapacidad},
        ${bloque4.requirio_hospitalizacion}, ${bloque4.requirio_cirugia},
        ${bloque4.centro_medico || null}, ${bloque4.diagnostico || null},
        ${bloque4.costo_dano_material || 0}, ${bloque4.horas_paro_produccion || 0},
        ${bloque8.supervisor_nombre}, ${bloque8.supervisor_presente},
        ${bloque8.realizo_inspeccion || false}, ${bloque8.hubo_accidentes_previos || false},
        ${bloque8.acciones_inmediatas || null}, ${bloque8.se_aviso_arl || false}, ${bloque8.hora_aviso_arl || null},
        ${bloque8.se_suspendio_actividad || false}, ${bloque8.se_notifico_gerencia || false},
        'en_investigacion'
      )
      RETURNING id
    ` as [{ id: number }]

    const accidenteId = accidente.id

    // ── Paso 3: Guardar causas ─────────────────────────────
    if (bloque5?.actos_inseguros?.length > 0) {
      for (const desc of bloque5.actos_inseguros) {
        if (desc.trim()) {
          await sql`
            INSERT INTO causas (accidente_id, tipo, descripcion, nivel_porque)
            VALUES (${accidenteId}, 'acto_inseguro', ${desc}, 0)
          `
        }
      }
    }

    if (bloque5?.condiciones_inseguras?.length > 0) {
      for (const desc of bloque5.condiciones_inseguras) {
        if (desc.trim()) {
          await sql`
            INSERT INTO causas (accidente_id, tipo, descripcion, nivel_porque)
            VALUES (${accidenteId}, 'condicion_insegura', ${desc}, 0)
          `
        }
      }
    }

    // Los 5 porqués
    if (bloque5?.porques?.length > 0) {
      for (let i = 0; i < bloque5.porques.length; i++) {
        const desc = bloque5.porques[i]
        if (desc?.trim()) {
          await sql`
            INSERT INTO causas (accidente_id, tipo, descripcion, nivel_porque, es_causa_raiz)
            VALUES (
              ${accidenteId}, 'causa_raiz', ${desc}, ${i + 1},
              ${i === bloque5.porques.length - 1}
            )
          `
        }
      }
    }

    // Factores 6M
    if (bloque5?.factores_6m) {
      for (const [categoria, desc] of Object.entries(bloque5.factores_6m)) {
        if (desc && (desc as string).trim()) {
          await sql`
            INSERT INTO causas (accidente_id, tipo, descripcion, categoria_6m, nivel_porque)
            VALUES (${accidenteId}, 'factor_sistema', ${desc as string}, ${categoria}, 0)
          `
        }
      }
    }

    // ── Paso 4: Guardar EPP ────────────────────────────────
    if (bloque6?.epp?.length > 0) {
      for (const epp of bloque6.epp) {
        await sql`
          INSERT INTO epp_registros (accidente_id, tipo_epp, lo_portaba, buen_estado, fecha_ultima_entrega)
          VALUES (${accidenteId}, ${epp.tipo_epp}, ${epp.lo_portaba ?? null}, ${epp.buen_estado ?? null}, ${epp.fecha_ultima_entrega || null})
        `
      }
    }

    // ── Paso 5: Guardar capacitaciones ─────────────────────
    if (bloque6?.capacitaciones?.length > 0) {
      for (const cap of bloque6.capacitaciones) {
        await sql`
          INSERT INTO capacitaciones (accidente_id, tema, recibio_capacitacion, fecha_ultima, aprobo_evaluacion)
          VALUES (${accidenteId}, ${cap.tema}, ${cap.recibio_capacitacion}, ${cap.fecha_ultima || null}, ${cap.aprobo_evaluacion ?? null})
        `
      }
    }

    // ── Paso 6: Guardar testigos ───────────────────────────
    if (bloque7?.testigos?.length > 0) {
      for (const testigo of bloque7.testigos) {
        await sql`
          INSERT INTO testigos (accidente_id, nombre, cargo, telefono, declaracion_tomada)
          VALUES (${accidenteId}, ${testigo.nombre}, ${testigo.cargo || null}, ${testigo.telefono || null}, ${testigo.declaracion_tomada || false})
        `
      }
    }

    // ── Paso 7: Guardar acciones correctivas ──────────────
    if (bloque9?.acciones?.length > 0) {
      for (const accion of bloque9.acciones) {
        if (accion.descripcion?.trim()) {
          await sql`
            INSERT INTO acciones_correctivas (accidente_id, descripcion, responsable, fecha_limite, estado)
            VALUES (${accidenteId}, ${accion.descripcion}, ${accion.responsable}, ${accion.fecha_limite}, 'pendiente')
          `
        }
      }
    }

    return NextResponse.json({ data: { id: accidenteId }, message: 'Reporte creado exitosamente' }, { status: 201 })

  } catch (error) {
    console.error('Error POST /api/accidentes:', error)
    return NextResponse.json({ error: 'Error al crear el reporte' }, { status: 500 })
  }
}
