// app/api/trabajadores/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const trabajadores = await sql`
      SELECT
        t.*,
        COUNT(a.id)::int AS total_accidentes
      FROM trabajadores t
      LEFT JOIN accidentes a ON a.trabajador_id = t.id
      WHERE t.activo = true
      GROUP BY t.id
      ORDER BY t.nombre
    `
    return NextResponse.json({ data: trabajadores })
  } catch (error) {
    console.error('Error GET /api/trabajadores:', error)
    return NextResponse.json({ error: 'Error al obtener trabajadores' }, { status: 500 })
  }
}
