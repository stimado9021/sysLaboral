'use client'
// components/forms/Stepper.tsx

interface StepperProps {
  pasoActual: number
  pasos: { numero: number; titulo: string; icono: string }[]
  onIr: (paso: number) => void
  completados: number[]
}

export default function Stepper({ pasoActual, pasos, onIr, completados }: StepperProps) {
  return (
    <>
      {/* Desktop: Stepper vertical fijo */}
      <div className="hidden md:flex flex-col gap-1.5 w-[72px] flex-shrink-0 sticky top-4 max-h-[calc(100vh-32px)] overflow-y-auto p-1">
        {pasos.map((paso) => {
          const activo     = paso.numero === pasoActual
          const completado = completados.includes(paso.numero)

          return (
              <button
                key={paso.numero}
                onClick={() => onIr(paso.numero)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-xl cursor-pointer
                  text-center transition-all duration-200 w-full border-none
                  ${activo
                    ? 'bg-[#fbbf24] shadow-md'
                    : 'bg-[var(--bg-secondary)] shadow-sm hover:bg-[var(--panel)]'
                  }
                `}
              >
              {/* Número/ícono */}
               <div className={`
                 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono
                 flex-shrink-0 transition-colors
                 ${activo
                   ? 'bg-black text-[#fbbf24]'
                   : completado
                     ? 'bg-[var(--success)] text-black'
                     : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)]'
                 }
               `}>
                {completado ? '✓' : paso.numero}
              </div>

              {/* Título */}
               <div className={`
                 text-[9px] leading-tight font-mono tracking-wider
                 ${activo ? 'text-black font-bold' : completado ? 'text-[var(--success)]' : 'text-white'}
               `}>
                  {paso.titulo}
                </div>
            </button>
          )
        })}
      </div>

      {/* Tablet/Móvil: Stepper horizontal con scroll */}
      <div className="md:hidden sticky top-[60px] z-50 bg-[var(--bg)] w-full overflow-x-auto border-b border-[var(--border)] py-2 px-2 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {pasos.map((paso) => {
            const activo     = paso.numero === pasoActual
            const completado = completados.includes(paso.numero)

            return (
              <button
                key={paso.numero}
                onClick={() => onIr(paso.numero)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-2.5 py-2 rounded-lg cursor-pointer
                  text-center transition-all duration-200 border-none min-w-[55px]
                  ${activo
                    ? 'bg-[#fbbf24] shadow-md'
                    : 'bg-[var(--bg-secondary)] shadow-sm'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono
                  ${activo
                    ? 'bg-black text-[#fbbf24]'
                    : completado
                      ? 'bg-[var(--success)] text-black'
                      : 'bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)]'
                  }
                `}>
                  {completado ? '✓' : paso.numero}
                </div>
                <div className={`
                  text-[7px] leading-tight font-mono tracking-wider
                  ${activo ? 'text-black font-bold' : 'text-[var(--text-secondary)]'}
                `}>
                  {paso.titulo}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
