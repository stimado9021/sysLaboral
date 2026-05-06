import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/configuracion - Obtener configuración del sistema
export async function GET() {
  try {
    const configuracion = await sql`
      SELECT clave, valor, descripcion, tipo
      FROM configuracion
      ORDER BY clave ASC
    `

    // Convertir a objeto key-value
    const config = Object.fromEntries(
      configuracion.map((item: any) => [item.clave, item.valor])
    )

    return NextResponse.json({ data: config, meta: configuracion })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PATCH /api/configuracion - Actualizar valores de configuración
export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Actualizar cada clave enviada
    const actualizados = []
    for (const [clave, valor] of Object.entries(body)) {
      const [result] = await sql`
        UPDATE configuracion 
        SET valor = ${valor}, updated_at = now()
        WHERE clave = ${clave}
        RETURNING clave, valor
      `
      if (result) actualizados.push(result)
    }

    return NextResponse.json({
      message: 'Configuración actualizada correctamente',
      data: actualizados
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}