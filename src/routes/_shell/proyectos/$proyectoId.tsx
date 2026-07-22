import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { AsignacionesProyecto } from '#/components/projects/AsignacionesProyecto'
import { DefensaPanel } from '#/components/projects/DefensaPanel'
import { StatusBadge } from '#/components/projects/StatusBadge'
import { RevisionBreakdown } from '#/components/projects/RevisionRow'
import { MatrizConsistenciaPanel } from '#/components/projects/MatrizConsistenciaPanel'
import { downloadMatrizCorrecciones } from '#/hooks/useFormularios'
import { SubirFormularioModal } from '#/components/projects/SubirFormularioModal'
import { TIPO_FORMULARIO_LABELS } from '#/types/formulario'
import type { Formulario, FormularioEntrega } from '#/types/formulario'
import { ObservationMatrix } from '#/components/annotations/ObservationMatrix'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { authStore } from '#/hooks/useAuthStore'
import { useProject } from '#/hooks/useProjects'
import { useVersions } from '#/hooks/useVersions'
import api from '#/lib/api'
import { formatDate } from '#/lib/datetime'
import { ETAPA_LABELS } from '#/types/project'
import type { Anotacion } from '#/types/annotation'
import type { Proyecto } from '#/types/project'

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
  const isAdmin = ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'].includes(user?.rol ?? '')
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
          <h2 className="mt-xs text-headline-lg text-primary">
            {data.titulo || 'Tema pendiente de aprobación'}
          </h2>
          {data.descripcion && (
            <p className="mt-xs max-w-3xl text-body-md text-on-surface-variant">
              {data.descripcion}
            </p>
          )}
        </div>
      </section>

      {data.estado_aprobacion !== 'APROBADO' && data.matrices.length > 0 && (
        <MatrizConsistenciaPanel proyecto={data} rolDecisor={isAdmin ? 'COMITE' : undefined} />
      )}

      <ObservacionesSection proyectoId={id} />

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        {/* Historial de versiones */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg lg:col-span-2">
          <div className="mb-md flex items-center justify-between">
            <h3 className="flex items-center gap-sm text-label-md font-bold text-on-surface">
              <MaterialIcon name="history" size={20} className="text-primary" />
              Historial de versiones
            </h3>
            {user?.rol === 'ESTUDIANTE' && user.id === data.estudiante && data.estado !== 'CONCLUIDO' && (
              <button
                type="button"
                onClick={() => navigate({ to: '/student', search: { nueva: 1 } })}
                className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm text-label-sm font-bold text-[#fff] transition-all hover:brightness-110"
              >
                <MaterialIcon name="upload_file" size={16} />
                Subir versión
              </button>
            )}
          </div>
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
                      {version.anotaciones_total > 0 && (
                        <>
                          {' · '}
                          {version.anotaciones_pendientes} de{' '}
                          {version.anotaciones_total} obs. pendientes
                        </>
                      )}
                    </p>
                    {/* Revisión de tutor y tribunales */}
                    <div className="mt-sm">
                      <RevisionBreakdown revisiones={version.revisiones ?? []} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-xs">
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: '/revision/$versionId',
                          params: { versionId: String(version.id) },
                          search: { panel: 1 },
                        })
                      }
                      title="Ver solo observaciones"
                      className="rounded-lg p-sm text-outline transition-colors hover:bg-surface-container-low hover:text-primary"
                    >
                      <MaterialIcon name="forum" size={20} />
                    </button>
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
                      className="rounded-lg p-sm text-primary transition-colors hover:bg-surface-container-low"
                    >
                      <MaterialIcon name="open_in_new" size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-lg">
          {isAdmin && <AsignacionesProyecto estudianteId={data.estudiante} />}
          {isAdmin && <AsignacionesLog proyectoId={id} />}
          <MisFormularios proyecto={data} />

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
              {data.tribunal_nombres.map((nombre) => (
                <div key={nombre} className="flex items-center gap-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-primary">
                    {initials(nombre)}
                  </span>
                  <div>
                    <p className="text-label-md text-on-surface">{nombre}</p>
                    <p className="text-label-sm text-outline">Tribunal</p>
                  </div>
                </div>
              ))}
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

