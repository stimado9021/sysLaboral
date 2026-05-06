// app/api/accidentes/[id]/route.ts
// GET → Detalle completo de un accidente (con todas sus relaciones)
// PUT → Actualiza estado del reporte
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const parsedId = parseInt(id)
  if (isNaN(parsedId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    const [accidente] = await sql`
      SELECT a.*, 
        t.nombre AS trabajador_nombre, t.cedula, t.cargo, t.area AS trabajador_area,
        t.tipo_contrato, t.fecha_ingreso, t.empresa_contratista
      FROM accidentes a
      LEFT JOIN trabajadores t ON a.trabajador_id = t.id
      WHERE a.id = ${parsedId}
    `

    if (!accidente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const causas       = await sql`SELECT * FROM causas WHERE accidente_id = ${parsedId} ORDER BY nivel_porque, id`
    const acciones     = await sql`SELECT * FROM acciones_correctivas WHERE accidente_id = ${parsedId} ORDER BY fecha_limite`
    const epp          = await sql`SELECT * FROM epp_registros WHERE accidente_id = ${parsedId}`
    const capacitaciones = await sql`SELECT * FROM capacitaciones WHERE accidente_id = ${parsedId}`
    const testigos     = await sql`SELECT * FROM testigos WHERE accidente_id = ${parsedId}`

    return NextResponse.json({
      data: { ...accidente, causas, acciones, epp, capacitaciones, testigos }
    })
  } catch (error) {
    console.error('Error GET /api/accidentes/[id]:', error)
    return NextResponse.json({ error: 'Error al obtener el accidente' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const parsedId = parseInt(id)
  const body = await req.json()

  try {
    await sql`
      UPDATE accidentes SET estado = ${body.estado}
      WHERE id = ${parsedId}
    `
    return NextResponse.json({ message: 'Actualizado correctamente' })
  } catch (error) {
    console.error('Error PUT /api/accidentes/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
