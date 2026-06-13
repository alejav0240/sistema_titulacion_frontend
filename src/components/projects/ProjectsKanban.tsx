import { useNavigate } from '@tanstack/react-router'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { cn } from '#/lib/utils'
import type { EstadoRevision, Proyecto } from '#/types/project'

const COLUMNS: Array<{
  estado: EstadoRevision
  label: string
  dot: string
}> = [
  { estado: 'BORRADOR', label: 'Borrador', dot: 'bg-outline' },
  { estado: 'EN REVISION', label: 'En revisión', dot: 'bg-secondary' },
  { estado: 'OBSERVADO', label: 'Observado', dot: 'bg-[#F59E0B]' },
  { estado: 'APROBADO', label: 'Aprobado', dot: 'bg-[#10B981]' },
]

export function ProjectsKanban({ proyectos }: { proyectos: Proyecto[] }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((column) => {
        const items = proyectos.filter(
          (proyecto) => proyecto.estado_revision === column.estado,
        )
        return (
          <div
            key={column.estado}
            className="rounded-xl bg-surface-container-low p-sm"
          >
            <div className="mb-sm flex items-center gap-sm px-sm pt-sm">
              <span className={cn('h-2 w-2 rounded-full', column.dot)} />
              <p className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                {column.label}
              </p>
              <span className="ml-auto rounded-full bg-surface-container-high px-sm text-label-sm text-on-surface-variant">
                {items.length}
              </span>
            </div>
            <div className="space-y-sm">
              {items.map((proyecto) => (
                <button
                  key={proyecto.id}
                  type="button"
                  onClick={() =>
                    proyecto.ultima_version &&
                    navigate({
                      to: '/revision/$versionId',
                      params: {
                        versionId: String(proyecto.ultima_version.id),
                      },
                      search: {},
                    })
                  }
                  className="w-full rounded-lg border border-outline-variant bg-white p-md text-left shadow-sm transition-all hover:border-primary"
                >
                  <p className="line-clamp-2 text-label-md font-bold text-on-surface">
                    {proyecto.titulo}
                  </p>
                  <p className="mt-xs text-[10px] uppercase tracking-wider text-outline">
                    {proyecto.codigo}
                  </p>
                  <div className="mt-sm flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-[9px] font-bold text-on-secondary-container">
                        {initials(proyecto.estudiante_nombre)}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        {proyecto.estudiante_nombre.split(' ')[0]}
                      </span>
                    </div>
                    {proyecto.observaciones_pendientes > 0 && (
                      <span className="flex items-center gap-xs text-label-sm text-outline">
                        <MaterialIcon name="chat_bubble_outline" size={14} />
                        {proyecto.observaciones_pendientes}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <p className="px-sm pb-md pt-sm text-center text-label-sm text-outline">
                  Sin proyectos
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
