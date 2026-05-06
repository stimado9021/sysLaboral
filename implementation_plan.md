# Análisis de Mejora del Sistema SST

Este documento detalla los hallazgos del análisis del sistema de Seguridad y Salud en el Trabajo (SST) y propone una serie de mejoras estratégicas para elevar la calidad, escalabilidad y experiencia de usuario de la plataforma.

## 1. Arquitectura y Calidad de Código

### [A] Estandarización de Validaciones (Zod)
Actualmente, las rutas de la API realizan validaciones manuales. Se recomienda unificar esto usando **Zod** tanto en el frontend como en el backend.
- **Beneficio:** Reducción de errores de tipo y consistencia en la integridad de los datos.
- **Acción:** Crear esquemas de validación compartidos en `/lib/validations/`.

### [B] Migración a un ORM (Drizzle o Prisma)
El sistema usa `migrate.js` manuales. Implementar un ORM facilitaría la gestión de cambios en el esquema y proporcionaría autocompletado de tipos (Type Safety).
- **Beneficio:** Mayor velocidad de desarrollo y trazabilidad de cambios en la DB.

### [C] Optimización de Estado (React Query)
Aunque la dependencia está instalada, el sistema usa `useEffect` + `fetch` en el dashboard. 
- **Beneficio:** Caching automático, re-validación en foco y manejo simplificado de estados de carga/error.
- **Acción:** Refactorizar hooks de datos en `/hooks/queries/`.

---

## 2. Experiencia de Usuario (UI/UX)

### [A] Sistema de Notificaciones (Toasts)
No se observa un sistema global de feedback visual para acciones exitosas o fallidas (ej. "Reporte guardado con éxito").
- **Acción:** Integrar `sonner` o `react-hot-toast`.

### [B] Micro-Interacciones
El sistema ya tiene una estética "premium" oscura, pero puede mejorar con:
- **Framer Motion:** Para transiciones suaves entre pasos del formulario de accidente.
- **Skeleton Screens:** Mejorar la percepción de carga en el Dashboard (ya existe algo, pero se puede extender).

### [C] Gestión de Evidencias Progresiva
Permitir la carga de imágenes "drag & drop" y previsualización inmediata antes de subir.
- **Acción:** Mejorar el componente `EvidenciaUpload.tsx`.

---

## 3. Funcionalidades de Alto Valor

### [A] Modo Offline (PWA)
Los reportes de accidentes suelen ocurrir en áreas con conectividad limitada.
- **Propuesta:** Implementar capacidades de Progressive Web App para guardar reportes localmente y sincronizarlos al recuperar conexión.

### [B] Generador de Reportes PDF Avanzado
Mejorar la exportación actual para incluir gráficos y fotos de evidencias de forma profesional.
- **Acción:** Optimizar el uso de `jspdf` y `html2canvas`.

### [C] Alertas y Recordatorios
Sistema de notificaciones (email o push) para acciones correctivas que están por vencer.

---

## 4. Plan de Verificación Sugerido

1. **Pruebas de Carga:** Simular 50+ reportes simultáneos para validar la concurrencia en Neon DB.
2. **Auditoría Lighthouse:** Optimizar el LCP (Largest Contentful Paint) en móviles.
3. **User Testing:** Validar la usabilidad del flujo de "Nuevo Reporte" en dispositivos táctiles con guantes (botone más grandes).

---

## Preguntas para el Usuario

> [!IMPORTANT]
> 1. ¿Cuál de estos puntos es prioritario para el negocio en este momento (Rendimiento, UI/UX o Nuevas Funciones)?
> 2. ¿Deseas que procedamos con la refactorización a React Query en el Dashboard como primer paso técnico?
