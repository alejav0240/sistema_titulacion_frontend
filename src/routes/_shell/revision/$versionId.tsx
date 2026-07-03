import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { CommentPopover } from '#/components/pdf/CommentPopover'
import { ObservationsPanel } from '#/components/pdf/ObservationsPanel'
import { RevisionBreakdown } from '#/components/projects/RevisionRow'
import { NuevaVersionModal } from '#/components/projects/NuevaVersionModal'
import { PdfViewer } from '#/components/pdf/PdfViewer'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { NotificationsDropdown } from '#/components/notifications/NotificationsDropdown'
import { initials } from '#/components/layout/Topbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { authStore } from '#/hooks/useAuthStore'
import { useAnnotations, useCreateAnnotation } from '#/hooks/useAnnotations'
import { useReviewVersion, useVersion, useVersions, versionPdfUrl } from '#/hooks/useVersions'
import { cn } from '#/lib/utils'
import type { Anotacion, RectNormalizado } from '#/types/annotation'

export const Route = createFileRoute('/_shell/revision/$versionId')({
  validateSearch: z.object({
    compare: z.coerce.number().optional(),
    panel: z.coerce.number().optional(),
  }),
  component: RevisionPage,
})

function RevisionPage() {
  const { versionId } = Route.useParams()
  const { compare, panel } = Route.useSearch()
  const navigate = useNavigate()
  const user = useStore(authStore, (s) => s.user)
  const soloObservaciones = Boolean(panel)

  const id = Number(versionId)
  const version = useVersion(id)
  const versions = useVersions(version.data?.proyecto)
  const annotations = useAnnotations(id)
  const compareAnnotations = useAnnotations(compare)
  const createAnnotation = useCreateAnnotation()
  const review = useReviewVersion()

  const [pageLeft, setPageLeft] = useState(1)
  const [pageRight, setPageRight] = useState(1)
  const [numPagesLeft, setNumPagesLeft] = useState(0)
  const [numPagesRight, setNumPagesRight] = useState(0)
  const [scale, setScale] = useState(1)
  const [drawMode, setDrawMode] = useState(false)
  const [draft, setDraft] = useState<RectNormalizado | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [subsanarTarget, setSubsanarTarget] = useState<number | null>(null)
  const [subsanarDraft, setSubsanarDraft] = useState<
    (RectNormalizado & { targetId: number }) | null
  >(null)
  const [pendingSubsanarId, setPendingSubsanarId] = useState<number | null>(null)
  const [nuevaVersionOpen, setNuevaVersionOpen] = useState(false)

  // Limpiar subsanarDraft si la anotación objetivo ya no está pendiente
  useEffect(() => {
    if (!subsanarDraft) return
    const ann = annotations.data?.find((a) => a.id === subsanarDraft.targetId)
    if (ann && ann.estado !== 'PENDIENTE') {
      setSubsanarDraft(null)
      setSubsanarTarget(null)
    }
  }, [annotations.data, subsanarDraft])

  const isRevisor = user?.rol !== 'ESTUDIANTE'
  const isOwner = user?.rol === 'ESTUDIANTE'
  const isMiembroRevision = (version.data?.revisiones ?? []).some(
    (r) => r.revisor_id === user?.id,
  )
  const puedeAprobar =
    ['DIRECTOR', 'DTC'].includes(user?.rol ?? '') || isMiembroRevision
  const compareVersion = versions.data?.find((v) => v.id === compare)

  // La corrección siempre se dibuja en la versión más nueva, nunca en el
  // documento donde se anotó la observación original.
  const maxNumeroVersion = Math.max(
    0,
    ...(versions.data ?? []).map((v) => v.numero_version),
  )
  const ultimaVersion = (versions.data ?? []).find(
    (v) => v.numero_version === maxNumeroVersion,
  )

  const iniciarSubsanacion = (annotationId: number) => {
    const actual = version.data?.numero_version ?? 0
    if (actual >= maxNumeroVersion) {
      // No existe todavía una versión más nueva: hay que subirla primero.
      setPendingSubsanarId(annotationId)
      setNuevaVersionOpen(true)
      return
    }
    if (ultimaVersion && compare !== ultimaVersion.id) {
      navigate({ to: '.', search: { compare: ultimaVersion.id }, replace: true })
    }
    setSubsanarTarget(annotationId)
    setSubsanarDraft(null)
    setDrawMode(true)
  }

  const handleSelect = (anotacion: Anotacion) => {
    setSelectedId(anotacion.id)
    if (anotacion.nota_observacion) setPageLeft(anotacion.nota_observacion.pagina)
  }

  const toggleCompare = () => {
    if (compare) {
      navigate({ to: '.', search: {}, replace: true })
      return
    }
    const otras = (versions.data ?? []).filter((v) => v.id !== id)
    if (otras.length > 0) {
      navigate({ to: '.', search: { compare: otras[0].id }, replace: true })
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Toolbar del visor */}
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface/70 px-container-margin backdrop-blur-md">
        <div className="flex items-center gap-lg">
          <button
            type="button"
            onClick={toggleCompare}
            disabled={(versions.data?.length ?? 0) < 2}
            className={cn(
              'flex items-center gap-sm rounded-lg px-md py-sm text-label-md transition-all',
              compare
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary-container text-on-primary hover:opacity-90',
              (versions.data?.length ?? 0) < 2 && 'opacity-50',
            )}
          >
            <MaterialIcon name="compare_arrows" size={20} />
            {compare ? 'Salir de comparación' : 'Comparar versiones'}
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => setNuevaVersionOpen(true)}
              className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm text-label-md font-bold text-[#fff] transition-all hover:brightness-110"
            >
              <MaterialIcon name="upload_file" size={18} />
              Subir versión
            </button>
          )}

          {puedeAprobar && version.data?.estado === 'EN REVISION' && (
            <div className="flex items-center gap-xs">
              <button
                type="button"
                onClick={() => review.mutate({ versionId: id, accion: 'APROBAR' })}
                disabled={review.isPending}
                className="rounded-lg bg-green-600 px-md py-sm text-label-sm font-bold uppercase text-[#fff] hover:bg-green-700 disabled:opacity-50"
              >
                Aprobar versión
              </button>
              <button
                type="button"
                onClick={() => review.mutate({ versionId: id, accion: 'OBSERVAR' })}
                disabled={review.isPending}
                className="rounded-lg border border-primary px-md py-sm text-label-sm font-bold uppercase text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                Marcar observada
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-label-md text-on-surface transition-all hover:bg-surface-container-high"
                >
                  <span>
                    Versión {version.data?.numero_version ?? '…'} (
                    {version.data?.estado === 'APROBADO'
                      ? 'Aprobada'
                      : version.data?.estado === 'OBSERVADO'
                        ? 'Observada'
                        : 'Actual'}
                    )
                  </span>
                  <MaterialIcon name="expand_more" size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(versions.data ?? []).map((v) => (
                  <DropdownMenuItem
                    key={v.id}
                    onClick={() =>
                      navigate({
                        to: '/revision/$versionId',
                        params: { versionId: String(v.id) },
                        search: {},
                      })
                    }
                  >
                    Versión {v.numero_version} — {v.estado.toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2, s + 0.15))}
              className="rounded-lg p-sm hover:bg-surface-container-low"
              aria-label="Acercar"
            >
              <MaterialIcon name="zoom_in" size={20} />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.15))}
              className="rounded-lg p-sm hover:bg-surface-container-low"
              aria-label="Alejar"
            >
              <MaterialIcon name="zoom_out" size={20} />
            </button>
          </div>
          <div className="h-6 w-px bg-outline-variant" />
          <NotificationsDropdown />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-surface-container-high text-[10px] font-bold text-primary">
            {initials(user?.nombre)}
          </div>
        </div>
      </header>

      {(version.data?.revisiones ?? []).length > 0 && (
        <div className="border-b border-outline-variant bg-surface-container-lowest px-container-margin py-sm">
          <RevisionBreakdown revisiones={version.data?.revisiones ?? []} />
        </div>
      )}

      {/* Área de contenido: panel observaciones + PDF */}
      <div className="flex flex-1 overflow-hidden">
        <ObservationsPanel
          annotations={annotations.data ?? []}
          isRevisor={isRevisor}
          isOwner={isOwner}
          currentUserId={user?.id ?? null}
          selectedId={selectedId}
          onSelect={handleSelect}
          onSubsanarDraw={iniciarSubsanacion}
          subsanarDraft={subsanarDraft}
          onSubsanarReset={() => {
            setSubsanarDraft(null)
            setSubsanarTarget(null)
            setPendingSubsanarId(null)
          }}
        />

        {soloObservaciones ? (
          <div className="flex flex-1 items-center justify-center bg-[#f1f1f1] p-lg text-body-sm text-outline">
            <button
              type="button"
              onClick={() => navigate({ to: '.', search: { ...(compare && { compare }) }, replace: true })}
              className="flex items-center gap-xs rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md text-primary hover:bg-surface-container-low"
            >
              <MaterialIcon name="visibility" size={18} />
              Ver el documento
            </button>
          </div>
        ) : (
        <section className="relative flex w-[65%] flex-1 flex-col overflow-hidden bg-[#f1f1f1] p-lg">
          <div
            className={cn(
              'relative flex flex-1 gap-lg overflow-hidden',
              compare && 'mb-sm',
            )}
          >
            {/* Panel principal */}
            <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-outline-variant bg-white/50">
              {compare && (
                <p className="border-b border-outline-variant px-md py-xs text-label-sm font-bold text-primary">
                  Versión {version.data?.numero_version} (Actual)
                </p>
              )}
              <PdfViewer
                fileUrl={versionPdfUrl(id)}
                pageNumber={pageLeft}
                scale={scale}
                annotations={annotations.data ?? []}
                selectedId={selectedId}
                onSelect={(annotationId) => setSelectedId(annotationId)}
                drawMode={drawMode && subsanarTarget === null}
                onDrawComplete={({ pagina, x, y, ancho, alto }) => {
                  setDraft({ pagina, x, y, ancho, alto })
                  setDrawMode(false)
                }}
                onLoaded={setNumPagesLeft}
              />
              <PageNav page={pageLeft} setPage={setPageLeft} numPages={numPagesLeft} />
              {/* Cancelar dibujo de observación nueva */}
              {drawMode && subsanarTarget === null && (
                <div className="absolute left-1/2 top-lg z-10 flex -translate-x-1/2 items-center gap-sm rounded-full border border-outline-variant bg-white/95 px-md py-sm shadow-md">
                  <span className="text-label-sm text-on-surface-variant">
                    Dibuja un rectángulo sobre el documento
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawMode(false)}
                    className="rounded-full bg-error-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-error-container hover:brightness-95"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              {/* FAB añadir observación */}
              {isRevisor && (
                <div className="absolute right-xl top-xl z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setSubsanarTarget(null)
                      setDrawMode(!drawMode)
                    }}
                    className={cn(
                      'group relative flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant shadow-lg transition-colors',
                      drawMode && subsanarTarget === null
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-white text-primary hover:bg-surface-container-low',
                    )}
                  >
                    <MaterialIcon name="chat_bubble_outline" />
                    <span className="pointer-events-none absolute right-full mr-sm whitespace-nowrap rounded bg-inverse-surface px-sm py-xs text-[10px] text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                      {drawMode
                        ? 'Dibuja un rectángulo sobre el documento'
                        : 'Añadir observación'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Panel de comparación */}
            {compare && (
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-outline-variant bg-white/50">
                <p className="border-b border-outline-variant px-md py-xs text-label-sm font-bold text-secondary">
                  Versión {compareVersion?.numero_version ?? '…'} (
                  {compareVersion?.estado.toLowerCase() ?? 'comparación'})
                </p>
                <PdfViewer
                  fileUrl={versionPdfUrl(compare)}
                  pageNumber={pageRight}
                  scale={scale}
                  annotations={compareAnnotations.data ?? []}
                  drawMode={drawMode && subsanarTarget !== null}
                  onDrawComplete={({ pagina, x, y, ancho, alto }) => {
                    if (subsanarTarget !== null) {
                      setSubsanarDraft({ targetId: subsanarTarget, pagina, x, y, ancho, alto })
                      setSubsanarTarget(null)
                      setDrawMode(false)
                    }
                  }}
                  onLoaded={setNumPagesRight}
                />
                <PageNav page={pageRight} setPage={setPageRight} numPages={numPagesRight} />
                {/* Cancelar dibujo de subsanación */}
                {drawMode && subsanarTarget !== null && (
                  <div className="absolute left-1/2 top-lg z-10 flex -translate-x-1/2 items-center gap-sm rounded-full border border-outline-variant bg-white/95 px-md py-sm shadow-md">
                    <span className="text-label-sm text-on-surface-variant">
                      Dibuja la corrección en esta versión
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawMode(false)
                        setSubsanarTarget(null)
                      }}
                      className="rounded-full bg-error-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-error-container hover:brightness-95"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Popover de comentario (estilo Figma) */}
          {draft && (
            <div className="absolute left-[55%] top-[30%] z-50">
              <CommentPopover
                position={{ left: 0, top: 0 }}
                pending={createAnnotation.isPending}
                onCancel={() => setDraft(null)}
                onSubmit={({ comentario, severidad, accion_a_realizar }) => {
                  createAnnotation.mutate(
                    { versionId: id, ...draft, comentario, severidad, accion_a_realizar },
                    { onSuccess: () => setDraft(null) },
                  )
                }}
              />
            </div>
          )}
        </section>
        )}
      </div>

      <NuevaVersionModal
        open={nuevaVersionOpen}
        onClose={() => {
          setNuevaVersionOpen(false)
          setPendingSubsanarId(null)
        }}
        projectId={version.data?.proyecto}
        nextVersion={maxNumeroVersion + 1}
        onCreated={(newVersionId) => {
          setNuevaVersionOpen(false)
          if (pendingSubsanarId !== null) {
            // Retoma la subsanación pendiente, ahora sobre la versión recién creada.
            navigate({ to: '.', search: { compare: newVersionId }, replace: true })
            setSubsanarTarget(pendingSubsanarId)
            setSubsanarDraft(null)
            setDrawMode(true)
            setPendingSubsanarId(null)
          } else {
            // Subida manual desde el botón "Subir versión": ir directo a verla.
            navigate({
              to: '/revision/$versionId',
              params: { versionId: String(newVersionId) },
              search: {},
            })
          }
        }}
      />
    </div>
  )
}

