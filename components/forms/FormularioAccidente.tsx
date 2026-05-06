'use client'
// components/forms/FormularioAccidente.tsx
// Componente orquestador del formulario de 10 bloques
// Maneja: estado global, stepper, navegación, auto-guardado en localStorage

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Stepper from './Stepper'
import { Bloque1, Bloque2, Bloque3 } from './Bloques123'
import { Bloque4, Bloque5, Bloque6 } from './Bloques456'
import { Bloque7, Bloque8, Bloque9, Bloque10 } from './Bloques78910'
import type { FormularioAccidenteData } from '@/types'

const PASOS = [
  { numero: 1,  titulo: 'Info. General',    icono: '📍' },
  { numero: 2,  titulo: 'Trabajador',        icono: '👷' },
  { numero: 3,  titulo: 'Descripción',       icono: '📝' },
  { numero: 4,  titulo: 'Lesiones',          icono: '🏥' },
  { numero: 5,  titulo: 'Causas',            icono: '🔍' },
  { numero: 6,  titulo: 'EPP / Capac.',      icono: '🦺' },
  { numero: 7,  titulo: 'Testigos',          icono: '👁' },
  { numero: 8,  titulo: 'Supervisor',        icono: '👔' },
  { numero: 9,  titulo: 'Plan de Acción',    icono: '✅' },
  { numero: 10, titulo: 'KPIs',              icono: '📊' },
]

const STORAGE_KEY = 'sst_form_draft'

function datosIniciales(): FormularioAccidenteData {
  return {
    bloque1: {
      tipo_evento: '', fecha_accidente: '', hora_accidente: '',
      area: '', ubicacion_especifica: '', turno: '',
      horas_trabajadas: 0, condiciones_climaticas: '',
    },
    bloque2: {
      trabajador_id: null, nombre: '', cedula: '', cargo: '',
      tipo_contrato: '', empresa_contratista: '',
      fecha_ingreso: '', antiguedad_cargo: '',
      tarea_habitual: true, en_induccion: false,
    },
    bloque3: {
      descripcion: '', forma_accidente: '', agente_causante: '',
      equipo_involucrado: '', tenia_procedimiento: false,
      conocia_procedimiento: false, tenia_analisis_riesgo: false,
      tenia_permiso_trabajo: false,
    },
    bloque4: {
      tipo_lesion: '', parte_cuerpo: '', lado_afectado: '', gravedad: '',
      dias_incapacidad: 0, requirio_hospitalizacion: false,
      requirio_cirugia: false, centro_medico: '', diagnostico: '',
      costo_dano_material: 0, horas_paro_produccion: 0,
    },
    bloque5: {
      actos_inseguros: [], condiciones_inseguras: [],
      porques: ['', '', ''], factores_6m: {},
    },
    bloque6: { epp: [], capacitaciones: [] },
    bloque7: { testigos: [], evidencias: [], documentos: [] },
    bloque8: {
      supervisor_nombre: '', supervisor_presente: false,
      realizo_inspeccion: false, hubo_accidentes_previos: false,
      acciones_inmediatas: '', se_aviso_arl: false,
      hora_aviso_arl: '', se_suspendio_actividad: false,
      se_notifico_gerencia: false,
    },
    bloque9: { acciones: [] },
    bloque10: { total_trabajadores: 0, horas_hombre_trabajadas: 0 },
  }
}

