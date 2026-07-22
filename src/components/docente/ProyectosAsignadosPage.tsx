import { useNavigate } from '@tanstack/react-router'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { ESTADO_VERSION_STYLES } from '#/components/projects/StatusBadge'
import { useProjects } from '#/hooks/useProjects'
import { cn } from '#/lib/utils'

/** Listado de proyectos donde el docente es tutor o tribunal. */
export function ProyectosAsignadosPage({
  como,
  titulo,
  descripcion,
}: {
  como: 'tutor' | 'tribunal'
  titulo: string
  descripcion: string
}) {
  const navigate = useNavigate()
  const projects = useProjects({ como, page_size: 100 })
  const proyectos = projects.data?.results ?? []

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-headline-lg text-primary">{titulo}</h2>
        <p className="text-body-md text-on-surface-variant">{descripcion}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {['Estudiante', 'Proyecto', 'Última versión', 'Obs. pendientes', 'Acciones'].map((h) => (
                <th key={h} className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proyectos.map((proyecto) => (
              <tr
                key={proyecto.id}
                onClick={() =>
                  navigate({
                    to: '/proyectos/$proyectoId',
                    params: { proyectoId: String(proyecto.id) },
                  })
                }
                className="cursor-pointer border-b border-outline-variant/50 transition-colors last:border-none hover:bg-primary/10"
              >
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                      {initials(proyecto.estudiante_nombre)}
                    </span>
                    <span className="text-body-sm text-on-surface">{proyecto.estudiante_nombre}</span>
                  </div>
                </td>
                <td className="max-w-[280px] px-md py-md">
                  <p className="truncate text-label-md font-bold text-on-surface">{proyecto.titulo || 'Tema pendiente'}</p>
                  <p className="text-[10px] uppercase tracking-wider text-outline">{proyecto.codigo}</p>
                </td>
                <td className="px-md py-md">
                  {proyecto.ultima_version ? (
                    <span
                      className={cn(
                        'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase',
                        ESTADO_VERSION_STYLES[proyecto.ultima_version.estado as keyof typeof ESTADO_VERSION_STYLES] ??
                          'bg-surface-container text-on-surface-variant',
                      )}
                    >
                      V{proyecto.ultima_version.numero_version} · {proyecto.ultima_version.estado.toLowerCase()}
                    </span>
                  ) : (
                    <span className="text-body-sm text-outline">Sin entregas</span>
                  )}
                </td>
                <td className="px-md py-md">
                  {proyecto.observaciones_pendientes > 0 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error-container text-[10px] font-bold text-on-error-container">
                      {proyecto.observaciones_pendientes}
                    </span>
                  ) : (
                    <span className="text-outline">—</span>
                  )}
                </td>
                <td className="px-md py-md">
                  <button
                    type="button"
                    disabled={!proyecto.ultima_version}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (proyecto.ultima_version) {
                        navigate({
                          to: '/revision/$versionId',
                          params: { versionId: String(proyecto.ultima_version.id) },
                          search: {},
                        })
                      }
                    }}
                    title="Abrir en el visor"
                    className="rounded-lg p-sm text-primary transition-colors hover:bg-surface-container-low disabled:opacity-30"
                  >
                    <MaterialIcon name="rate_review" size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {!projects.isLoading && proyectos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-xl text-center text-body-sm text-outline">
                  No tienes proyectos asignados en este rol.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
