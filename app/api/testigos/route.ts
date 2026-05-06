import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/testigos - Obtener testigos por accidente
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

    const testigos = await sql`
      SELECT * FROM testigos 
      WHERE accidente_id = ${accidente_id}
      ORDER BY id ASC
    `

    return NextResponse.json({ data: testigos })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener testigos' },
      { status: 500 }
    )
  }
}

// POST /api/testigos - Registrar nuevo testigo
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accidente_id, nombre, cargo, telefono, declaracion_tomada } = body

    const [testigo] = await sql`
      INSERT INTO testigos (
        accidente_id, nombre, cargo, telefono, declaracion_tomada, created_at)
      VALUES (${accidente_id}, ${nombre}, ${cargo}, ${telefono}, ${declaracion_tomada}, now())
      RETURNING *
    `

    return NextResponse.json({
      message: 'Testigo registrado correctamente',
      data: testigo
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar testigo' },
      { status: 500 }
    )
  }
}