// Validación mínima por bloque (campos requeridos)
function validarBloque(num: number, data: FormularioAccidenteData): boolean {
  switch (num) {
    case 1:  return !!data.bloque1.tipo_evento && !!data.bloque1.fecha_accidente && !!data.bloque1.hora_accidente && !!data.bloque1.area
    case 2:  return !!data.bloque2.nombre && !!data.bloque2.cedula && !!data.bloque2.cargo && !!data.bloque2.tipo_contrato && !!data.bloque2.fecha_ingreso
    case 3:  return !!data.bloque3.descripcion && !!data.bloque3.forma_accidente && !!data.bloque3.agente_causante
    case 4:  return !!data.bloque4.tipo_lesion && !!data.bloque4.parte_cuerpo && !!data.bloque4.gravedad
    case 5:  return data.bloque5.porques.some(p => p.trim() !== '')
    case 8:  return !!data.bloque8.supervisor_nombre
    case 9:  return data.bloque9.acciones.length > 0 && !!data.bloque9.acciones[0]?.descripcion
    case 10: return data.bloque10.total_trabajadores > 0 && data.bloque10.horas_hombre_trabajadas > 0
    default: return true
  }
}

interface Props {
  onSubmit: (data: FormularioAccidenteData) => Promise<void>
  guardando: boolean
}

