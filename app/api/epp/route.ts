import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/epp - Obtener registros EPP por accidente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accidente_id = searchParams.get('accidente_id')

    if (!accidente_id) {
      return NextResponse.json(
        { error: 'accidente_id es requerido' },
        { status: 400 }
      )
    }

    const registros = await sql`
      SELECT * FROM epp_registros 
      WHERE accidente_id = ${accidente_id}
      ORDER BY id ASC
    `

    return NextResponse.json({ data: registros })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener registros EPP' },
      { status: 500 }
    )
  }
}

// POST /api/epp - Registrar nuevo registro EPP
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accidente_id, tipo_epp, lo_portaba, buen_estado, fecha_ultima_entrega } = body

    const [registro] = await sql`
      INSERT INTO epp_registros (
        accidente_id, tipo_epp, lo_portaba, buen_estado, fecha_ultima_entrega, created_at)
      VALUES (${accidente_id}, ${tipo_epp}, ${lo_portaba}, ${buen_estado}, ${fecha_ultima_entrega}, now())
      RETURNING *
    `

    return NextResponse.json({
      message: 'Registro EPP guardado correctamente',
      data: registro
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar registro EPP' },
      { status: 500 }
    )
  }
}