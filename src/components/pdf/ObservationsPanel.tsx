import { ObservationCard } from './ObservationCard'
import type { Anotacion } from '#/types/annotation'

export function ObservationsPanel({
  annotations,
  isRevisor,
  isOwner,
  selectedId,
  onSelect,
}: {
  annotations: Anotacion[]
  isRevisor: boolean
  isOwner: boolean
  selectedId: number | null
  onSelect: (anotacion: Anotacion) => void
}) {
  const pendientes = annotations.filter((a) => a.estado === 'PENDIENTE').length

  return (
    <section className="thin-scrollbar flex w-[35%] min-w-[320px] flex-col overflow-y-auto border-r border-outline-variant bg-white/60 p-lg backdrop-blur-md">
      <div className="flex flex-col gap-md">
        <div className="mb-md flex items-center justify-between">
          <h2 className="text-label-md uppercase tracking-wider text-secondary">
            Observaciones
          </h2>
          <span className="rounded-full bg-primary-container px-sm py-xs text-label-sm text-on-primary">
            {pendientes} Pendientes
          </span>
        </div>

        {annotations.length === 0 && (
          <p className="rounded-lg border border-dashed border-outline-variant p-lg text-center text-body-sm text-outline">
            Aún no hay observaciones en esta versión.
            {isRevisor && ' Usa el botón de comentario para añadir la primera.'}
          </p>
        )}

        {annotations.map((anotacion) => (
          <ObservationCard
            key={anotacion.id}
            anotacion={anotacion}
            isRevisor={isRevisor}
            isOwner={isOwner}
            selected={selectedId === anotacion.id}
            onClick={() => onSelect(anotacion)}
          />
        ))}
      </div>
    </section>
  )
}
