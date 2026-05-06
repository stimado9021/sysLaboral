// ─────────────────────────────────────────────────────────────
// lib/auth.ts
// Configuración de NextAuth.js
// Autenticación con email + contraseña contra PostgreSQL
// ─────────────────────────────────────────────────────────────
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { sql } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const rows = await sql`
            SELECT id, nombre, email, password, rol
            FROM usuarios
            WHERE email = ${credentials.email} AND activo = true
            LIMIT 1
          `

          const usuario = rows[0] as {
            id: number; nombre: string; email: string; password: string; rol: string
          } | undefined

          if (!usuario) return null

          const passwordValida = await bcrypt.compare(credentials.password, usuario.password)
          if (!passwordValida) return null

          return {
            id: String(usuario.id),
            name: usuario.nombre,
            email: usuario.email,
            role: usuario.rol,
          }
        } catch (error) {
          console.error('Error en autenticación:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role: string }).role
        token.id   = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: string; id: string }).role = token.role as string
        ;(session.user as typeof session.user & { role: string; id: string }).id   = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60, // 8 horas (un turno de trabajo)
  },

  secret: process.env.NEXTAUTH_SECRET,
}
