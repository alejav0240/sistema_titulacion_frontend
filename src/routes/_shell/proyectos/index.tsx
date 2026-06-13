import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { ProjectsKanban } from '#/components/projects/ProjectsKanban'
import { StatusBadge } from '#/components/projects/StatusBadge'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { downloadProjectsExport, useProjects } from '#/hooks/useProjects'
import { formatDate } from '#/lib/datetime'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_shell/proyectos/')({
  validateSearch: z.object({
    view: z.enum(['tabla', 'kanban']).optional(),
    search: z.string().optional(),
  }),
  component: ProyectosPage,
})

const ESTADOS = ['', 'BORRADOR', 'EN REVISION', 'OBSERVADO', 'APROBADO'] as const

function ProyectosPage() {
  const { view = 'tabla', search: searchParam } = Route.useSearch()
  const navigate = useNavigate()
  const [search, setSearch] = useState(searchParam ?? '')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)

  // El buscador del Topbar navega con ?search=
  useEffect(() => {
    if (searchParam !== undefined) {
      setSearch(searchParam)
      setPage(1)
    }
  }, [searchParam])

  const isKanban = view === 'kanban'
  const projects = useProjects({
    search: search || undefined,
    estado: estado || undefined,
    page: isKanban ? 1 : page,
    page_size: isKanban ? 100 : 10,
  })

  const data = projects.data
  const total = data?.count ?? 0
  const desde = (page - 1) * 10 + 1
  const hasta = Math.min(page * 10, total)

  const setView = (v: 'tabla' | 'kanban') =>
    navigate({ to: '/proyectos', search: { view: v }, replace: true })

  return (
    <div className="space-y-lg">
      {/* Encabezado */}
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg text-primary">Gestión de Proyectos</h2>
          <p className="text-body-md text-on-surface-variant">
            Supervise y gestione el flujo de revisión académica institucional.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex rounded-lg border border-outline-variant bg-surface-container-low p-xs">
            {(
              [
                ['tabla', 'table_rows', 'Tabla'],
                ['kanban', 'view_kanban', 'Kanban'],
              ] as const
            ).map(([key, icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  'flex items-center gap-xs rounded-md px-md py-sm text-label-md transition-all',
                  view === key
                    ? 'bg-white font-bold text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary',
                )}
              >
                <MaterialIcon name={icon} size={18} />
                {label}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-xs rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md text-on-surface transition-all hover:bg-surface-container-low"
              >
                <MaterialIcon name="ios_share" size={18} />
                Exportar
                <MaterialIcon name="expand_more" size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadProjectsExport('xlsx')}>
                <MaterialIcon name="table_view" size={18} />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadProjectsExport('pdf')}>
                <MaterialIcon name="picture_as_pdf" size={18} />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Filtros */}
      <section className="flex flex-wrap items-center gap-sm">
        <div className="relative min-w-[260px] flex-1">
          <MaterialIcon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Filtrar por título, código o estudiante…"
            className="w-full rounded-lg border border-outline-variant bg-white py-sm pl-10 pr-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-outline-variant bg-white px-md py-sm text-body-sm outline-none focus:border-primary"
        >
          {ESTADOS.map((value) => (
            <option key={value} value={value}>
              {value === ''
                ? 'Estado: Todos'
                : value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </section>

      {/* Contenido */}
      {projects.isLoading ? (
        <p className="py-xl text-center text-body-sm text-outline">
          Cargando proyectos…
        </p>
      ) : isKanban ? (
        <ProjectsKanban proyectos={data?.results ?? []} />
      ) : (
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-left">
                {[
                  'Proyecto',
                  'Estudiante',
                  'Tutor',
                  'Estado',
                  'Última versión',
                  'Obs.',
                  'Acciones',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.results ?? []).map((proyecto) => (
                <tr
                  key={proyecto.id}
                  onClick={() =>
                    navigate({
                      to: '/proyectos/$proyectoId',
                      params: { proyectoId: String(proyecto.id) },
                    })
                  }
                  className="cursor-pointer border-b border-outline-variant/50 transition-colors last:border-none hover:bg-surface-container-low/50"
                >
                  <td className="max-w-[260px] px-md py-md">
                    <p className="truncate text-label-md font-bold text-on-surface">
                      {proyecto.titulo}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-outline">
                      {proyecto.codigo}
                    </p>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                        {initials(proyecto.estudiante_nombre)}
                      </span>
                      <span className="text-body-sm text-on-surface">
                        {proyecto.estudiante_nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-md py-md text-body-sm text-secondary">
                    {proyecto.tutor_nombre ?? '—'}
                  </td>
                  <td className="px-md py-md">
                    <StatusBadge estado={proyecto.estado_revision} />
                  </td>
                  <td className="px-md py-md text-body-sm text-on-surface-variant">
                    {proyecto.ultima_version
                      ? formatDate(proyecto.ultima_version.created_at)
                      : '—'}
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
                            params: {
                              versionId: String(proyecto.ultima_version.id),
                            },
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
              {(data?.results ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-xl text-center text-body-sm text-outline"
                  >
                    No se encontraron proyectos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Paginación */}
          <div className="flex items-center justify-between border-t border-outline-variant px-md py-sm">
            <p className="text-label-sm text-outline">
              Mostrando {total === 0 ? 0 : desde}–{hasta} de {total} proyectos
            </p>
            <div className="flex gap-xs">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-outline-variant p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
                aria-label="Página anterior"
              >
                <MaterialIcon name="chevron_left" size={18} />
              </button>
              <button
                type="button"
                disabled={hasta >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-outline-variant p-xs transition-colors hover:bg-surface-container-low disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <MaterialIcon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
