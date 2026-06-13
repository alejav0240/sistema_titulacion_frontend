import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { GraduationStepper } from '#/components/dashboard/GraduationStepper'
import { DefensaPanel } from '#/components/projects/DefensaPanel'
import { StatusBadge } from '#/components/projects/StatusBadge'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { authStore } from '#/hooks/useAuthStore'
import { useProject } from '#/hooks/useProjects'
import { useVersions } from '#/hooks/useVersions'
import { formatDate, formatDateTime } from '#/lib/datetime'
import { ETAPA_LABELS } from '#/types/project'

export const Route = createFileRoute('/_shell/proyectos/$proyectoId')({
  component: ProyectoDetailPage,
})

function ProyectoDetailPage() {
  const { proyectoId } = Route.useParams()
  const id = Number(proyectoId)
  const navigate = useNavigate()
  const user = useStore(authStore, (s) => s.user)

  const proyecto = useProject(id)
  const versiones = useVersions(id)

  const data = proyecto.data
  const isAdmin = user?.rol === 'DIRECTOR' || user?.rol === 'DTC'
  const tieneVersionAprobada = (versiones.data ?? []).some(
    (v) => v.estado === 'APROBADO',
  )

  if (proyecto.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
    )
  }

  if (!data) {
    return (
      <div className="py-xl text-center">
        <p className="text-body-md text-on-surface-variant">
          No se encontró el proyecto o no tienes acceso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Encabezado */}
      <section className="flex items-start gap-md">
        <button
          type="button"
          onClick={() => navigate({ to: '/proyectos', search: {} })}
          className="mt-xs rounded-lg border border-outline-variant p-sm text-on-surface-variant transition-colors hover:text-primary"
          aria-label="Volver a proyectos"
        >
          <MaterialIcon name="arrow_back" size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-sm">
            <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-on-surface-variant">
              {data.codigo}
            </span>
            <StatusBadge estado={data.estado_revision} />
            <span className="rounded-full bg-primary-container/10 px-sm py-[2px] text-[10px] font-bold uppercase tracking-wider text-primary">
              {ETAPA_LABELS[data.etapa]}
            </span>
            {data.estado === 'CONCLUIDO' && (
              <span className="flex items-center gap-xs rounded-full bg-[#D1FAE5] px-sm py-[2px] text-[10px] font-bold uppercase tracking-wider text-[#065F46]">
                <MaterialIcon name="workspace_premium" size={12} />
                Concluido
              </span>
            )}
          </div>
          <h2 className="mt-xs text-headline-lg text-primary">{data.titulo}</h2>
          {data.descripcion && (
            <p className="mt-xs max-w-3xl text-body-md text-on-surface-variant">
              {data.descripcion}
            </p>
          )}
        </div>
      </section>

      <GraduationStepper etapa={data.etapa} />

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        {/* Historial de versiones */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg lg:col-span-2">
          <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
            <MaterialIcon name="history" size={20} className="text-primary" />
            Historial de versiones
          </h3>
          {versiones.isLoading ? (
            <p className="text-body-sm text-outline">Cargando…</p>
          ) : (versiones.data ?? []).length === 0 ? (
            <p className="py-lg text-center text-body-sm text-outline">
              Aún no hay versiones entregadas.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {(versiones.data ?? []).map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between gap-md py-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-sm">
                      <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-primary">
                        V{version.numero_version}
                      </span>
                      <p className="truncate text-label-md text-on-surface">
                        {version.nombre_archivo || `Versión ${version.numero_version}`}
                      </p>
                      <StatusBadge estado={version.estado} />
                    </div>
                    <p className="mt-xs text-label-sm text-outline">
                      Subida el {formatDate(version.created_at)}
                      {version.revisada_por_nombre && version.revisada_el && (
                        <>
                          {' · '}
                          Revisada por {version.revisada_por_nombre} el{' '}
                          {formatDateTime(version.revisada_el)}
                        </>
                      )}
                      {version.anotaciones_total > 0 && (
                        <>
                          {' · '}
                          {version.anotaciones_pendientes} de{' '}
                          {version.anotaciones_total} obs. pendientes
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: '/revision/$versionId',
                        params: { versionId: String(version.id) },
                        search: {},
                      })
                    }
                    title="Abrir en el visor"
                    className="shrink-0 rounded-lg p-sm text-primary transition-colors hover:bg-surface-container-low"
                  >
                    <MaterialIcon name="open_in_new" size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-lg">
          <DefensaPanel
            proyectoId={id}
            isAdmin={isAdmin}
            tieneVersionAprobada={tieneVersionAprobada}
          />

          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
              <MaterialIcon name="badge" size={20} className="text-primary" />
              Participantes
            </h3>
            <div className="space-y-md">
              <div className="flex items-center gap-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                  {initials(data.estudiante_nombre)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-label-md text-on-surface">
                    {data.estudiante_nombre}
                  </p>
                  <p className="truncate text-label-sm text-outline">
                    Estudiante · {data.estudiante_email}
                  </p>
                </div>
              </div>
              {data.tutor_nombre && (
                <div className="flex items-center gap-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary">
                    {initials(data.tutor_nombre)}
                  </span>
                  <div>
                    <p className="text-label-md text-on-surface">
                      {data.tutor_nombre}
                    </p>
                    <p className="text-label-sm text-outline">Tutor</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-md border-t border-outline-variant/60 pt-md text-label-sm text-outline">
              <p>Registrado el {formatDate(data.created_at)}</p>
              <p>Última actividad el {formatDate(data.updated_at)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
