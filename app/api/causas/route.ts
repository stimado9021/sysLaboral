import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/causas - Obtener causas filtradas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accidente_id = searchParams.get('accidente_id')

    let causas
    if (accidente_id) {
      causas = await sql`
        SELECT * FROM causas 
        WHERE accidente_id = ${accidente_id}
        ORDER BY nivel_porque ASC, created_at ASC
      `
    } else {
      causas = await sql`SELECT * FROM causas ORDER BY created_at DESC`
    }

    return NextResponse.json({ data: causas })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener causas' },
      { status: 500 }
    )
  }
}

// POST /api/causas - Crear nueva causa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accidente_id, tipo, descripcion, categoria_6m, es_causa_raiz, nivel_porque, causa_padre_id } = body

    const [causa] = await sql`
      INSERT INTO causas (
        accidente_id, tipo, descripcion, categoria_6m, es_causa_raiz, nivel_porque, causa_padre_id, created_at)
      VALUES (${accidente_id}, ${tipo}, ${descripcion}, ${categoria_6m}, ${es_causa_raiz}, ${nivel_porque}, ${causa_padre_id}, now())
      RETURNING *
    `

    return NextResponse.json({
      message: 'Causa registrada correctamente',
      data: causa
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar causa' },
      { status: 500 }
    )
  }
}