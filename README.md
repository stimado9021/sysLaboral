# Sistema SST — Seguridad y Salud en el Trabajo

Sistema de gestión de accidentes e incidentes laborales construido con **Next.js 14 + PostgreSQL (Vercel Postgres / Neon)**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Frontend | React 18 + Recharts |
| Backend | API Routes de Next.js (sin Express) |
| Base de datos | PostgreSQL via @neondatabase/serverless |
| Auth | NextAuth.js + JWT |
| Estilos | Tailwind CSS + CSS Variables |
| PDF | jsPDF + html2canvas |
| Despliegue | Vercel |

---

## Estructura del proyecto

```
sst-system/
├── app/
│   ├── api/                    ← Backend (corre en servidor)
│   │   ├── accidentes/         ← GET, POST, [id] GET/PUT
│   │   ├── indicadores/        ← KPIs y estadísticas
│   │   ├── causas/
│   │   ├── acciones/
│   │   └── auth/[...nextauth]/ ← Autenticación
│   ├── dashboard/              ← Dashboard principal
│   ├── accidente/nuevo/        ← Formulario 10 bloques
│   ├── reportes/               ← Lista de reportes
│   └── login/                  ← Página de login
├── components/
│   ├── Sidebar.tsx
│   ├── Providers.tsx
│   ├── forms/                  ← Componentes del formulario
│   └── charts/                 ← Gráficos reutilizables
├── lib/
│   ├── db.ts                   ← Conexión PostgreSQL
│   ├── auth.ts                 ← Configuración NextAuth
│   └── calcularKPIs.ts         ← Lógica de indicadores
├── types/
│   └── index.ts                ← Todos los tipos TypeScript
└── scripts/
    └── migrate.js              ← Crea todas las tablas
```

---

## Instalación y configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd sst-system
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
POSTGRES_URL="postgres://..."      # De Vercel Dashboard → Storage
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"
```

### 3. Crear las tablas en PostgreSQL

```bash
npm run db:migrate
```

Esto crea todas las tablas y un usuario admin por defecto:
- **Email:** admin@empresa.com  
- **Contraseña:** Admin123! ← **CAMBIAR ANTES DE PRODUCCIÓN**

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

---

## Despliegue en Vercel

### 1. Crear base de datos Vercel Postgres

1. Ir a [vercel.com](https://vercel.com) → tu proyecto → **Storage**
2. Crear una base de datos **Postgres** (usa Neon internamente)
3. Copiar las variables de entorno generadas

### 2. Desplegar

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Las variables de entorno se configuran en Vercel Dashboard
# Settings → Environment Variables
```

### 3. Migrar la base de datos en producción

```bash
# Con las variables de producción en tu .env.local
POSTGRES_URL="postgres://tu-url-de-produccion..." npm run db:migrate
```

---

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs, gráficos de tendencia, Pirámide de Bird |
| **Formulario** | 10 bloques de recolección de información |
| **Reportes** | Lista, búsqueda y filtros de accidentes |
| **Árbol de Causas** | Análisis 5 Porqués visual |
| **Ishikawa** | Diagrama 6M por accidente |
| **Matriz de Riesgo** | Evaluación probabilidad × severidad |
| **Acciones** | Seguimiento de planes correctivos |
| **Exportar PDF** | Genera reporte completo con gráficos |
| **Trabajadores** | Registro del personal |

---

## Índices de seguridad calculados

| Indicador | Fórmula |
|---|---|
| IF (Frecuencia) | (Accidentes × 1.000.000) / HHT |
| IG (Gravedad) | (Días perdidos × 1.000.000) / HHT |
| II (Incidencia) | (Accidentes / Trabajadores) × 1.000 |
| ILI (Lesión Inc.) | (IF × IG) / 1.000 |

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **admin** | Acceso total + configuración |
| **hsse** | Crear/editar reportes, dashboard completo |
| **supervisor** | Crear reportes de su área |
| **gerente** | Solo lectura + dashboard ejecutivo |
| **auditor** | Solo lectura + exportar |

---

## Próximos módulos a desarrollar

- [ ] Formulario completo (10 bloques) con validación
- [ ] Árbol de causas interactivo (drag & drop)
- [ ] Generador de PDF con todos los gráficos
- [ ] Envío de notificaciones por email (acciones vencidas)
- [ ] App móvil para campo (PWA)
