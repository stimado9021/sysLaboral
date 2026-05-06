// app/api/acciones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const acciones = await sql`
      SELECT ac.*, a.area
      FROM acciones_correctivas ac
      JOIN accidentes a ON ac.accidente_id = a.id
      ORDER BY
        CASE ac.estado
          WHEN 'vencido'   THEN 1
          WHEN 'pendiente' THEN 2
          WHEN 'en_curso'  THEN 3
          WHEN 'cerrado'   THEN 4
        END,
        ac.fecha_limite ASC
    `
    return NextResponse.json({ data: acciones })
  } catch (error) {
    console.error('Error GET /api/acciones:', error)
    return NextResponse.json({ error: 'Error al obtener acciones' }, { status: 500 })
  }
}
