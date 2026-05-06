import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hash } from 'bcryptjs'

// GET /api/usuarios - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await sql`
      SELECT id, nombre, email, rol, activo, created_at 
      FROM usuarios 
      ORDER BY nombre ASC
    `

    return NextResponse.json({ data: usuarios })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, password, rol } = body

    // Verificar si el email ya existe
    const existe = await sql`SELECT id FROM usuarios WHERE email = ${email}`
    if (existe) {
      return NextResponse.json(
        { error: 'El email ya esta registrado' },
        { status: 400 }
      )
    }

    const passwordHash = await hash(password, 12)

    const [usuario] = await sql`
      INSERT INTO usuarios (nombre, email, password, rol, activo, created_at)
      VALUES (${nombre}, ${email}, ${passwordHash}, ${rol}, true, now())
      RETURNING id, nombre, email, rol, activo, created_at
    `

    return NextResponse.json({
      message: 'Usuario creado correctamente',
      data: usuario
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}