import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MiniCalendar } from '#/components/dashboard/MiniCalendar'
import { StatusBadge } from '#/components/projects/StatusBadge'
import { ClientOnly } from '#/components/ui/ClientOnly'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { initials } from '#/components/layout/Topbar'
import { useTeacherDashboard } from '#/hooks/useDashboard'
import { useProjects, useAprobarPropuesta, useRechazarPropuesta } from '#/hooks/useProjects'
import { timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { Proyecto } from '#/types/project'

export const Route = createFileRoute('/_shell/docente/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL']}>
      <TeacherDashboard />
    </AuthGuard>
  )
}

type Filtro = 'todos' | 'tutor' | 'tribunal' | 'materia'

const FILTROS_BASE: Array<[Filtro, string]> = [
  ['todos', 'Todos'],
  ['tutor', 'Tutor'],
  ['tribunal', 'Tribunal'],
  ['materia', 'Docente materia'],
]

function TeacherDashboard() {
  const dashboard = useTeacherDashboard()
  const currentUser = useStore(authStore, (s) => s.user)
  const esDocenteMateria = currentUser?.capacidades?.includes('DOCENTE_MATERIA') ?? false
  const filtros = esDocenteMateria ? FILTROS_BASE : FILTROS_BASE.filter(([k]) => k !== 'materia')
  const [filtro, setFiltro] = useState<Filtro>('todos')

  useEffect(() => {
    if (filtro === 'materia' && !esDocenteMateria) setFiltro('todos')
  }, [esDocenteMateria, filtro])

  const data = dashboard.data

  if (dashboard.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">
        Cargando tu panel…
      </p>
    )
  }

  const show = (key: Filtro) => filtro === 'todos' || filtro === key

  return (
    <div className="space-y-lg">
      {/* Chips de filtro por rol */}
      <div className="flex flex-wrap items-center gap-sm">
        {filtros.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltro(key)}
            className={cn(
              'rounded-full px-md py-sm text-label-md transition-all',
              filtro === key
                ? 'bg-primary-container font-bold text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-lg xl:col-span-2">
          {show('tutor') && (
            <TutoriasCard proyectos={data?.tutorias ?? []} />
          )}
          {show('tribunal') && (
            <TribunalesCard proyectos={data?.tribunales ?? []} />
          )}
          {show('materia') && esDocenteMateria && <PropuestasPendientesCard />}
        </div>

        {/* Columna lateral */}
        <div className="space-y-lg">
          <MiniCalendar eventos={data?.proximos_eventos ?? []} />

          <div className="rounded-xl border border-outline-variant bg-white p-md">
            <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
              Revisiones por día
            </p>
            <ClientOnly
              fallback={<div className="h-32" />}
            >
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={data?.revisiones_por_dia ?? []}>
                  <XAxis
                    dataKey="dia"
                    tickFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString('es-BO', {
                        weekday: 'short',
                      })
                    }
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [String(value), 'Revisiones']}
                    labelFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString('es-BO')
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="#6b1d2f"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>

          <div className="rounded-xl border border-outline-variant bg-white p-md">
            <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
              Actividad reciente
            </p>
            <div className="relative space-y-md">
              <div className="absolute bottom-1 left-[5px] top-1 w-px bg-outline-variant" />
              {(data?.actividad ?? []).map((item, i) => (
                <div key={i} className="relative flex gap-sm">
                  <span className="z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-outline-variant bg-primary-container ring-2 ring-white" />
                  <div className="min-w-0">
                    <p className="text-body-sm text-on-surface">
                      <span className="font-bold">{item.autor}</span>{' '}
                      <span className="text-on-surface-variant">{item.proyecto}</span>
                    </p>
                    <p className="text-label-sm text-outline">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {(data?.actividad ?? []).length === 0 && (
                <p className="text-body-sm text-outline">Sin actividad reciente.</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function RolBadge({ label }: { label: string }) {
  return (
    <span className="rounded bg-surface-container px-sm py-[2px] text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
      Rol: {label}
    </span>
  )
}

function TutoriasCard({ proyectos }: { proyectos: Proyecto[] }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center justify-between">
        <h3 className="text-label-md font-bold text-on-surface">
          Proyectos que tutoreo
        </h3>
        <RolBadge label="Tutor" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant text-left">
            {['Estudiante', 'Título del Proyecto', 'Estado', 'Acción'].map(
              (header) => (
                <th
                  key={header}
                  className="pb-sm text-[10px] font-bold uppercase tracking-wider text-outline"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {proyectos.map((proyecto) => (
            <tr
              key={proyecto.id}
              className="border-b border-outline-variant/50 last:border-none"
            >
              <td className="py-sm">
                <div className="flex items-center gap-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                    {initials(proyecto.estudiante_nombre)}
                  </span>
                  <div>
                    <p className="text-label-md text-on-surface">
                      {proyecto.estudiante_nombre}
                    </p>
                    <p className="text-[10px] uppercase text-outline">
                      {proyecto.ultima_version
                        ? `V${proyecto.ultima_version.numero_version} ${
                            proyecto.ultima_version.estado === 'EN REVISION'
                              ? 'Enviado'
                              : proyecto.ultima_version.estado.toLowerCase()
                          }`
                        : 'Sin entregas'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="max-w-[220px] truncate py-sm pr-md text-body-sm text-on-surface-variant">
                {proyecto.titulo}
              </td>
              <td className="py-sm">
                <StatusBadge estado={proyecto.estado_revision} />
              </td>
              <td className="py-sm">
                <button
                  type="button"
                  disabled={!proyecto.ultima_version}
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
                  className="text-label-md font-bold text-primary hover:underline disabled:opacity-40"
                >
                  Revisar
                </button>
              </td>
            </tr>
          ))}
          {proyectos.length === 0 && (
            <tr>
              <td colSpan={4} className="py-lg text-center text-body-sm text-outline">
                No tienes estudiantes en tutoría.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function TribunalesCard({ proyectos }: { proyectos: Proyecto[] }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center justify-between">
        <h3 className="text-label-md font-bold text-on-surface">
          Tribunales asignados
        </h3>
        <RolBadge label="Tribunal" />
      </div>
      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        {proyectos.map((proyecto) => (
          <div
            key={proyecto.id}
            className="rounded-xl border-2 border-secondary-container p-md"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {proyecto.etapa === 'DEFENSA' ? 'Defensa de grado' : 'Pre-defensa'}
                </p>
                <p className="truncate text-label-md font-bold text-on-surface">
                  {proyecto.estudiante_nombre}
                </p>
              </div>
              <MaterialIcon name="gavel" size={18} className="text-secondary" />
            </div>
            <p className="mt-xs line-clamp-2 text-body-sm text-on-surface-variant">
              {proyecto.titulo}
            </p>
            <button
              type="button"
              disabled={!proyecto.ultima_version}
              onClick={() =>
                proyecto.ultima_version &&
                navigate({
                  to: '/revision/$versionId',
                  params: { versionId: String(proyecto.ultima_version.id) },
                  search: {},
                })
              }
              className="mt-md w-full rounded-lg border border-outline-variant py-sm text-label-md font-bold text-primary transition-all hover:bg-surface-container-low disabled:opacity-40"
            >
              Ver proyecto
            </button>
          </div>
        ))}
        {proyectos.length === 0 && (
          <p className="col-span-2 py-md text-center text-body-sm text-outline">
            No tienes tribunales asignados.
          </p>
        )}
      </div>
    </div>
  )
}

function PropuestasPendientesCard() {
  const { data, isLoading } = useProjects({ estado_aprobacion: 'PENDIENTE' })
  const aprobar = useAprobarPropuesta()
  const rechazar = useRechazarPropuesta()
  const [rechazoOpen, setRechazoOpen] = useState(false)
  const [rechazoProyecto, setRechazoProyecto] = useState<Proyecto | null>(null)
  const [motivo, setMotivo] = useState('')

  const propuestas = data?.results ?? []

  return (
    <>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-lg dark:border-amber-800 dark:bg-amber-950/30">
        <div className="mb-md flex items-center justify-between">
          <h3 className="text-label-md font-bold text-on-surface">
            Propuestas pendientes de aprobación
          </h3>
          <RolBadge label="Materia" />
        </div>
        {isLoading ? (
          <p className="text-body-sm text-outline">Cargando propuestas…</p>
        ) : (
          <div className="space-y-sm">
            {propuestas.map((proyecto) => (
              <div
                key={proyecto.id}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-sm dark:border-amber-800"
              >
                <div className="min-w-0">
                  <p className="text-label-md font-bold text-on-surface">
                    {proyecto.estudiante_nombre}
                  </p>
                  <p className="truncate text-body-sm text-on-surface-variant">
                    {proyecto.titulo}
                  </p>
                  <p className="text-label-sm text-outline">
                    {timeAgo(proyecto.created_at)}
                  </p>
                </div>
                <div className="ml-md flex shrink-0 gap-sm">
                  <button
                    type="button"
                    disabled={aprobar.isPending}
                    onClick={() =>
                      aprobar.mutate(proyecto.id, {
                        onSuccess: () => toast.success('Propuesta aprobada.'),
                      })
                    }
                    className="rounded-lg bg-[#10B981] px-md py-sm text-label-sm font-bold text-[#fff] transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRechazoProyecto(proyecto)
                      setMotivo('')
                      setRechazoOpen(true)
                    }}
                    className="rounded-lg border border-error px-md py-sm text-label-sm font-bold text-error transition-all hover:bg-error-container disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
            {propuestas.length === 0 && (
              <p className="py-md text-center text-body-sm text-outline">
                No hay propuestas pendientes de aprobación.
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog open={rechazoOpen} onOpenChange={(o) => !o && setRechazoOpen(false)}>
        <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle className="text-headline-md text-error">
              Rechazar propuesta
            </DialogTitle>
            <DialogDescription className="text-body-sm text-on-surface-variant">
              Indica el motivo para que el estudiante pueda corregir su propuesta.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-md"
            onSubmit={(e) => {
              e.preventDefault()
              if (!rechazoProyecto) return
              rechazar.mutate(
                { proyectoId: rechazoProyecto.id, motivo },
                {
                  onSuccess: () => {
                    toast.success('Propuesta rechazada.')
                    setRechazoOpen(false)
                  },
                },
              )
            }}
          >
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo del rechazo (opcional)"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setRechazoOpen(false)}
                className="flex-1 rounded-xl border border-outline-variant py-sm text-label-md font-bold text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={rechazar.isPending}
                className="flex-1 rounded-xl bg-error py-sm text-label-md font-bold text-on-error transition-all hover:brightness-110 disabled:opacity-50"
              >
                {rechazar.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
