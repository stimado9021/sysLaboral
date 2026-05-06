# Tareas — Mejoras SST System

## Fase 1: Filtros dinámicos en el Dashboard
- [/] Agregar filtros (año, área, tipo evento) al dashboard `page.tsx`
- [ ] Actualizar `api/indicadores/route.ts` para soportar filtro por área y tipo_evento
- [ ] Agregar selector de HHT y nº trabajadores en el dashboard (eliminar hardcode)

## Fase 2: Sistema de Evidencias (fotos/documentos)
- [ ] Crear script `scripts/add_evidencias.js` y ejecutar migración
- [ ] Crear API `app/api/evidencias/route.ts` (upload y listado)
- [ ] Crear componente `components/EvidenciaUpload.tsx`
- [ ] Integrar en la vista de detalle del reporte

## Fase 3: Reporte Consolidado Exportable
- [ ] Crear API `app/api/reportes/consolidado/route.ts` que genere datos para Excel
- [ ] Agregar botón "Exportar Excel" en el dashboard usando `xlsx`

## Fase 4: Configuración de HHT centralizada
- [ ] Actualizar tabla `configuracion` o crear tabla `parametros_empresa`
- [ ] Crear página de configuración de indicadores
