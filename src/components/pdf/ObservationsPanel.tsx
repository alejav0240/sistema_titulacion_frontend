import { useState } from 'react'
import { ObservationCard } from './ObservationCard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useAprobarMasivo } from '#/hooks/useAnnotations'
import { RevisionBreakdown } from '#/components/projects/RevisionRow'
import type { Anotacion, RectNormalizado } from '#/types/annotation'
import type { Version } from '#/types/project'

export function ObservationsPanel({
  annotations,
  isRevisor,
  isOwner,
  puedeApelar,
  currentUserId,
  selectedId,
  onSelect,
  onSubsanarDraw,
  subsanarDraft,
  onSubsanarReset,
  revisiones,
}: {
  annotations: Anotacion[]
  isRevisor: boolean
  isOwner: boolean
  puedeApelar?: boolean
  currentUserId?: number | null
  selectedId: number | null
  onSelect: (anotacion: Anotacion) => void
  onSubsanarDraw?: (id: number) => void
  subsanarDraft?: (RectNormalizado & { targetId: number }) | null
  onSubsanarReset?: () => void
  revisiones?: Version['revisiones']
}) {
  const pendientes = annotations.filter((a) => a.estado === 'PENDIENTE').length
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set())
  const aprobarMasivo = useAprobarMasivo()

  const toggle = (id: number) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

        {/* Aprobación masiva de subsanadas/apeladas propias */}
        {seleccionadas.size > 0 && (
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-primary-container p-sm shadow-md">
            <span className="text-label-sm font-bold text-[#fff]">
              {seleccionadas.size} seleccionada{seleccionadas.size !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              disabled={aprobarMasivo.isPending}
              onClick={() =>
                aprobarMasivo.mutate([...seleccionadas], {
                  onSuccess: () => setSeleccionadas(new Set()),
                })
              }
              className="flex items-center gap-xs rounded bg-[#fff] px-sm py-1 text-[10px] font-bold uppercase text-primary-container hover:bg-[#fff]/90 disabled:opacity-50"
            >
              <MaterialIcon name="done_all" size={14} />
              {aprobarMasivo.isPending ? 'Aprobando…' : 'Aprobar seleccionadas'}
            </button>
          </div>
        )}

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
            puedeApelar={puedeApelar}
            currentUserId={currentUserId}
            selected={selectedId === anotacion.id}
            checked={seleccionadas.has(anotacion.id)}
            onToggleCheck={() => toggle(anotacion.id)}
            onClick={() => onSelect(anotacion)}
            onRequestDraw={
              onSubsanarDraw ? () => onSubsanarDraw(anotacion.id) : undefined
            }
            subsanarDraft={
              subsanarDraft?.targetId === anotacion.id
                ? subsanarDraft
                : undefined
            }
            onSubsanarReset={onSubsanarReset}
          />
        ))}
      </div>

      {revisiones && revisiones.length > 0 && (
        <div className="mt-auto border-t border-outline-variant p-sm">
          <RevisionBreakdown revisiones={revisiones} />
        </div>
      )}
    </section>
  )
}
