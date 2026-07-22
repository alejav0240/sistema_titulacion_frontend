import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { GraduationStepper } from '#/components/dashboard/GraduationStepper'
import { ESTADO_VERSION_STYLES } from '#/components/projects/StatusBadge'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { authStore } from '#/hooks/useAuthStore'
import { useStudentDashboard } from '#/hooks/useDashboard'
import { useCreateProject, useSeleccionarMatriz, useUpdateProject } from '#/hooks/useProjects'
import { useDeleteVersion } from '#/hooks/useVersions'
import { NuevaVersionModal } from '#/components/projects/NuevaVersionModal'
import { MatrizConsistenciaPanel } from '#/components/projects/MatrizConsistenciaPanel'
import { useFormularios } from '#/hooks/useFormularios'
import { SubirFormularioModal } from '#/components/projects/SubirFormularioModal'
import { TIPO_FORMULARIO_LABELS } from '#/types/formulario'
import type { Formulario, FormularioEntrega } from '#/types/formulario'
import { ObservationMatrix } from '#/components/annotations/ObservationMatrix'
import { useQuery } from '@tanstack/react-query'
import api from '#/lib/api'
import {
  formatDate,
  formatDateTime,
  formatDayMonth,
  timeAgo,
} from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { Anotacion } from '#/types/annotation'
import type { MatrizInput, Proyecto, Version } from '#/types/project'
import { ETAPA_LABELS, RESULTADO_DEFENSA_LABELS } from '#/types/project'

export const Route = createFileRoute('/_shell/student/')({
  validateSearch: z.object({ nueva: z.coerce.number().optional() }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['ESTUDIANTE']}>
      <StudentDashboard />
    </AuthGuard>
  )
}

const VERSION_BADGES = ESTADO_VERSION_STYLES

const VERSION_LABELS: Record<string, string> = {
  'EN REVISION': 'En revisión',
  OBSERVADO: 'Observada',
  APROBADO: 'Aprobada',
}

