// app/api/acciones/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const parsedId = parseInt(id)
  const body = await req.json()

  try {
    await sql`
      UPDATE acciones_correctivas
      SET estado = ${body.estado},
          fecha_cierre = ${body.estado === 'cerrado' ? new Date().toISOString() : null}
      WHERE id = ${parsedId}
    `
    return NextResponse.json({ message: 'Actualizado' })
  } catch (error) {
    console.error('Error PUT /api/acciones/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
