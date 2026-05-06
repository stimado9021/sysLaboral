// ─────────────────────────────────────────────────────────────
// lib/db.ts
// Conexión a PostgreSQL usando @neondatabase/serverless
// Compatible con Vercel Postgres (que usa Neon internamente)
// Este archivo SOLO corre en el servidor — nunca en el browser
// ─────────────────────────────────────────────────────────────
import { neon } from '@neondatabase/serverless'

if (!process.env.POSTGRES_URL) {
  throw new Error('❌ POSTGRES_URL no está definida en .env.local')
}

// sql es una función tagged template que ejecuta queries de forma segura
// Ejemplo: await sql`SELECT * FROM accidentes WHERE id = ${id}`
export const sql = neon(process.env.POSTGRES_URL)