function StudentDashboard() {
  const { nueva } = Route.useSearch()
  const navigate = useNavigate()
  const user = useStore(authStore, (s) => s.user)
  const dashboard = useStudentDashboard()
  const [modalOpen, setModalOpen] = useState(Boolean(nueva))
  const [editOpen, setEditOpen] = useState(false)

  // Un click repetido al link del sidebar (siempre a /student?nueva=1) no
  // remonta este componente, así que el estado inicial del modal no basta:
  // hay que reabrirlo cada vez que cambie el parámetro.
  useEffect(() => {
    if (nueva) setModalOpen(true)
  }, [nueva])

  const data = dashboard.data
  const proyecto = data?.proyecto ?? null

  if (dashboard.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">
        Cargando tu panel…
      </p>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Hero + estado actual */}
      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-primary-container to-tertiary p-lg text-[#fff] lg:col-span-2">
          <span className="rounded-full bg-[#fff]/15 px-sm py-xs text-[10px] font-bold uppercase tracking-widest">
            Perfil Académico
          </span>
          <div className="mt-md flex items-end justify-between gap-lg">
            <div className="min-w-0">
              <h2 className="text-headline-md font-bold">{user?.nombre}</h2>
              <p className="text-body-sm text-[#fff]/70">{user?.email}</p>
              <div className="mt-md max-w-[28rem] rounded-lg bg-[#fff]/10 p-sm backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#fff]/60">
                  Título del Proyecto
                </p>
                <div className="flex items-center gap-sm">
                  <p className="truncate text-label-md font-bold">
                    {proyecto?.titulo || (proyecto ? 'Tema pendiente de aprobación' : 'Sin proyecto registrado')}
                  </p>
                  {proyecto && proyecto.estado_aprobacion === 'APROBADO' && proyecto.estado !== 'CONCLUIDO' && (
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      title="Editar descripción"
                      className="shrink-0 rounded p-xs text-[#fff]/70 transition-colors hover:bg-[#fff]/10 hover:text-[#fff]"
                    >
                      <MaterialIcon name="edit" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-md dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-center gap-sm">
              <MaterialIcon
                name="hourglass_top"
                className="text-amber-600 dark:text-amber-400"
                size={20}
              />
              <p className="text-label-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Estado Actual
              </p>
            </div>
            <p className="mt-xs text-label-md font-bold text-on-surface">
              {proyecto
                ? `${ETAPA_LABELS[proyecto.etapa]} — ${
                    proyecto.estado_revision === 'EN REVISION'
                      ? 'En revisión por tutor'
                      : proyecto.estado_revision === 'OBSERVADO'
                        ? 'Con observaciones pendientes'
                        : proyecto.estado_revision === 'APROBADO'
                          ? 'Última versión aprobada'
                          : 'Sin entregas todavía'
                  }`
                : 'Registra tu proyecto para comenzar'}
            </p>
            {(data?.materias?.length ?? 0) > 0 && (
              <p className="mt-xs text-label-sm text-on-surface-variant">
                Materia: {data?.materias.join(', ')}
              </p>
            )}
            {data?.tutor && (
              <p className="mt-xs text-label-sm text-on-surface-variant">
                Tutor: {data.tutor}
              </p>
            )}
          </div>

          <div className="flex-1 rounded-xl border border-outline-variant bg-white p-md">
            <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
              Próximas Fechas
            </p>
            <div className="space-y-sm">
              {(data?.proximos_eventos ?? []).slice(0, 2).map((evento) => (
                <div key={evento.id} className="flex items-start gap-sm">
                  <div
                    className={cn(
                      'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      evento.tipo === 'ENTREGA'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container text-secondary',
                    )}
                  >
                    <MaterialIcon
                      name={evento.tipo === 'ENTREGA' ? 'flag' : 'event'}
                      size={16}
                    />
                  </div>
                  <div className="min-w-0">
                    {evento.tipo === 'ENTREGA' && (
                      <span className="rounded bg-error-container px-xs text-[9px] font-bold uppercase text-on-error-container">
                        Hito Crítico
                      </span>
                    )}
                    <p className="truncate text-label-md font-bold text-on-surface">
                      {evento.descripcion}
                    </p>
                    <p className="text-label-sm text-outline">
                      {formatDayMonth(evento.fecha_inicio)}
                    </p>
                  </div>
                </div>
              ))}
              {(data?.proximos_eventos ?? []).length === 0 && (
                <p className="text-body-sm text-outline">
                  Sin fechas próximas.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {proyecto?.defensa && <DefensaStudentCard proyecto={proyecto} />}

      {proyecto ? (
        proyecto.estado === 'CONCLUIDO' ? (
          <>
            <GraduationStepper etapa={proyecto.etapa} />
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-lg dark:border-emerald-900 dark:bg-emerald-900/20">
              <p className="flex items-center gap-sm text-label-md font-bold text-emerald-800 dark:text-emerald-300">
                <MaterialIcon name="workspace_premium" size={20} />
                Proyecto concluido — modo solo lectura
              </p>
              <p className="mt-xs text-body-sm text-emerald-700 dark:text-emerald-400">
                Tu proyecto de grado ya fue concluido. Puedes revisar tu historial, pero
                ya no se aceptan nuevas entregas ni correcciones.
              </p>
            </div>
            <section className="grid grid-cols-1 gap-lg lg:grid-cols-2">
              <VersionsTimeline versiones={data?.versiones ?? []} />
              <VersionsHistory versiones={data?.versiones ?? []} />
            </section>
          </>
        ) : proyecto.estado_aprobacion !== 'APROBADO' ? (
          <PropuestaEnRevisionCard proyecto={proyecto} />
        ) : (
          <>
            <GraduationStepper etapa={proyecto.etapa} />
            <TemaAlternativoBanner proyecto={proyecto} />

            <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
              <VersionsTimeline versiones={data?.versiones ?? []} />
              <TutorObservations observaciones={data?.observaciones ?? []} />
              <VersionsHistory versiones={data?.versiones ?? []} />
            </section>

            <ObservationMatrixSection proyectoId={proyecto.id} />
            <MisFormulariosSection proyectoId={proyecto.id} />
          </>
        )
      ) : (
        <RegisterProjectCard />
      )}

      {/* Actividad reciente (log de auditoría filtrado al estudiante) */}
      {(data?.actividad ?? []).length > 0 && (
        <section className="rounded-xl border border-outline-variant bg-white p-lg">
          <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
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
                  <p className="text-label-sm text-outline">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAB Nueva Entrega */}
      {proyecto && proyecto.estado_aprobacion === 'APROBADO' && proyecto.estado !== 'CONCLUIDO' && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Nueva Entrega"
          className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <MaterialIcon name="add" size={28} />
        </button>
      )}

      <NuevaVersionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          if (nueva) navigate({ to: '/student', search: {}, replace: true })
        }}
        projectId={proyecto?.id}
        nextVersion={(data?.versiones?.[0]?.numero_version ?? 0) + 1}
      />

      {proyecto && (
        <EditProjectModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          proyecto={proyecto}
        />
      )}
    </div>
  )
}

function DefensaStudentCard({ proyecto }: { proyecto: Proyecto }) {
  const defensa = proyecto.defensa
  if (!defensa) return null
  const realizada = defensa.estado === 'REALIZADA'
  return (
    <section
      className={cn(
        'flex flex-col justify-between gap-md rounded-xl border p-lg md:flex-row md:items-center',
        realizada
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-outline-variant bg-white',
      )}
    >
      <div className="flex items-center gap-md">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            realizada
              ? 'bg-emerald-500 text-[#fff]'
              : 'bg-primary-container text-on-primary',
          )}
        >
          <MaterialIcon
            name={realizada ? 'workspace_premium' : 'gavel'}
            size={24}
          />
        </div>
        <div>
          <p className="text-label-sm font-bold uppercase tracking-widest text-outline">
            {realizada ? 'Resultado de tu defensa' : 'Defensa programada'}
          </p>
          {realizada ? (
            <p className="text-label-md font-bold text-on-surface">
              {RESULTADO_DEFENSA_LABELS[defensa.resultado] ?? defensa.resultado}
              {defensa.calificacion && (
                <span className="ml-sm rounded-full bg-emerald-100 px-sm py-[2px] text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Nota: {defensa.calificacion}/100
                </span>
              )}
            </p>
          ) : (
            <p className="text-label-md font-bold text-on-surface">
              {formatDateTime(defensa.fecha_hora)}
              {defensa.lugar && (
                <span className="font-normal text-on-surface-variant">
                  {' '}
                  · {defensa.lugar}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
      {!realizada && defensa.estado === 'PROGRAMADA' && (
        <p className="text-label-sm text-on-surface-variant">
          Prepara tu presentación y llega 15 minutos antes.
        </p>
      )}
    </section>
  )
}

function EditProjectModal({
  open,
  onClose,
  proyecto,
}: {
  open: boolean
  onClose: () => void
  proyecto: Proyecto
}) {
  const updateProject = useUpdateProject()
  const [descripcion, setDescripcion] = useState(proyecto.descripcion ?? '')

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
        else setDescripcion(proyecto.descripcion ?? '')
      }}
    >
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Editar descripción
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            El título viene de la matriz de consistencia aprobada y no se puede editar.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            updateProject.mutate(
              { id: proyecto.id, descripcion: descripcion.trim() },
              {
                onSuccess: () => {
                  toast.success('Proyecto actualizado.')
                  onClose()
                },
              },
            )
          }}
        >
          <div className="flex flex-col gap-xs">
            <label
              className="text-label-md text-on-surface-variant"
              htmlFor="edit-desc"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="edit-desc"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <button
            type="submit"
            disabled={updateProject.isPending}
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="save" size={20} />
            {updateProject.isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VersionsTimeline({ versiones }: { versiones: Version[] }) {
  const ordered = [...versiones].sort(
    (a, b) => a.numero_version - b.numero_version,
  )
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
        Timeline de Entregas
      </p>
      <div className="relative space-y-lg">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-outline-variant" />
        {ordered.map((version) => (
          <div key={version.id} className="relative flex gap-md">
            <div
              className={cn(
                'z-10 mt-1 h-4 w-4 rounded-full border ring-4 ring-white',
                version.estado === 'APROBADO'
                  ? 'border-emerald-300 bg-emerald-500'
                  : version.estado === 'OBSERVADO'
                    ? 'border-amber-300 bg-amber-500'
                    : 'border-outline-variant bg-primary-container',
              )}
            />
            <div className="min-w-0">
              <p className="text-label-md font-bold text-primary">
                Versión {version.numero_version}
                <span className="ml-xs font-normal text-outline">
                  — {VERSION_LABELS[version.estado]}
                </span>
              </p>
              <p className="text-label-sm text-on-surface-variant">
                {version.anotaciones_total} observaciones ·{' '}
                {formatDate(version.created_at)}
              </p>
            </div>
          </div>
        ))}
        {ordered.length === 0 && (
          <p className="text-body-sm text-outline">
            Aún no subiste ninguna entrega. Usa el botón + para subir tu primer
            documento.
          </p>
        )}
      </div>
    </div>
  )
}

function TutorObservations({ observaciones }: { observaciones: Anotacion[] }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center justify-between">
        <p className="text-label-sm font-bold uppercase tracking-widest text-outline">
          Observaciones del Tutor
        </p>
        <span className="rounded-full bg-primary-container px-sm py-[2px] text-[10px] font-bold text-on-primary">
          {observaciones.filter((o) => o.estado === 'PENDIENTE').length}{' '}
          Pendientes
        </span>
      </div>
      <div className="space-y-md">
        {observaciones.slice(0, 4).map((obs) => (
          <div
            key={obs.id}
            className="space-y-sm border-b border-outline-variant pb-md last:border-none last:pb-0"
          >
            <span
              className={cn(
                'rounded px-xs py-[2px] text-[9px] font-bold uppercase tracking-wider',
                obs.severidad === 'CRITICO'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                obs.estado === 'SUBSANADA' &&
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
              )}
            >
              {obs.estado === 'SUBSANADA'
                ? 'Subsanada'
                : obs.severidad === 'CRITICO'
                  ? 'Alta prioridad'
                  : 'Media prioridad'}
            </span>
            <p className="text-body-sm text-on-surface">
              {obs.nota_observacion?.comentario}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-outline">
                {timeAgo(obs.creado_el)}
              </span>
              {obs.estado === 'PENDIENTE' && (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: '/revision/$versionId',
                      params: { versionId: String(obs.version) },
                      search: {},
                    })
                  }
                  className="rounded border border-primary px-sm py-[2px] text-[10px] font-bold uppercase text-primary hover:bg-primary/5"
                >
                  Subsanar
                </button>
              )}
            </div>
          </div>
        ))}
        {observaciones.length === 0 && (
          <p className="text-body-sm text-outline">
            No tienes observaciones pendientes. ¡Buen trabajo!
          </p>
        )}
      </div>
    </div>
  )
}

