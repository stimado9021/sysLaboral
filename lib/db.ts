// ─────────────────────────────────────────────────────────────
// lib/db.ts
// Conexión a PostgreSQL usando @neondatabase/serverless
// Compatible con Vercel Postgres (que usa Neon internamente)
// Este archivo SOLO corre en el servidor — nunca en el browser
// ─────────────────────────────────────────────────────────────
import { neon } from '@neondatabase/serverless'

// Inicializamos la conexión solo si existe la variable,
// o creamos una función proxy que lance el error al intentar hacer una query.
// Esto evita que el build ('npm run build') falle en entornos de CI/CD 
// donde POSTGRES_URL podría no estar definida en el momento de compilar.
const connectionString = process.env.POSTGRES_URL || ''

export const sql = connectionString 
  ? neon(connectionString) 
  : ((...args: any[]) => {
      throw new Error('❌ POSTGRES_URL no está definida en las variables de entorno (.env.local o Vercel)')
    }) as ReturnType<typeof neon>
