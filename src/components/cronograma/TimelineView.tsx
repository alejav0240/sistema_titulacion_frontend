import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useDeleteEvento } from '#/hooks/useSchedules'
import { formatDate } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import { TIPO_DOTS, gruposLabel, publicosLabel, tipoStyle } from './shared'
import type { EventoCronograma } from '#/types/dashboard'

export function TimelineView({
  eventos,
  currentUserId,
  isAdmin,
  onEdit,
}: {
  eventos: EventoCronograma[]
  currentUserId: number | null
  isAdmin: boolean
  onEdit: (evento: EventoCronograma) => void
}) {
  const deleteEvento = useDeleteEvento()
  const ordered = [...eventos].sort((a, b) => +new Date(a.fecha_inicio) - +new Date(b.fecha_inicio))

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="relative space-y-lg">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-outline-variant" />
        {ordered.map((evento) => {
          const estilo = tipoStyle(evento.tipo)
          const canEdit = isAdmin || evento.creado_por_id === currentUserId
          return (
            <div key={evento.id} className="relative flex gap-md">
              <span className={cn('z-10 mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white', TIPO_DOTS[evento.tipo] ?? 'bg-primary')} />
              <div className="flex flex-1 items-start justify-between gap-md">
                <div>
                  <div className="flex items-center gap-sm">
                    <p className="text-label-md font-bold text-on-surface">{evento.descripcion}</p>
                    <span className={cn('rounded px-xs py-[1px] text-[9px] font-bold uppercase tracking-wider', estilo.chip)}>
                      {estilo.label}
                    </span>
                  </div>
                  <p className="text-label-sm text-outline">
                    {formatDate(evento.fecha_inicio)}
                    {evento.fecha_fin !== evento.fecha_inicio && ` → ${formatDate(evento.fecha_fin)}`}{' '}
                    · {publicosLabel(evento)} · {gruposLabel(evento)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-xs">
                    <button
                      type="button"
                      onClick={() => onEdit(evento)}
                      title="Editar evento"
                      className="rounded p-xs text-outline transition-colors hover:text-primary"
                    >
                      <MaterialIcon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvento.mutate(evento.id)}
                      title="Eliminar evento"
                      className="rounded p-xs text-outline transition-colors hover:text-error"
                    >
                      <MaterialIcon name="delete" size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {ordered.length === 0 && (
          <p className="py-lg text-center text-body-sm text-outline">No hay eventos registrados.</p>
        )}
      </div>
    </div>
  )
}