function VersionsHistory({ versiones }: { versiones: Version[] }) {
  const navigate = useNavigate()
  const deleteVersion = useDeleteVersion()
  const maxVersion = Math.max(0, ...versiones.map((v) => v.numero_version))

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
        Historial de Versiones
      </p>
      <div className="space-y-sm">
        {versiones.map((version) => {
          const eliminable =
            version.numero_version === maxVersion &&
            version.estado === 'EN REVISION' &&
            version.anotaciones_total === 0
          return (
            <div
              key={version.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate({
                  to: '/revision',
                  search: { proyecto: version.proyecto },
                })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate({
                    to: '/revision',
                    search: { proyecto: version.proyecto },
                  })
                }
              }}
              className="group w-full cursor-pointer rounded-lg border border-outline-variant p-sm text-left transition-all hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <p className="text-label-md font-bold text-on-surface group-hover:text-primary">
                  Versión {version.numero_version}{' '}
                  <span className="text-outline">
                    (V{version.numero_version})
                  </span>
                </p>
                <div className="flex items-center gap-xs">
                  <span
                    className={cn(
                      'rounded-full px-sm py-[2px] text-[9px] font-bold uppercase',
                      VERSION_BADGES[version.estado],
                    )}
                  >
                    {VERSION_LABELS[version.estado]}
                  </span>
                  {eliminable && (
                    <button
                      type="button"
                      disabled={deleteVersion.isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          window.confirm(
                            `¿Eliminar la versión V${version.numero_version}? Esta acción no se puede deshacer.`,
                          )
                        ) {
                          deleteVersion.mutate(version.id, {
                            onSuccess: () =>
                              toast.success('Versión eliminada.'),
                          })
                        }
                      }}
                      title="Eliminar esta versión (subida por error)"
                      className="rounded p-xs text-outline transition-colors hover:text-error disabled:opacity-50"
                    >
                      <MaterialIcon name="delete" size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-xs flex items-center gap-xs truncate text-label-sm text-outline">
                <MaterialIcon name="description" size={14} />
                {version.nombre_archivo ||
                  `version_${version.numero_version}.pdf`}
              </p>
            </div>
          )
        })}
        {versiones.length === 0 && (
          <p className="text-body-sm text-outline">Sin versiones todavía.</p>
        )}
      </div>
    </div>
  )
}

