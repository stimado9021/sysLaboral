import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/capacitaciones - Obtener registros de capacitación
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

    const capacitaciones = await sql`
      SELECT * FROM capacitaciones 
      WHERE accidente_id = ${accidente_id}
      ORDER BY id ASC
    `

    return NextResponse.json({ data: capacitaciones })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener capacitaciones' },
      { status: 500 }
    )
  }
}

// POST /api/capacitaciones - Registrar nueva capacitación
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accidente_id, tema, recibio_capacitacion, fecha_ultima, aprobo_evaluacion } = body

    const [capacitacion] = await sql`
      INSERT INTO capacitaciones (
        accidente_id, tema, recibio_capacitacion, fecha_ultima, aprobo_evaluacion, created_at)
      VALUES (${accidente_id}, ${tema}, ${recibio_capacitacion}, ${fecha_ultima}, ${aprobo_evaluacion}, now())
      RETURNING *
    `

    return NextResponse.json({
      message: 'Registro de capacitación guardado correctamente',
      data: capacitacion
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar capacitación' },
      { status: 500 }
    )
  }
}