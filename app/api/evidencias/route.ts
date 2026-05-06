// app/api/evidencias/route.ts
// GET  → Lista evidencias de un accidente
// POST → Registra una nueva evidencia (URL ya subida o base64)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { evidenceSchema } from '@/lib/validations/accident.schema'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const accidenteId = searchParams.get('accidente_id')
  if (!accidenteId) return NextResponse.json({ error: 'Falta accidente_id' }, { status: 400 })

  try {
    const evidencias = await sql`
      SELECT e.*, u.nombre AS subido_por_nombre
      FROM evidencias e
      LEFT JOIN usuarios u ON e.subido_por = u.id
      WHERE e.accidente_id = ${accidenteId}
      ORDER BY e.created_at DESC
    `
    return NextResponse.json({ data: evidencias })
  } catch (error) {
    console.error('Error GET /api/evidencias:', error)
    return NextResponse.json({ error: 'Error al obtener evidencias' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    
    // Validación con Zod
    const validation = evidenceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 })
    }

    const { accidente_id, nombre_archivo, url, tipo_mime, tamaño_bytes, tipo, descripcion } = validation.data

    // Obtener ID del usuario actual
    const [usuario] = await sql`
      SELECT id FROM usuarios WHERE email = ${session.user?.email}
    ` as [{ id: number }]

    const [nueva] = await sql`
      INSERT INTO evidencias (accidente_id, nombre_archivo, url, tipo_mime, tamaño_bytes, tipo, descripcion, subido_por)
      VALUES (${accidente_id}, ${nombre_archivo}, ${url}, ${tipo_mime || null}, ${tamaño_bytes || 0},
              ${tipo || 'foto'}, ${descripcion || null}, ${usuario?.id || null})
      RETURNING *
    `
    return NextResponse.json({ data: nueva }, { status: 201 })
  } catch (error) {
    console.error('Error POST /api/evidencias:', error)
    return NextResponse.json({ error: 'Error al guardar evidencia' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  try {
    await sql`DELETE FROM evidencias WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error DELETE /api/evidencias:', error)
    return NextResponse.json({ error: 'Error al eliminar evidencia' }, { status: 500 })
  }
}