const MATRIZ_VACIA: MatrizInput = { tema: '', problematica: '', objetivos: '' }

function RegisterProjectCard() {
  const [matrices, setMatrices] = useState<MatrizInput[]>([
    { ...MATRIZ_VACIA },
    { ...MATRIZ_VACIA },
    { ...MATRIZ_VACIA },
  ])
  const createProject = useCreateProject()

  const setCampo = (i: number, campo: keyof MatrizInput, value: string) =>
    setMatrices((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [campo]: value } : m)),
    )

  const completo = matrices.every(
    (m) => m.tema.trim() && m.problematica.trim() && m.objetivos.trim(),
  )

  return (
    <section className="mx-auto max-w-[42rem] rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center gap-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-[#fff]">
          <MaterialIcon name="post_add" size={20} />
        </div>
        <div>
          <h3 className="text-headline-md text-primary">
            Registra las 3 matrices de consistencia
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Propón 3 combinaciones de Tema, Problemática y Objetivos. El docente y el
            Comité de Evaluación aprobarán una para iniciar tu perfil.
          </p>
        </div>
      </div>
      <form
        className="space-y-lg"
        onSubmit={(e) => {
          e.preventDefault()
          if (completo) createProject.mutate(matrices)
        }}
      >
        {matrices.map((m, i) => (
          <div key={i} className="space-y-xs rounded-xl border border-outline-variant p-md">
            <p className="text-label-sm font-bold uppercase tracking-wider text-outline">
              Matriz {i + 1}
            </p>
            <input
              value={m.tema}
              maxLength={255}
              onChange={(e) => setCampo(i, 'tema', e.target.value)}
              placeholder="Tema"
              className="h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <textarea
              value={m.problematica}
              onChange={(e) => setCampo(i, 'problematica', e.target.value)}
              placeholder="Problemática"
              rows={2}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <textarea
              value={m.objetivos}
              onChange={(e) => setCampo(i, 'objetivos', e.target.value)}
              placeholder="Objetivos"
              rows={2}
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
        ))}
        {createProject.isError && (
          <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
            No se pudo registrar el perfil. Intenta de nuevo.
          </p>
        )}
        <button
          type="submit"
          disabled={createProject.isPending || !completo}
          className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
        >
          <MaterialIcon name="add" size={20} />
          Registrar matrices
        </button>
      </form>
    </section>
  )
}


