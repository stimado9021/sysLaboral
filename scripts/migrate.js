// ─────────────────────────────────────────────────────────────
// scripts/migrate.js
// Ejecutar con: npm run db:migrate
// Crea TODAS las tablas del sistema SST en PostgreSQL
// Es idempotente: puedes ejecutarlo varias veces sin problemas
// ─────────────────────────────────────────────────────────────

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.POSTGRES_URL)

async function migrate() {
  console.log('🚀 Iniciando migración de base de datos SST...\n')

  try {

    // ── 1. EXTENSIONES ────────────────────────────────────
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    console.log('✅ Extensiones creadas')

    // ── 2. TABLA: usuarios ────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id          SERIAL PRIMARY KEY,
        nombre      VARCHAR(200) NOT NULL,
        email       VARCHAR(200) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        rol         VARCHAR(50)  NOT NULL DEFAULT 'hsse'
                    CHECK (rol IN ('admin','hsse','supervisor','gerente','auditor')),
        activo      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla usuarios')

    // ── 3. TABLA: trabajadores ────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS trabajadores (
        id                  SERIAL PRIMARY KEY,
        nombre              VARCHAR(200) NOT NULL,
        cedula              VARCHAR(50)  NOT NULL UNIQUE,
        fecha_nacimiento    DATE,
        genero              VARCHAR(20),
        cargo               VARCHAR(150) NOT NULL,
        area                VARCHAR(150) NOT NULL,
        tipo_contrato       VARCHAR(50)  NOT NULL DEFAULT 'directo'
                            CHECK (tipo_contrato IN ('directo','contratista','temporal','aprendiz')),
        empresa_contratista VARCHAR(200),
        fecha_ingreso       DATE NOT NULL,
        nivel_educacion     VARCHAR(100),
        activo              BOOLEAN NOT NULL DEFAULT true,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla trabajadores')

    // ── 4. TABLA: accidentes ──────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS accidentes (
        id                        SERIAL PRIMARY KEY,
        trabajador_id             INTEGER REFERENCES trabajadores(id) ON DELETE SET NULL,
        usuario_id                INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

        -- Bloque 1: Información general
        tipo_evento               VARCHAR(50) NOT NULL
                                  CHECK (tipo_evento IN (
                                    'accidente_lesion','accidente_mortal','incidente_peligroso',
                                    'casi_accidente','dano_propiedad','enfermedad_laboral'
                                  )),
        fecha_accidente           DATE NOT NULL,
        hora_accidente            TIME NOT NULL,
        fecha_reporte             DATE NOT NULL DEFAULT CURRENT_DATE,
        empresa                   VARCHAR(200),
        direccion                 TEXT,
        area                      VARCHAR(150) NOT NULL,
        ubicacion_especifica      TEXT,
        condiciones_climaticas    VARCHAR(200),
        turno                     VARCHAR(20) CHECK (turno IN ('manana','tarde','noche')),
        hora_inicio_turno         TIME,
        horas_trabajadas          DECIMAL(4,1),

        -- Bloque 3: Descripción
        descripcion               TEXT NOT NULL,
        forma_accidente           VARCHAR(100),
        agente_causante           VARCHAR(100),
        equipo_involucrado        VARCHAR(300),
        tenia_procedimiento       BOOLEAN DEFAULT false,
        conocia_procedimiento     BOOLEAN DEFAULT false,
        tenia_analisis_riesgo     BOOLEAN DEFAULT false,
        tenia_permiso_trabajo     BOOLEAN DEFAULT false,

        -- Bloque 4: Lesiones
        tipo_lesion               VARCHAR(50)
                                  CHECK (tipo_lesion IN (
                                    'fractura','luxacion','esguince','laceracion','contusion',
                                    'quemadura','amputacion','lesion_ocular','lesion_interna',
                                    'intoxicacion','muerte','otro'
                                  )),
        parte_cuerpo              VARCHAR(200),
        lado_afectado             VARCHAR(50),
        gravedad                  VARCHAR(20) CHECK (gravedad IN ('leve','moderada','grave','fatal')),
        requirio_hospitalizacion  BOOLEAN DEFAULT false,
        requirio_cirugia          BOOLEAN DEFAULT false,
        dias_incapacidad          INTEGER DEFAULT 0,
        fecha_reintegro_estimada  DATE,
        centro_medico             VARCHAR(200),
        diagnostico               TEXT,
        costo_dano_material       DECIMAL(15,2) DEFAULT 0,
        horas_paro_produccion     DECIMAL(8,2) DEFAULT 0,

        -- Bloque 8: Supervisor y gestión
        supervisor_nombre         VARCHAR(200),
        supervisor_presente       BOOLEAN DEFAULT false,
        realizo_inspeccion_turno  BOOLEAN DEFAULT false,
        hubo_accidentes_previos   BOOLEAN DEFAULT false,
        acciones_inmediatas       TEXT,
        se_aviso_arl              BOOLEAN DEFAULT false,
        hora_aviso_arl            TIME,
        se_suspendio_actividad    BOOLEAN DEFAULT false,
        se_notifico_gerencia      BOOLEAN DEFAULT false,

        -- Estado del reporte
        estado                    VARCHAR(30) NOT NULL DEFAULT 'borrador'
                                  CHECK (estado IN ('borrador','en_investigacion','cerrado')),

        created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla accidentes')

    // ── 5. TABLA: causas ──────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS causas (
        id              SERIAL PRIMARY KEY,
        accidente_id    INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        tipo            VARCHAR(50) NOT NULL
                        CHECK (tipo IN ('acto_inseguro','condicion_insegura','causa_raiz','factor_sistema')),
        descripcion     TEXT NOT NULL,
        categoria_6m    VARCHAR(30)
                        CHECK (categoria_6m IN (
                          'maquina','metodo','mano_obra','materiales','medio_ambiente','medicion'
                        )),
        es_causa_raiz   BOOLEAN NOT NULL DEFAULT false,
        nivel_porque    INTEGER NOT NULL DEFAULT 0, -- 0=evento, 1..5=porqués
        causa_padre_id  INTEGER REFERENCES causas(id) ON DELETE SET NULL,
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla causas')

    // ── 6. TABLA: acciones_correctivas ────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS acciones_correctivas (
        id              SERIAL PRIMARY KEY,
        accidente_id    INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        descripcion     TEXT NOT NULL,
        responsable     VARCHAR(200) NOT NULL,
        fecha_limite    DATE NOT NULL,
        estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','en_curso','cerrado','vencido')),
        fecha_cierre    DATE,
        verificado_por  VARCHAR(200),
        created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla acciones_correctivas')

    // ── 7. TABLA: epp_registros ───────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS epp_registros (
        id                    SERIAL PRIMARY KEY,
        accidente_id          INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        tipo_epp              VARCHAR(100) NOT NULL,
        lo_portaba            BOOLEAN,          -- NULL = no aplica
        buen_estado           BOOLEAN,
        fecha_ultima_entrega  DATE,
        created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla epp_registros')

    // ── 8. TABLA: capacitaciones ──────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS capacitaciones (
        id                      SERIAL PRIMARY KEY,
        accidente_id            INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        tema                    VARCHAR(200) NOT NULL,
        recibio_capacitacion    BOOLEAN NOT NULL DEFAULT false,
        fecha_ultima            DATE,
        aprobo_evaluacion       BOOLEAN,        -- NULL = sin evaluación
        created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla capacitaciones')

    // ── 9. TABLA: testigos ────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS testigos (
        id                  SERIAL PRIMARY KEY,
        accidente_id        INTEGER NOT NULL REFERENCES accidentes(id) ON DELETE CASCADE,
        nombre              VARCHAR(200) NOT NULL,
        cargo               VARCHAR(150),
        telefono            VARCHAR(50),
        declaracion_tomada  BOOLEAN NOT NULL DEFAULT false,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Tabla testigos')

    // ── 10. TABLA: indicadores_historicos ─────────────────
    // Se actualiza automáticamente cuando se cierra un reporte
    await sql`
      CREATE TABLE IF NOT EXISTS indicadores_historicos (
        id                        SERIAL PRIMARY KEY,
        periodo                   VARCHAR(7) NOT NULL,  -- Formato: 'YYYY-MM'
        total_accidentes          INTEGER NOT NULL DEFAULT 0,
        total_incidentes          INTEGER NOT NULL DEFAULT 0,
        dias_perdidos             INTEGER NOT NULL DEFAULT 0,
        horas_hombre_trabajadas   BIGINT  NOT NULL DEFAULT 0,
        num_trabajadores          INTEGER NOT NULL DEFAULT 0,
        if_valor                  DECIMAL(10,4) DEFAULT 0,  -- Índice de Frecuencia
        ig_valor                  DECIMAL(10,4) DEFAULT 0,  -- Índice de Gravedad
        ii_valor                  DECIMAL(10,4) DEFAULT 0,  -- Índice de Incidencia
        ili_valor                 DECIMAL(10,4) DEFAULT 0,  -- Índice de Lesión Incapacitante
        created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(periodo)
      )
    `
    console.log('✅ Tabla indicadores_historicos')

    // ── 11. ÍNDICES para performance ──────────────────────
    await sql`CREATE INDEX IF NOT EXISTS idx_accidentes_fecha   ON accidentes(fecha_accidente)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accidentes_area    ON accidentes(area)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accidentes_estado  ON accidentes(estado)`
    await sql`CREATE INDEX IF NOT EXISTS idx_accidentes_tipo    ON accidentes(tipo_evento)`
    await sql`CREATE INDEX IF NOT EXISTS idx_causas_accidente   ON causas(accidente_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_acciones_accidente ON acciones_correctivas(accidente_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_acciones_estado    ON acciones_correctivas(estado)`
    console.log('✅ Índices creados')

    // ── 12. FUNCIÓN: actualizar updated_at automáticamente
    await sql`
      CREATE OR REPLACE FUNCTION actualizar_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `

    // Triggers para updated_at
    const tablasTrigger = ['usuarios','trabajadores','accidentes','acciones_correctivas','indicadores_historicos']
    for (const tabla of tablasTrigger) {
      await sql.unsafe(`
        DROP TRIGGER IF EXISTS trigger_updated_at_${tabla} ON ${tabla};
        CREATE TRIGGER trigger_updated_at_${tabla}
          BEFORE UPDATE ON ${tabla}
          FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
      `)
    }
    console.log('✅ Triggers de updated_at')

    // ── 13. USUARIO ADMIN por defecto ─────────────────────
    // Contraseña: Admin123! (cambiar inmediatamente en producción)
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash('Admin123!', 12)

    await sql`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Administrador', 'admin@empresa.com', ${passwordHash}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `
    console.log('✅ Usuario admin creado (email: admin@empresa.com | pass: Admin123!)')
    console.log('   ⚠️  CAMBIA LA CONTRASEÑA ANTES DE IR A PRODUCCIÓN\n')

    console.log('═══════════════════════════════════════════')
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('═══════════════════════════════════════════')
    console.log('Tablas creadas:')
    console.log('  • usuarios')
    console.log('  • trabajadores')
    console.log('  • accidentes')
    console.log('  • causas')
    console.log('  • acciones_correctivas')
    console.log('  • epp_registros')
    console.log('  • capacitaciones')
    console.log('  • testigos')
    console.log('  • indicadores_historicos')

  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

migrate()