export default function FormularioAccidente({ onSubmit, guardando }: Props) {
  const [paso, setPaso]         = useState(1)
  const [data, setData]         = useState<FormularioAccidenteData>(datosIniciales)
  const [completados, setCompletados] = useState<number[]>([])

  // Cargar borrador guardado
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) {
        setData(JSON.parse(guardado))
      }
    } catch {}
  }, [])

  // Auto-guardar en localStorage cada vez que cambian los datos
  const autoGuardar = useCallback((nuevosDatos: FormularioAccidenteData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosDatos))
      toast.success('Borrador guardado localmente', { duration: 2000, id: 'auto-save' })
    } catch {}
  }, [])

  function actualizarBloque<K extends keyof FormularioAccidenteData>(
    bloque: K,
    valor: FormularioAccidenteData[K]
  ) {
    const nuevos = { ...data, [bloque]: valor }
    setData(nuevos)
    autoGuardar(nuevos)
  }

  function irAPaso(nuevoPaso: number) {
    // Marcar paso actual como completado si pasa la validación
    if (validarBloque(paso, data) && !completados.includes(paso)) {
      setCompletados(prev => [...prev, paso])
    }
    setPaso(nuevoPaso)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function siguiente() {
    if (paso < 10) irAPaso(paso + 1)
  }

  function anterior() {
    if (paso > 1) irAPaso(paso - 1)
  }

  async function handleEnviar() {
    // Validar todos los bloques obligatorios
    const obligatorios = [1, 2, 3, 4, 5, 8, 9, 10]
    const invalidos = obligatorios.filter(n => !validarBloque(n, data))
    if (invalidos.length > 0) {
      alert(`Por favor completa los bloques: ${invalidos.join(', ')}`)
      irAPaso(invalidos[0])
      return
    }
    await onSubmit(data)
    localStorage.removeItem(STORAGE_KEY)
  }

  function limpiarBorrador() {
    if (confirm('¿Deseas descartar el borrador y empezar de nuevo?')) {
      localStorage.removeItem(STORAGE_KEY)
      setData(datosIniciales())
      setCompletados([])
      setPaso(1)
      toast.info('Borrador eliminado')
    }
  }

  const pasoActual = PASOS.find(p => p.numero === paso)!
  const puedeAvanzar = validarBloque(paso, data)

  // Renderizar el bloque actual
  const renderizarBloque = () => {
    switch (paso) {
      case 1:  return <Bloque1  data={data.bloque1}  onChange={v => actualizarBloque('bloque1', v)} />
      case 2:  return <Bloque2  data={data.bloque2}  onChange={v => actualizarBloque('bloque2', v)} />
      case 3:  return <Bloque3  data={data.bloque3}  onChange={v => actualizarBloque('bloque3', v)} />
      case 4:  return <Bloque4  data={data.bloque4}  onChange={v => actualizarBloque('bloque4', v)} />
      case 5:  return <Bloque5  data={data.bloque5}  onChange={v => actualizarBloque('bloque5', v)} />
      case 6:  return <Bloque6  data={data.bloque6}  onChange={v => actualizarBloque('bloque6', v)} />
      case 7:  return <Bloque7  data={data.bloque7}  onChange={v => actualizarBloque('bloque7', v)} />
      case 8:  return <Bloque8  data={data.bloque8}  onChange={v => actualizarBloque('bloque8', v)} />
      case 9:  return <Bloque9  data={data.bloque9}  onChange={v => actualizarBloque('bloque9', v)} />
      case 10: return <Bloque10 data={data.bloque10} onChange={v => actualizarBloque('bloque10', v)} />
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start">
      {/* Stepper - Responsive (vertical en desktop, horizontal en móvil) */}
      <Stepper
        pasoActual={paso}
        pasos={PASOS}
        onIr={irAPaso}
        completados={completados}
      />

      {/* Contenido del formulario */}
      <div className="flex-1 min-w-0 w-full">

        {/* Header del bloque */}
        <div className="bg-[var(--panel)] panel-dark border-t-2 border-[var(--red)] border border-[var(--border)] p-4 md:p-5 mb-1 flex flex-wrap items-center gap-3">
          <div className="w-9 h-9 bg-[var(--red)] flex items-center justify-center text-base flex-shrink-0">
            {pasoActual.icono}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[11px] font-bold text-[var(--muted)] tracking-wider uppercase mb-0.5 opacity-80">Bloque {paso} de 10</div>
            <div className="text-lg md:text-xl font-bold">{pasoActual.titulo}</div>
          </div>

          {/* Progreso */}
          <div className="ml-auto text-right">
            <div className="font-mono text-[11px] text-[var(--muted)] mb-1.5">
              {Math.round((completados.length / 10) * 100)}% completado
            </div>
            <div className="w-[120px] h-0.5 bg-[var(--dim)] rounded-none">
              <div
                className="h-full bg-[var(--green)] transition-all duration-300"
                style={{ width: `${(completados.length / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Formulario del bloque - Animado */}
        <div className="bg-[var(--panel)] panel-dark border border-[var(--border)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-6 min-h-[300px] md:min-h-[400px]"
            >
              {renderizarBloque()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegación inferior */}
        <div className="bg-[var(--panel)] panel-dark border border-[var(--border)] p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={anterior}
            disabled={paso === 1}
            className="btn btn-secondary w-full md:w-auto"
            style={{ opacity: paso === 1 ? 0.3 : 1 }}
          >
            ← Anterior
          </button>

          <div className="flex gap-2 order-first md:order-none">
            {/* Indicadores de pasos */}
            {PASOS.map(p => (
              <div
                key={p.numero}
                onClick={() => irAPaso(p.numero)}
                className="w-2 h-2 cursor-pointer transition-colors duration-200"
                style={{
                  background: p.numero === paso
                    ? 'var(--red)'
                    : completados.includes(p.numero)
                    ? 'var(--green)'
                    : 'var(--dim)',
                }}
              />
            ))}
          </div>

          {paso < 10 ? (
            <button
              type="button"
              onClick={siguiente}
              disabled={!puedeAvanzar}
              className="btn btn-primary w-full md:w-auto"
              style={{ opacity: puedeAvanzar ? 1 : 0.4 }}
              title={!puedeAvanzar ? 'Completa los campos requeridos para avanzar' : ''}
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnviar}
              disabled={guardando}
              className="btn btn-primary w-full md:w-auto min-w-[160px] justify-center"
            >
              {guardando ? '⟳ Guardando...' : '✓ Enviar Reporte'}
            </button>
          )}
        </div>

        {/* Limpiar borrador */}
        <button
          type="button"
          onClick={limpiarBorrador}
          className="mt-2 w-full md:w-auto md:ml-auto px-3 py-1.5 bg-transparent border border-[var(--border)] text-[var(--muted)] font-mono text-[9px] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
        >
          ↺ Nuevo formulario
        </button>
      </div>
    </div>
  )
}