function TemaAlternativoBanner({ proyecto }: { proyecto: Proyecto }) {
  const seleccionar = useSeleccionarMatriz()
  const alternativas = proyecto.matrices.filter((m) => m.estado === 'APROBADA' && !m.elegida)
  if (alternativas.length === 0) return null
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-lg dark:border-emerald-900 dark:bg-emerald-900/20">
      <p className="text-label-md font-bold text-emerald-800 dark:text-emerald-300">
        Tienes otro tema aprobado por docente y comité. Puedes cambiarte si lo prefieres:
      </p>
      <div className="mt-sm flex flex-col gap-sm">
        {alternativas.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={seleccionar.isPending}
            onClick={() =>
              seleccionar.mutate(
                { proyectoId: proyecto.id, matrizId: m.id },
                { onSuccess: () => toast.success('Tema actualizado.') },
              )
            }
            className="rounded-lg border border-emerald-400 bg-white px-md py-sm text-left text-body-sm hover:bg-emerald-100 disabled:opacity-50 dark:bg-zinc-900 dark:hover:bg-emerald-900/40"
          >
            <span className="font-bold">Matriz {m.orden}:</span> {m.tema}
          </button>
        ))}
      </div>
    </div>
  )
}

function PropuestaEnRevisionCard({ proyecto }: { proyecto: Proyecto }) {
  if (proyecto.matrices.length === 0) {
    // Proyectos antiguos (previos a las matrices de consistencia) no tienen filas que mostrar.
    return null
  }
  return (
    <section className="space-y-md">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-lg dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-[#fff]">
            <MaterialIcon name="hourglass_top" size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-label-sm font-bold uppercase tracking-widest text-outline">
              Perfil en revisión
            </p>
            <p className="mt-xs text-label-md font-bold text-on-surface">
              Tus matrices de consistencia están siendo evaluadas por el docente y el
              Comité de Evaluación. Si una es rechazada, podrás corregirla y reenviarla.
            </p>
          </div>
        </div>
      </div>
      <MatrizConsistenciaPanel proyecto={proyecto} puedeEditar />
    </section>
  )
}

function ObservationMatrixSection({ proyectoId }: { proyectoId: number }) {
  const { data: observaciones = [], isLoading } = useQuery({
    queryKey: ['anotaciones', 'proyecto', proyectoId],
    queryFn: async () => {
      const { data } = await api.get<Anotacion[]>(
        `/api/projects/${proyectoId}/annotations/`,
      )
      return data
    },
  })

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-lg">
      <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
        Matriz de Observaciones
      </p>
      {isLoading ? (
        <p className="text-body-sm text-outline">Cargando…</p>
      ) : (
        <ObservationMatrix observaciones={observaciones} />
      )}
    </section>
  )
}

