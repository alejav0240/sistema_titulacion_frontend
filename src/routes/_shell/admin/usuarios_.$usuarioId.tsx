import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { RoleBadge } from '#/components/admin/ui/RoleBadge'
import { StatusBadge } from '#/components/projects/StatusBadge'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { useUser, useUpdateUser } from '#/hooks/useUsers'
import { useRelaciones } from '#/hooks/useRelaciones'
import api from '#/lib/api'
import { formatDate } from '#/lib/datetime'
import type { Proyecto, ProyectosResponse } from '#/types/project'

export const Route = createFileRoute('/_shell/admin/usuarios_/$usuarioId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <UserProfilePage />
    </AuthGuard>
  )
}

function UserProfilePage() {
  const { usuarioId } = Route.useParams()
  const navigate = useNavigate()
  const id = Number(usuarioId)
  const user = useUser(id)

  const esEstudiante = user.data?.rol === 'ESTUDIANTE'

  const relaciones = useRelaciones({ docente: esEstudiante ? undefined : id })

  const proyectos = useQuery({
    queryKey: ['projects', { perfil: id }],
    enabled: !!user.data && esEstudiante,
    queryFn: async () => {
      const { data } = await api.get<ProyectosResponse>('/api/projects/', {
        params: { search: user.data!.email, page_size: 10 },
      })
      return data.results
    },
  })

  // ponytail: hooks before early return (Rules of Hooks)
  const updateUser = useUpdateUser()

  if (user.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
    )
  }

  const data = user.data!
  const tutorias = (relaciones.data ?? []).filter(
    (r) => r.relacion === 'TUTOR' && r.is_active,
  )
  const tribunales = (relaciones.data ?? []).filter(
    (r) => r.relacion === 'TRIBUNAL' && r.is_active,
  )

  const esDocente = !esEstudiante && ['DOCENTE', 'TUTOR', 'TRIBUNAL'].includes(data.rol)

  return (
    <div className="space-y-lg">
      <button
        type="button"
        onClick={() => navigate({ to: '/admin/usuarios' })}
        className="flex items-center gap-xs text-label-md text-secondary hover:text-primary"
      >
        <MaterialIcon name="arrow_back" size={16} />
        Volver a Usuarios
      </button>

      {/* Cabecera de perfil */}
      <section className="flex flex-col items-start justify-between gap-lg rounded-xl border border-outline-variant bg-white p-lg md:flex-row md:items-center">
        <div className="flex items-center gap-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary">
            {initials(data.nombre)}
          </div>
          <div>
            <h2 className="text-headline-md text-on-surface">{data.nombre}</h2>
            <p className="text-body-sm text-on-surface-variant">{data.email}</p>
            <div className="mt-xs flex flex-wrap gap-xs">
              {(data.roles_efectivos?.length
                ? data.roles_efectivos
                : [data.rol]
              ).map((rol) => (
                <RoleBadge key={rol} rol={rol} />
              ))}
              {data.capacidades?.includes('TIEMPO_COMPLETO') && (
                <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold uppercase text-on-surface-variant">
                  Tiempo completo
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-md">
          <div className="rounded-xl bg-surface-container-low px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">
              {esEstudiante
                ? (proyectos.data?.length ?? 0)
                : tutorias.length}
            </p>
            <p className="text-label-sm text-outline">
              {esEstudiante ? 'Proyectos' : 'Tutorías'}
            </p>
          </div>
          {!esEstudiante && (
            <div className="rounded-xl bg-surface-container-low px-lg py-md text-center">
              <p className="text-headline-md font-bold text-primary">
                {tribunales.length}
              </p>
              <p className="text-label-sm text-outline">Tribunales</p>
            </div>
          )}
          <div className="rounded-xl bg-surface-container-low px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">
              {data.is_active ? 'Activo' : 'Inactivo'}
            </p>
            <p className="text-label-sm text-outline">
              Desde {formatDate(data.created_at)}
            </p>
          </div>
        </div>
      </section>

      {/* Panel de cupos (solo docentes, visible para DTC/Director) */}
      {esDocente && (
        <CuposPanel
          userId={id}
          cuposTutor={data.cupos_tutor ?? 0}
          cuposTribunal={data.cupos_tribunal ?? 0}
          tutoradosActivos={data.tutorados_activos ?? tutorias.length}
          tribunalesActivos={data.tribunales_activos ?? tribunales.length}
          onSave={(cupos_tutor, cupos_tribunal) =>
            updateUser.mutate(
              { id, cupos_tutor, cupos_tribunal },
              { onSuccess: () => { toast.success('Cupos actualizados.'); user.refetch() } },
            )
          }
          saving={updateUser.isPending}
        />
      )}

      {/* Contenido según rol — la asignación de tutores/tribunales
          se hace ahora desde el detalle de cada proyecto */}
      {esEstudiante ? (
        <div className="space-y-lg">
          <section className="rounded-xl border border-outline-variant bg-white p-lg">
            <h3 className="mb-md text-label-md font-bold text-on-surface">
              Proyectos del estudiante
            </h3>
            <div className="space-y-sm">
              {(proyectos.data ?? []).map((proyecto: Proyecto) => (
                <div
                  key={proyecto.id}
                  className="flex items-center justify-between rounded-lg border border-outline-variant p-md"
                >
                  <div className="min-w-0">
                    <p className="truncate text-label-md font-bold text-on-surface">
                      {proyecto.titulo}
                    </p>
                    <p className="text-label-sm text-outline">
                      {proyecto.codigo} · Tutor: {proyecto.tutor_nombre ?? '—'}
                    </p>
                  </div>
                  <StatusBadge estado={proyecto.estado_revision} />
                </div>
              ))}
              {(proyectos.data ?? []).length === 0 && (
                <p className="py-md text-center text-body-sm text-outline">
                  Sin proyectos registrados.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-lg lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <h3 className="mb-md text-label-md font-bold text-on-surface">
              Estudiantes en tutoría
            </h3>
            <div className="space-y-sm">
              {tutorias.map((relacion) => (
                <div
                  key={relacion.id}
                  className="flex items-center gap-sm rounded-lg border border-outline-variant p-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                    {initials(relacion.estudiante_nombre)}
                  </span>
                  <p className="text-label-md text-on-surface">
                    {relacion.estudiante_nombre}
                  </p>
                </div>
              ))}
              {tutorias.length === 0 && (
                <p className="py-md text-center text-body-sm text-outline">
                  Sin estudiantes asignados.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <h3 className="mb-md text-label-md font-bold text-on-surface">
              Tribunales asignados
            </h3>
            <div className="space-y-sm">
              {tribunales.map((relacion) => (
                <div
                  key={relacion.id}
                  className="flex items-center gap-sm rounded-lg border border-outline-variant p-sm"
                >
                  <MaterialIcon name="gavel" size={16} className="text-secondary" />
                  <p className="text-label-md text-on-surface">
                    {relacion.estudiante_nombre}
                  </p>
                </div>
              ))}
              {tribunales.length === 0 && (
                <p className="py-md text-center text-body-sm text-outline">
                  Sin tribunales asignados.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function CuposPanel({
  cuposTutor,
  cuposTribunal,
  tutoradosActivos,
  tribunalesActivos,
  onSave,
  saving,
}: {
  userId: number
  cuposTutor: number
  cuposTribunal: number
  tutoradosActivos: number
  tribunalesActivos: number
  onSave: (tutor: number, tribunal: number) => void
  saving: boolean
}) {
  const [tutor, setTutor] = useState(cuposTutor)
  const [tribunal, setTribunal] = useState(cuposTribunal)

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-lg">
      <h3 className="mb-md text-label-md font-bold text-on-surface">
        Cupos de asignación
      </h3>
      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="rounded-xl bg-surface-container-low p-md">
          <p className="text-label-sm text-outline">Cupos como Tutor</p>
          <p className="text-label-sm text-on-surface-variant">
            Activos: {tutoradosActivos} / {tutor === 0 ? '∞' : tutor}
          </p>
          <input
            type="number"
            min={0}
            value={tutor}
            onChange={(e) => setTutor(Number(e.target.value))}
            className="mt-sm h-10 w-full rounded-lg border border-outline-variant bg-white px-sm text-body-md outline-none focus:border-primary"
          />
          <p className="mt-xs text-[10px] text-outline">0 = sin límite</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-md">
          <p className="text-label-sm text-outline">Cupos como Tribunal</p>
          <p className="text-label-sm text-on-surface-variant">
            Activos: {tribunalesActivos} / {tribunal === 0 ? '∞' : tribunal}
          </p>
          <input
            type="number"
            min={0}
            value={tribunal}
            onChange={(e) => setTribunal(Number(e.target.value))}
            className="mt-sm h-10 w-full rounded-lg border border-outline-variant bg-white px-sm text-body-md outline-none focus:border-primary"
          />
          <p className="mt-xs text-[10px] text-outline">0 = sin límite</p>
        </div>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(tutor, tribunal)}
        className="mt-md flex items-center gap-sm rounded-lg bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
      >
        <MaterialIcon name="save" size={16} />
        {saving ? 'Guardando…' : 'Guardar cupos'}
      </button>
    </section>
  )
}
