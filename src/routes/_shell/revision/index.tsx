import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { ObservationMatrix } from '#/components/annotations/ObservationMatrix'
import { useVersions } from '#/hooks/useVersions'
import api from '#/lib/api'
import type { Anotacion } from '#/types/annotation'

export const Route = createFileRoute('/_shell/revision/')({
  validateSearch: z.object({
    proyecto: z.coerce.number(),
  }),
  component: RevisionIndexPage,
})

function RevisionIndexPage() {
  const { proyecto } = Route.useSearch()
  const navigate = useNavigate()

  const versions = useVersions(proyecto)
  const anotaciones = useQuery({
    queryKey: ['project-annotations', proyecto],
    enabled: !!proyecto,
    queryFn: async () => {
      const { data } = await api.get<Anotacion[]>(`/api/projects/${proyecto}/annotations/`)
      return data
    },
  })

  const byVersion = (anotaciones.data ?? []).reduce<Record<number, Anotacion[]>>((acc, a) => {
    ;(acc[a.version_numero] ??= []).push(a)
    return acc
  }, {})

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface/70 px-container-margin backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate({ to: -1 as never })}
          className="flex items-center gap-sm text-label-md text-outline hover:text-on-surface"
        >
          <MaterialIcon name="arrow_back" size={20} />
          Volver
        </button>
        <div className="flex items-center gap-sm">
          <span className="text-label-md text-outline">Seleccionar versión:</span>
          <select
            className="rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-label-md text-on-surface focus:border-primary"
            defaultValue=""
            onChange={(e) => {
              const vid = e.target.value
              if (vid) navigate({ to: '/revision/$versionId', params: { versionId: vid }, search: {} })
            }}
          >
            <option value="" disabled>— Seleccionar versión —</option>
            {(versions.data ?? []).map((v) => (
              <option key={v.id} value={String(v.id)}>
                Versión {v.numero_version} — {v.estado.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo — todas las observaciones agrupadas por versión,
            mismo estilo que el panel del visor por versión */}
        <aside className="thin-scrollbar flex w-[35%] min-w-[320px] flex-col overflow-y-auto border-r border-outline-variant bg-white/60 p-lg backdrop-blur-md">
          <h2 className="mb-md text-label-md uppercase tracking-wider text-secondary">
            Historial de observaciones
          </h2>
          {anotaciones.isLoading && (
            <p className="text-body-sm text-outline">Cargando…</p>
          )}
          {Object.entries(byVersion)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([vNum, obs]) => (
              <div key={vNum} className="mb-lg">
                <p className="mb-sm text-label-sm font-bold text-primary">
                  Versión {vNum}
                </p>
                <ObservationMatrix observaciones={obs} />
              </div>
            ))}
          {!anotaciones.isLoading && (anotaciones.data ?? []).length === 0 && (
            <p className="rounded-lg border border-dashed border-outline-variant p-lg text-center text-body-sm text-outline">
              Sin observaciones registradas.
            </p>
          )}
        </aside>

        {/* Centro — placeholder */}
        <div className="flex flex-1 items-center justify-center bg-[#f1f1f1] text-body-lg text-outline">
          <div className="flex flex-col items-center gap-md text-center">
            <MaterialIcon name="picture_as_pdf" size={48} className="text-outline/40" />
            <p>Selecciona una versión para ver el documento</p>
          </div>
        </div>
      </div>
    </div>
  )
}