function MisFormulariosSection({ proyectoId }: { proyectoId: number }) {
  const user = useStore(authStore, (s) => s.user)
  const formularios = useFormularios(proyectoId)
  const [subiendo, setSubiendo] = useState<{ formulario: Formulario; entrega: FormularioEntrega } | null>(null)

  const lista = formularios.data ?? []
  if (!formularios.isLoading && lista.length === 0) return null

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-lg">
      <p className="mb-md text-label-sm font-bold uppercase tracking-widest text-outline">
        Mis Formularios
      </p>
      <div className="space-y-sm">
        {lista.map((formulario) => {
          const miEntrega = formulario.entregas.find((e) => e.usuario === user?.id)
          if (!miEntrega) return null
          return (
            <div key={formulario.id} className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant p-sm">
              <p className="text-label-md font-bold text-on-surface">
                {TIPO_FORMULARIO_LABELS[formulario.tipo]}
              </p>
              {miEntrega.estado === 'ENTREGADO' ? (
                <a
                  href={miEntrega.link_url}
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
                  onClick={() => setSubiendo({ formulario, entrega: miEntrega })}
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
          )
        })}
      </div>

      {subiendo && (
        <SubirFormularioModal
          formulario={subiendo.formulario}
          entrega={subiendo.entrega}
          onClose={() => setSubiendo(null)}
        />
      )}
    </section>
  )
}
