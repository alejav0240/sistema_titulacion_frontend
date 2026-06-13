import { useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  useAnnotationHistory,
  useAprobarAnnotation,
  useDeleteAnnotation,
  useReobservarAnnotation,
  useSubsanarAnnotation,
} from '#/hooks/useAnnotations'
import { timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { Anotacion } from '#/types/annotation'

const EVENTO_LABELS: Record<string, string> = {
  CREACION: 'Observación creada',
  SUBSANACION: 'Subsanada por el estudiante',
  APROBACION: 'Corrección aprobada',
  REOBSERVACION: 'Observada de nuevo',
}

function SeverityBadge({ anotacion }: { anotacion: Anotacion }) {
  if (anotacion.estado === 'SUBSANADA') {
    return (
      <span className="rounded bg-green-100 px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider text-green-700">
        Subsanada
      </span>
    )
  }
  if (anotacion.estado === 'APROBADA') {
    return (
      <span className="rounded bg-green-600 px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider text-white">
        Aprobada
      </span>
    )
  }
  return anotacion.severidad === 'CRITICO' ? (
    <span className="rounded border-b-2 border-[#FFD700] bg-[rgba(255,222,0,0.3)] px-xs text-[10px]">
      Crítico
    </span>
  ) : (
    <span className="rounded border-b-2 border-[#22c55e] bg-[rgba(34,197,94,0.3)] px-xs text-[10px]">
      Sugerencia
    </span>
  )
}

export function ObservationCard({
  anotacion,
  isRevisor,
  isOwner,
  selected,
  onClick,
}: {
  anotacion: Anotacion
  isRevisor: boolean
  isOwner: boolean
  selected: boolean
  onClick: () => void
}) {
  const [feedback, setFeedback] = useState('')
  const [subsanando, setSubsanando] = useState(false)
  const [comentario, setComentario] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const aprobar = useAprobarAnnotation()
  const reobservar = useReobservarAnnotation()
  const subsanar = useSubsanarAnnotation()
  const eliminar = useDeleteAnnotation()
  const historial = useAnnotationHistory(showHistory ? anotacion.id : undefined)

  const texto = anotacion.nota_observacion?.comentario ?? ''

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer space-y-sm rounded-lg border bg-surface-container-lowest p-md shadow-sm transition-all',
        anotacion.estado === 'SUBSANADA'
          ? 'border-green-300 bg-green-50/50'
          : 'border-outline-variant',
        selected && 'ring-2 ring-primary-container',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-sm">
          {anotacion.estado !== 'PENDIENTE' && (
            <MaterialIcon
              name="check_box"
              size={16}
              className="text-green-600"
            />
          )}
          <span className="text-label-sm font-bold text-primary">
            {anotacion.codigo_display}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <button
            type="button"
            title="Ver historial"
            onClick={(e) => {
              e.stopPropagation()
              setShowHistory(!showHistory)
            }}
            className="text-outline hover:text-primary"
          >
            <MaterialIcon name="history" size={18} />
          </button>
          {isRevisor && anotacion.estado === 'PENDIENTE' && (
            <button
              type="button"
              title="Eliminar observación"
              onClick={(e) => {
                e.stopPropagation()
                eliminar.mutate(anotacion.id)
              }}
              className="text-outline hover:text-error"
            >
              <MaterialIcon name="delete" size={18} />
            </button>
          )}
        </div>
      </div>

      <p className="text-body-sm text-on-surface/80">{texto}</p>
      {anotacion.accion_a_realizar && (
        <p className="text-label-sm text-on-surface-variant">
          <span className="font-bold">Acción:</span> {anotacion.accion_a_realizar}
        </p>
      )}

      <div className="mt-sm flex w-full flex-col gap-sm">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <SeverityBadge anotacion={anotacion} />
            <span className="text-label-sm text-outline">
              {timeAgo(anotacion.creado_el)}
            </span>
          </div>

          {/* Acciones del revisor sobre subsanadas */}
          {isRevisor && anotacion.estado === 'SUBSANADA' && (
            <div className="flex gap-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  aprobar.mutate({ id: anotacion.id, feedback })
                }}
                disabled={aprobar.isPending}
                className="rounded bg-green-600 px-sm py-1 text-[10px] font-bold uppercase text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  reobservar.mutate({ id: anotacion.id, feedback })
                }}
                disabled={reobservar.isPending}
                className="rounded border border-primary px-sm py-1 text-[10px] font-bold uppercase text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                Observar de nuevo
              </button>
            </div>
          )}

          {/* Acción del estudiante sobre pendientes */}
          {isOwner && anotacion.estado === 'PENDIENTE' && !subsanando && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSubsanando(true)
              }}
              className="rounded bg-primary-container px-sm py-1 text-[10px] font-bold uppercase text-on-primary transition-all hover:opacity-90"
            >
              Subsanar
            </button>
          )}
        </div>

        {anotacion.estado === 'SUBSANADA' && anotacion.accion_realizada && (
          <p className="rounded bg-green-100/60 px-sm py-xs text-label-sm text-green-800">
            {anotacion.accion_realizada}
          </p>
        )}

        {isRevisor && anotacion.estado === 'SUBSANADA' && (
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Añadir retroalimentación específica..."
            className="w-full rounded-md border border-outline-variant px-sm py-1.5 text-body-sm focus:border-primary focus:ring-primary"
          />
        )}

        {subsanando && (
          <div
            className="flex flex-col gap-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Describe cómo corregiste esta observación..."
              rows={2}
              className="w-full rounded-md border border-outline-variant px-sm py-1.5 text-body-sm focus:border-primary focus:ring-primary"
            />
            <div className="flex justify-end gap-xs">
              <button
                type="button"
                onClick={() => setSubsanando(false)}
                className="px-sm py-1 text-[10px] font-bold uppercase text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!comentario.trim() || subsanar.isPending}
                onClick={() => {
                  subsanar.mutate(
                    { id: anotacion.id, comentario: comentario.trim() },
                    { onSuccess: () => setSubsanando(false) },
                  )
                }}
                className="rounded bg-green-600 px-sm py-1 text-[10px] font-bold uppercase text-white hover:bg-green-700 disabled:opacity-50"
              >
                Marcar subsanada
              </button>
            </div>
          </div>
        )}

        {showHistory && (
          <div
            className="space-y-xs border-t border-outline-variant pt-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {(historial.data ?? []).map((evento) => (
              <div key={evento.id} className="flex items-start gap-sm">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                <div>
                  <p className="text-label-sm font-bold text-on-surface">
                    {EVENTO_LABELS[evento.tipo] ?? evento.tipo}
                    <span className="ml-xs font-normal text-outline">
                      · {evento.autor_nombre} · {timeAgo(evento.created_at)}
                    </span>
                  </p>
                  {evento.texto && (
                    <p className="text-label-sm text-on-surface-variant">
                      {evento.texto}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {historial.isLoading && (
              <p className="text-label-sm text-outline">Cargando historial…</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
