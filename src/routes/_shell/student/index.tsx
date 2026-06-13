import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { ProgressGauge } from '#/components/dashboard/ProgressGauge'
import { GraduationStepper } from '#/components/dashboard/GraduationStepper'
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
import { useCreateProject, useUpdateProject } from '#/hooks/useProjects'
import { useCreateVersion, useDeleteVersion } from '#/hooks/useVersions'
import { formatDate, formatDateTime, formatDayMonth, timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { Anotacion } from '#/types/annotation'
import type { Proyecto, Version } from '#/types/project'
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

const VERSION_BADGES: Record<string, string> = {
  'EN REVISION': 'bg-secondary-container text-on-secondary-container',
  OBSERVADO: 'bg-[#FEF3C7] text-[#92400E]',
  APROBADO: 'bg-[#D1FAE5] text-[#065F46]',
}

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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-tertiary p-lg text-white lg:col-span-2">
          <span className="rounded-full bg-white/15 px-sm py-xs text-[10px] font-bold uppercase tracking-widest">
            Perfil Académico
          </span>
          <div className="mt-md flex items-end justify-between gap-lg">
            <div className="min-w-0">
              <h2 className="text-headline-md font-bold">{user?.nombre}</h2>
              <p className="text-body-sm text-white/70">{user?.email}</p>
              <div className="mt-md max-w-[28rem] rounded-lg bg-white/10 p-sm backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Título del Proyecto
                </p>
                <div className="flex items-center gap-sm">
                  <p className="truncate text-label-md font-bold">
                    {proyecto?.titulo ?? 'Sin proyecto registrado'}
                  </p>
                  {proyecto && (
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      title="Editar título y descripción"
                      className="shrink-0 rounded p-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <MaterialIcon name="edit" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <ProgressGauge value={data?.progreso ?? 0} />
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-md">
            <div className="flex items-center gap-sm">
              <MaterialIcon name="hourglass_top" className="text-[#B45309]" size={20} />
              <p className="text-label-sm font-bold uppercase tracking-wider text-[#B45309]">
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
                <p className="text-body-sm text-outline">Sin fechas próximas.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {proyecto?.defensa && <DefensaStudentCard proyecto={proyecto} />}

      {proyecto ? (
        <>
          <GraduationStepper etapa={proyecto.etapa} />

          <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
            <VersionsTimeline versiones={data?.versiones ?? []} />
            <TutorObservations observaciones={data?.observaciones ?? []} />
            <VersionsHistory versiones={data?.versiones ?? []} />
          </section>
        </>
      ) : (
        <RegisterProjectCard />
      )}

      {/* FAB Nueva Entrega */}
      {proyecto && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Nueva Entrega"
          className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <MaterialIcon name="add" size={28} />
        </button>
      )}

      <NewVersionModal
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
          ? 'border-green-200 bg-[#ECFDF5]'
          : 'border-outline-variant bg-white',
      )}
    >
      <div className="flex items-center gap-md">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            realizada
              ? 'bg-[#10B981] text-white'
              : 'bg-primary-container text-on-primary',
          )}
        >
          <MaterialIcon name={realizada ? 'workspace_premium' : 'gavel'} size={24} />
        </div>
        <div>
          <p className="text-label-sm font-bold uppercase tracking-widest text-outline">
            {realizada ? 'Resultado de tu defensa' : 'Defensa programada'}
          </p>
          {realizada ? (
            <p className="text-label-md font-bold text-on-surface">
              {RESULTADO_DEFENSA_LABELS[defensa.resultado] ?? defensa.resultado}
              {defensa.calificacion && (
                <span className="ml-sm rounded-full bg-[#D1FAE5] px-sm py-[2px] text-[10px] font-bold text-[#065F46]">
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
  const [titulo, setTitulo] = useState(proyecto.titulo)
  const [descripcion, setDescripcion] = useState(proyecto.descripcion ?? '')

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
        else {
          setTitulo(proyecto.titulo)
          setDescripcion(proyecto.descripcion ?? '')
        }
      }}
    >
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Editar proyecto
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Actualiza el título o la descripción de tu proyecto.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!titulo.trim()) return
            updateProject.mutate(
              {
                id: proyecto.id,
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
              },
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
            <label className="text-label-md text-on-surface-variant" htmlFor="edit-titulo">
              Título
            </label>
            <input
              id="edit-titulo"
              value={titulo}
              maxLength={255}
              onChange={(e) => setTitulo(e.target.value)}
              className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="edit-desc">
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
            disabled={updateProject.isPending || !titulo.trim()}
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
                  ? 'border-green-300 bg-[#10B981]'
                  : version.estado === 'OBSERVADO'
                    ? 'border-yellow-300 bg-[#F59E0B]'
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
          {observaciones.filter((o) => o.estado === 'PENDIENTE').length} Pendientes
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
                  : 'bg-[#FEF3C7] text-[#92400E]',
                obs.estado === 'SUBSANADA' && 'bg-green-100 text-green-700',
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
                  to: '/revision/$versionId',
                  params: { versionId: String(version.id) },
                  search: {},
                })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate({
                    to: '/revision/$versionId',
                    params: { versionId: String(version.id) },
                    search: {},
                  })
                }
              }}
              className="group w-full cursor-pointer rounded-lg border border-outline-variant p-sm text-left transition-all hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <p className="text-label-md font-bold text-on-surface group-hover:text-primary">
                  Versión {version.numero_version}{' '}
                  <span className="text-outline">(V{version.numero_version})</span>
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
                {version.nombre_archivo || `version_${version.numero_version}.pdf`}
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

