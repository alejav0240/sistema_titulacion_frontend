import { useEffect, useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  useAnnotationHistory,
  useApelarAnnotation,
  useAprobarAnnotation,
  useDeleteAnnotation,
  useReobservarAnnotation,
  useSubsanarAnnotation,
} from '#/hooks/useAnnotations'
import { timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { Anotacion, RectNormalizado } from '#/types/annotation'

const EVENTO_LABELS: Record<string, string> = {
  CREACION: 'Observación creada',
  SUBSANACION: 'Subsanada por el estudiante',
  APELACION: 'Apelada por el tutor',
  APROBACION: 'Corrección aprobada',
  REOBSERVACION: 'Observada de nuevo',
}

function SeverityBadge({ anotacion }: { anotacion: Anotacion }) {
  if (anotacion.estado === 'SUBSANADA') {
    return (
      <span className="rounded bg-[#FEF3C7] px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
        Subsanada
      </span>
    )
  }
  if (anotacion.estado === 'APELADA') {
    return (
      <span className="rounded bg-[#DBEAFE] px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider text-[#1E40AF]">
        Apelada
      </span>
    )
  }
  if (anotacion.estado === 'APROBADA') {
    return (
      <span className="rounded bg-green-600 px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider text-[#fff]">
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
  puedeApelar,
  currentUserId,
  selected,
  checked,
  onToggleCheck,
  onClick,
  onRequestDraw,
  subsanarDraft,
  onSubsanarReset,
}: {
  anotacion: Anotacion
  isRevisor: boolean
  isOwner: boolean
  puedeApelar?: boolean
  currentUserId?: number | null
  selected: boolean
  checked?: boolean
  onToggleCheck?: () => void
  onClick: () => void
  onRequestDraw?: () => void
  subsanarDraft?: RectNormalizado
  onSubsanarReset?: () => void
}) {
  const [feedback, setFeedback] = useState('')
  const [subsanando, setSubsanando] = useState(false)
  const [apelando, setApelando] = useState(false)
  const [comentario, setComentario] = useState('')
  const [textoApelacion, setTextoApelacion] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const aprobar = useAprobarAnnotation()
  const reobservar = useReobservarAnnotation()
  const subsanar = useSubsanarAnnotation()
  const apelar = useApelarAnnotation()
  const eliminar = useDeleteAnnotation()
  const historial = useAnnotationHistory(showHistory ? anotacion.id : undefined)

  const texto = anotacion.nota_observacion?.comentario ?? ''
  // Solo el autor de la observación puede aprobarla/reobservarla/eliminarla
  const isAutor = isRevisor && currentUserId != null && anotacion.autor === currentUserId
  const resoluble = anotacion.estado === 'SUBSANADA' || anotacion.estado === 'APELADA'

  // Auto-expandir historial cuando la anotación fue reobservada:
  // el estudiante necesita ver el motivo del revisor sin tener que buscarlo
  useEffect(() => {
    if (anotacion.accion_realizada && anotacion.estado === 'PENDIENTE') {
      setShowHistory(true)
    }
  }, [anotacion.id, anotacion.estado, anotacion.accion_realizada])

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer space-y-sm rounded-lg border bg-surface-container-lowest p-md shadow-sm transition-all',
        anotacion.estado === 'SUBSANADA'
          ? 'border-yellow-300 bg-yellow-50/50'
          : anotacion.estado === 'APELADA'
            ? 'border-blue-300 bg-blue-50/50'
            : 'border-outline-variant',
        selected && 'ring-2 ring-primary-container',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-sm">
          {isAutor && resoluble && onToggleCheck ? (
            <input
              type="checkbox"
              checked={checked ?? false}
              onChange={onToggleCheck}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-outline-variant accent-[#6b1d2f]"
              title="Seleccionar para aprobación masiva"
            />
          ) : (
            anotacion.estado === 'APROBADA' && (
              <MaterialIcon name="check_box" size={16} className="text-green-600" />
            )
          )}
          <span className="text-label-sm font-bold text-primary">
            {anotacion.codigo_display}
          </span>
          {anotacion.version_numero != null && (
            <span className="rounded bg-primary/10 px-xs py-[1px] text-[9px] font-bold text-primary">
              V{anotacion.version_numero}
            </span>
          )}
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
          {isAutor && anotacion.estado === 'PENDIENTE' && (
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

          {/* Acciones del autor sobre subsanadas/apeladas */}
          {isAutor && resoluble && (
            <div className="flex gap-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  aprobar.mutate({ id: anotacion.id, feedback })
                }}
                disabled={aprobar.isPending}
                className="rounded bg-green-600 px-sm py-1 text-[10px] font-bold uppercase text-[#fff] transition-colors hover:bg-green-700 disabled:opacity-50"
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

          {/* Acciones sobre pendientes: subsanar (estudiante) y apelar (tutor) */}
          {anotacion.estado === 'PENDIENTE' && !subsanando && !apelando && (
            <div className="flex gap-xs">
              {isOwner && (
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
              {puedeApelar && (
                <button
                  type="button"
                  title="Apelar la observación con un comentario, sin modificar el documento"
                  onClick={(e) => {
                    e.stopPropagation()
                    setApelando(true)
                  }}
                  className="rounded border border-primary px-sm py-1 text-[10px] font-bold uppercase text-primary transition-colors hover:bg-primary/5"
                >
                  Apelar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Corrección del estudiante — visible siempre que exista, no solo en SUBSANADA */}
        {anotacion.accion_realizada && (
          <p
            className={cn(
              'rounded px-sm py-xs text-label-sm',
              anotacion.estado === 'SUBSANADA'
                ? 'bg-yellow-100/60 text-yellow-900'
                : 'bg-surface-container text-on-surface-variant',
            )}
          >
            {anotacion.estado !== 'SUBSANADA' && (
              <span className="font-bold">Corrección anterior: </span>
            )}
            {anotacion.accion_realizada}
          </p>
        )}

        {isAutor && resoluble && (
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Añadir retroalimentación específica..."
            className="w-full rounded-md border border-outline-variant px-sm py-1.5 text-body-sm focus:border-primary focus:ring-primary"
          />
        )}

        {apelando && (
          <div className="flex flex-col gap-sm" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={textoApelacion}
              onChange={(e) => setTextoApelacion(e.target.value)}
              placeholder="Explica por qué consideras que la observación no aplica o ya está resuelta..."
              rows={2}
              className="w-full rounded-md border border-outline-variant px-sm py-1.5 text-body-sm focus:border-primary focus:ring-primary"
            />
            <div className="flex justify-end gap-xs">
              <button
                type="button"
                onClick={() => {
                  setApelando(false)
                  setTextoApelacion('')
                }}
                className="px-sm py-1 text-[10px] font-bold uppercase text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!textoApelacion.trim() || apelar.isPending}
                onClick={() =>
                  apelar.mutate(
                    { id: anotacion.id, texto: textoApelacion.trim() },
                    {
                      onSuccess: () => {
                        setApelando(false)
                        setTextoApelacion('')
                      },
                    },
                  )
                }
                className="rounded bg-primary px-sm py-1 text-[10px] font-bold uppercase text-[#fff] hover:brightness-110 disabled:opacity-50"
              >
                {apelar.isPending ? 'Enviando…' : 'Apelar'}
              </button>
            </div>
          </div>
        )}

        {subsanando && (
          <div
            className="flex flex-col gap-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Selector de área en la versión nueva del documento */}
            {subsanarDraft ? (
              <div className="flex items-center gap-sm">
                <span className="flex items-center gap-xs rounded-full bg-emerald-100 px-sm py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <MaterialIcon name="check_circle" size={12} />
                  Área marcada
                </span>
                <button
                  type="button"
                  onClick={onRequestDraw}
                  className="text-[10px] text-outline underline hover:text-primary"
                >
                  Redibujar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestDraw}
                className="flex items-center justify-center gap-xs rounded-lg border-2 border-dashed border-primary/40 py-sm text-label-sm text-primary transition-colors hover:border-primary hover:bg-primary/5"
              >
                <MaterialIcon name="draw" size={16} />
                Dibujar en la versión nueva
              </button>
            )}

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={!subsanarDraft}
              placeholder={
                subsanarDraft
                  ? 'Describe cómo corregiste esta observación...'
                  : 'Marca el área en la versión nueva primero'
              }
              rows={2}
              className="w-full rounded-md border border-outline-variant px-sm py-1.5 text-body-sm focus:border-primary focus:ring-primary disabled:bg-surface-container disabled:opacity-50"
            />
            <div className="flex justify-end gap-xs">
              <button
                type="button"
                onClick={() => {
                  setSubsanando(false)
                  setComentario('')
                  onSubsanarReset?.()
                }}
                className="px-sm py-1 text-[10px] font-bold uppercase text-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!comentario.trim() || !subsanarDraft || subsanar.isPending}
                onClick={() => {
                  if (!subsanarDraft) return
                  subsanar.mutate(
                    {
                      id: anotacion.id,
                      comentario: comentario.trim(),
                      rect: subsanarDraft,
                    },
                    {
                      onSuccess: () => {
                        setSubsanando(false)
                        setComentario('')
                        onSubsanarReset?.()
                      },
                    },
                  )
                }}
                className="rounded bg-primary px-sm py-1 text-[10px] font-bold uppercase text-[#fff] hover:brightness-110 disabled:opacity-50"
              >
                {subsanar.isPending ? 'Enviando…' : 'Confirmar subsanación'}
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
