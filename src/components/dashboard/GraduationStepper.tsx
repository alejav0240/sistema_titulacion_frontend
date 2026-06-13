import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { cn } from '#/lib/utils'
import { ETAPAS, ETAPA_LABELS } from '#/types/project'
import type { Etapa } from '#/types/project'

/** Stepper horizontal de 5 etapas del proceso de graduación. */
export function GraduationStepper({ etapa }: { etapa: Etapa }) {
  const currentIndex = ETAPAS.indexOf(etapa)

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
        Flujo de Proceso de Graduación
      </p>
      <div className="flex items-center">
        {ETAPAS.map((step, i) => {
          const done = i < currentIndex
          const current = i === currentIndex
          return (
            <div
              key={step}
              className={cn('flex items-center', i < ETAPAS.length - 1 && 'flex-1')}
            >
              <div className="flex flex-col items-center gap-xs">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                    done && 'border-primary-container bg-primary-container text-white',
                    current &&
                      'border-primary-container bg-white text-primary ring-4 ring-primary-container/20',
                    !done && !current && 'border-outline-variant bg-white text-outline',
                  )}
                >
                  {done ? (
                    <MaterialIcon name="check" size={18} />
                  ) : (
                    <span className="text-label-sm font-bold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-label-sm whitespace-nowrap',
                    current ? 'font-bold text-primary' : 'text-on-surface-variant',
                  )}
                >
                  {ETAPA_LABELS[step]}
                </span>
              </div>
              {i < ETAPAS.length - 1 && (
                <div
                  className={cn(
                    'mx-sm mb-5 h-[2px] flex-1',
                    i < currentIndex ? 'bg-primary-container' : 'bg-outline-variant',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
