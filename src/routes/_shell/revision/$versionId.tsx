import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { z } from 'zod'
import { CommentPopover } from '#/components/pdf/CommentPopover'
import { ObservationsPanel } from '#/components/pdf/ObservationsPanel'
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
  }),
  component: RevisionPage,
})

function RevisionPage() {
  const { versionId } = Route.useParams()
  const { compare } = Route.useSearch()
  const navigate = useNavigate()
  const user = useStore(authStore, (s) => s.user)

  const id = Number(versionId)
  const version = useVersion(id)
  const versions = useVersions(version.data?.proyecto)
  const annotations = useAnnotations(id)
  const compareAnnotations = useAnnotations(compare)
  const createAnnotation = useCreateAnnotation()
  const review = useReviewVersion()

  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [drawMode, setDrawMode] = useState(false)
  const [draft, setDraft] = useState<RectNormalizado | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const isRevisor = user?.rol !== 'ESTUDIANTE'
  const isOwner = user?.rol === 'ESTUDIANTE'
  const compareVersion = versions.data?.find((v) => v.id === compare)

  const handleSelect = (anotacion: Anotacion) => {
    setSelectedId(anotacion.id)
    if (anotacion.nota_observacion) setPage(anotacion.nota_observacion.pagina)
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

          {isRevisor && version.data?.estado === 'EN REVISION' && (
            <div className="flex items-center gap-xs">
              <button
                type="button"
                onClick={() => review.mutate({ versionId: id, accion: 'APROBAR' })}
                disabled={review.isPending}
                className="rounded-lg bg-green-600 px-md py-sm text-label-sm font-bold uppercase text-white hover:bg-green-700 disabled:opacity-50"
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

      {/* Área de contenido: panel observaciones + PDF */}
      <div className="flex flex-1 overflow-hidden">
        <ObservationsPanel
          annotations={annotations.data ?? []}
          isRevisor={isRevisor}
          isOwner={isOwner}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

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
                pageNumber={page}
                scale={scale}
                annotations={annotations.data ?? []}
                selectedId={selectedId}
                onSelect={(annotationId) => setSelectedId(annotationId)}
                drawMode={drawMode}
                onDrawComplete={({ pagina, x, y, ancho, alto }) => {
                  setDraft({ pagina, x, y, ancho, alto })
                  setDrawMode(false)
                }}
                onLoaded={setNumPages}
              />
              {/* FAB añadir observación */}
              {isRevisor && (
                <div className="absolute right-xl top-xl z-10">
                  <button
                    type="button"
                    onClick={() => setDrawMode(!drawMode)}
                    className={cn(
                      'group relative flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant shadow-lg transition-colors',
                      drawMode
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
                  pageNumber={page}
                  scale={scale}
                  annotations={compareAnnotations.data ?? []}
                />
              </div>
            )}
          </div>

          {/* Paginación flotante */}
          <div className="absolute bottom-lg left-1/2 z-10 flex -translate-x-1/2 items-center gap-md rounded-full border border-outline-variant bg-white/90 px-lg py-sm shadow-md backdrop-blur">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
              aria-label="Página anterior"
            >
              <MaterialIcon name="chevron_left" size={20} />
            </button>
            <span className="text-label-md text-on-surface-variant">
              Página {page} de {numPages || '…'}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(numPages || p, p + 1))}
              disabled={numPages > 0 && page >= numPages}
              className="rounded-full p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <MaterialIcon name="chevron_right" size={20} />
            </button>
          </div>

          {/* Popover de comentario (estilo Figma) */}
          {draft && (
            <div className="absolute left-[55%] top-[30%] z-50">
              <CommentPopover
                position={{ left: 0, top: 0 }}
                pending={createAnnotation.isPending}
                onCancel={() => setDraft(null)}
                onSubmit={({ comentario, severidad }) => {
                  createAnnotation.mutate(
                    { versionId: id, ...draft, comentario, severidad },
                    { onSuccess: () => setDraft(null) },
                  )
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