function RegisterProjectCard() {
  const [titulo, setTitulo] = useState('')
  const createProject = useCreateProject()

  return (
    <section className="mx-auto max-w-[36rem] rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center gap-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-white">
          <MaterialIcon name="post_add" size={20} />
        </div>
        <div>
          <h3 className="text-headline-md text-primary">Registra tu proyecto</h3>
          <p className="text-body-sm text-on-surface-variant">
            El primer paso de tu proceso de titulación.
          </p>
        </div>
      </div>
      <form
        className="space-y-md"
        onSubmit={(e) => {
          e.preventDefault()
          if (titulo.trim()) createProject.mutate(titulo.trim())
        }}
      >
        <div className="flex flex-col gap-xs">
          <label className="text-label-md text-on-surface-variant" htmlFor="titulo">
            Título del proyecto
          </label>
          <input
            id="titulo"
            value={titulo}
            maxLength={255}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Optimización de procesos académicos"
            className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
          />
        </div>
        {createProject.isError && (
          <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
            No se pudo registrar el proyecto. Intenta de nuevo.
          </p>
        )}
        <button
          type="submit"
          disabled={createProject.isPending || !titulo.trim()}
          className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
        >
          <MaterialIcon name="add" size={20} />
          Registrar proyecto
        </button>
      </form>
    </section>
  )
}

function NewVersionModal({
  open,
  onClose,
  projectId,
  nextVersion,
}: {
  open: boolean
  onClose: () => void
  projectId?: number
  nextVersion: number
}) {
  const [url, setUrl] = useState('')
  const [nombre, setNombre] = useState('')
  const createVersion = useCreateVersion()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Nueva Entrega (V{nextVersion})
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Pega el link de Google Drive de tu documento PDF. El archivo debe
            estar compartido como «Cualquier persona con el enlace».
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!projectId || !url.trim()) return
            createVersion.mutate(
              {
                projectId,
                url_pdf: url.trim(),
                nombre_archivo: nombre.trim(),
              },
              {
                onSuccess: () => {
                  setUrl('')
                  setNombre('')
                  onClose()
                },
              },
            )
          }}
        >
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="drive-url">
              Link de Google Drive
            </label>
            <input
              id="drive-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
              className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="file-name">
              Nombre del archivo (opcional)
            </label>
            <input
              id="file-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`tesis_v${nextVersion}.pdf`}
              className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          {createVersion.isError && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              {(() => {
                const err = createVersion.error as {
                  response?: { data?: { url_pdf?: string[]; detail?: string } }
                }
                return (
                  err.response?.data?.url_pdf?.[0] ??
                  err.response?.data?.detail ??
                  'No se pudo registrar la entrega.'
                )
              })()}
            </p>
          )}
          <button
            type="submit"
            disabled={createVersion.isPending || !url.trim()}
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="upload_file" size={20} />
            {createVersion.isPending ? 'Registrando…' : 'Registrar entrega'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
