// scripts/add_evidencias.js
// Agrega la tabla 'evidencias' al esquema existente
// Ejecutar con: node scripts/add_evidencias.js

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.POSTGRES_URL)

async function migrate() {
  console.log('🚀 Agregando tabla de evidencias...\n')

  try {
    // ── Tabla: evidencias ──────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS evidencias (
        id              SERIAL PRIMARY KEY,
        accidente_id    INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        nombre_archivo  VARCHAR(300) NOT NULL,
        url             TEXT NOT NULL,
        tipo_mime       VARCHAR(100),
        tamaño_bytes    INTEGER DEFAULT 0,
        tipo            VARCHAR(30) NOT NULL DEFAULT 'foto'
                        CHECK (tipo IN ('foto','documento','video','otro')),
        descripcion     TEXT,
        subido_por      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla evidencias creada')

    await sql`CREATE INDEX IF NOT EXISTS idx_evidencias_accidente ON evidencias(accidente_id)`
    console.log('✅ Índice idx_evidencias_accidente creado')

    console.log('\n═══════════════════════════════════════════')
    console.log('✅ MIGRACIÓN COMPLETADA')
    console.log('═══════════════════════════════════════════')

  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

migrate()