/** Controles de paginación por panel: prev/next + salto directo a página. */
function PageNav({
  page,
  setPage,
  numPages,
}: {
  page: number
  setPage: (updater: (p: number) => number) => void
  numPages: number
}) {
  const [goTo, setGoTo] = useState('')

  return (
    <div className="absolute bottom-sm left-1/2 z-10 flex -translate-x-1/2 items-center gap-sm rounded-full border border-outline-variant bg-white/90 px-md py-xs shadow-md backdrop-blur">
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page <= 1}
        className="rounded-full p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
        aria-label="Página anterior"
      >
        <MaterialIcon name="chevron_left" size={18} />
      </button>
      <span className="text-label-sm text-on-surface-variant">
        Página {page} de {numPages || '…'}
      </span>
      <button
        type="button"
        onClick={() => setPage((p) => Math.min(numPages || p, p + 1))}
        disabled={numPages > 0 && page >= numPages}
        className="rounded-full p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <MaterialIcon name="chevron_right" size={18} />
      </button>
      <form
        className="ml-xs flex items-center gap-xs border-l border-outline-variant pl-xs"
        onSubmit={(e) => {
          e.preventDefault()
          const n = Number(goTo)
          if (n >= 1 && (!numPages || n <= numPages)) setPage(() => n)
          setGoTo('')
        }}
      >
        <input
          type="number"
          min={1}
          max={numPages || undefined}
          value={goTo}
          onChange={(e) => setGoTo(e.target.value)}
          placeholder="Ir a…"
          className="w-14 rounded border border-outline-variant bg-transparent px-xs py-[2px] text-[11px] outline-none focus:border-primary"
        />
      </form>
    </div>
  )
}
