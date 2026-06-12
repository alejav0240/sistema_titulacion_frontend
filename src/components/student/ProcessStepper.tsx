import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const steps = ['Propuesta', 'Anteproyecto', 'Desarrollo', 'Revisión', 'Defensa']

export function ProcessStepper() {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#e2e2e2] rounded-xl p-6">
      <h4 className="text-xs font-bold text-[#455f87] uppercase tracking-widest mb-4">
        FLUJO DE PROCESO DE GRADUACIÓN
      </h4>
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#e8e8e8] -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 w-2/3 h-[2px] bg-[#6b1d2f] -translate-y-1/2 z-0 transition-all duration-1000" />

        {steps.map((label, i) => {
          const isCompleted = i < 2
          const isActive = i === 2

          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full shadow-md transition-all',
                  isCompleted
                    ? 'w-8 h-8 bg-[#6b1d2f] text-white'
                    : isActive
                      ? 'w-10 h-10 border-2 border-[#6b1d2f] bg-white ring-4 ring-[#6b1d2f]/10'
                      : 'w-8 h-8 bg-[#e8e8e8] text-[#877274]'
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : isActive ? (
                  <span className="w-3 h-3 bg-[#6b1d2f] rounded-full animate-pulse" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isActive || isCompleted ? 'text-[#6b1d2f]' : 'text-[#877274]'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