function ObservacionesSection({ proyectoId }: { proyectoId: number }) {
  const { data: observaciones = [], isLoading } = useQuery({
    queryKey: ['anotaciones', 'proyecto', proyectoId],
    queryFn: async () => {
      const { data } = await api.get<Anotacion[]>(`/api/projects/${proyectoId}/annotations/`)
      return data
    },
  })

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center justify-between">
        <h3 className="flex items-center gap-sm text-label-md font-bold text-on-surface">
          <MaterialIcon name="fact_check" size={20} className="text-primary" />
          Matriz de Observaciones
        </h3>
        <button
          type="button"
          onClick={() => downloadMatrizCorrecciones(proyectoId)}
          className="flex items-center gap-xs rounded-lg border border-outline-variant px-md py-xs text-label-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialIcon name="picture_as_pdf" size={16} />
          Exportar PDF
        </button>
      </div>
      {isLoading ? (
        <p className="text-body-sm text-outline">Cargando…</p>
      ) : (
        <ObservationMatrix observaciones={observaciones} />
      )}
    </section>
  )
}

interface LogEntry {
  id: number
  actor: string
  accion: string
  descripcion: string
  creado_el: string
}

function MisFormularios({ proyecto }: { proyecto: Proyecto }) {
  const user = useStore(authStore, (s) => s.user)
  const [subiendo, setSubiendo] = useState<{ formulario: Formulario; entrega: FormularioEntrega } | null>(null)

  const misEntregas = proyecto.formularios.flatMap((formulario) =>
    formulario.entregas
      .filter((e) => e.usuario === user?.id)
      .map((entrega) => ({ formulario, entrega })),
  )
  if (misEntregas.length === 0) return null

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
        <MaterialIcon name="assignment" size={20} className="text-primary" />
        Mis Formularios
      </h3>
      <div className="space-y-sm">
        {misEntregas.map(({ formulario, entrega }) => (
          <div key={entrega.id} className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant p-sm">
            <p className="text-label-md font-bold text-on-surface">
              {TIPO_FORMULARIO_LABELS[formulario.tipo]}
            </p>
            {entrega.estado === 'ENTREGADO' ? (
              <a
                href={entrega.link_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-xs text-label-sm font-bold text-primary hover:underline"
              >
                <MaterialIcon name="link" size={14} />
                Ver mi entrega
              </a>
            ) : formulario.activo ? (
              <button
                type="button"
                onClick={() => setSubiendo({ formulario, entrega })}
                className="rounded-lg bg-primary-container px-sm py-xs text-label-sm font-bold text-on-primary hover:brightness-110"
              >
                Subir link
              </button>
            ) : (
              <span className="rounded-full bg-error-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-error-container">
                No disponible
              </span>
            )}
          </div>
        ))}
      </div>

      {subiendo && (
        <SubirFormularioModal
          formulario={subiendo.formulario}
          entrega={subiendo.entrega}
          onClose={() => setSubiendo(null)}
        />
      )}
    </div>
  )
}

function AsignacionesLog({ proyectoId }: { proyectoId: number }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs', 'relacion', proyectoId],
    queryFn: async () => {
      const { data } = await api.get<LogEntry[]>('/api/logs/', {
        params: { entidad: 'relacion', proyecto: proyectoId },
      })
      return data
    },
  })

  if (!isLoading && logs.length === 0) return null

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
        <MaterialIcon name="history_edu" size={20} className="text-primary" />
        Historial de asignaciones
      </h3>
      {isLoading ? (
        <p className="text-body-sm text-outline">Cargando…</p>
      ) : (
        <div className="space-y-sm">
          {logs.map((log) => (
            <div key={log.id} className="border-b border-outline-variant/50 pb-sm last:border-none last:pb-0">
              <p className="text-body-sm text-on-surface">{log.descripcion}</p>
              <p className="text-label-sm text-outline">
                {log.actor} · {formatDate(log.creado_el)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
