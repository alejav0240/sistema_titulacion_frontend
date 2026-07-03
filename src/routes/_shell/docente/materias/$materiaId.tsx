import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useMateria, useMateriaEstudiantes } from '#/hooks/useMaterias'
import { useAprobarPropuesta, useRechazarPropuesta } from '#/hooks/useProjects'
import { cn } from '#/lib/utils'
import type { Inscripcion } from '#/types/materia'

export const Route = createFileRoute('/_shell/docente/materias/$materiaId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL']}>
      <MateriaDocentePage />
    </AuthGuard>
  )
}

const ESTADO_STYLES: Record<string, string> = {
  APROBADO: 'bg-secondary-container text-on-secondary-container',
  PENDIENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  RECHAZADO: 'bg-error-container text-on-error-container',
}

function MateriaDocentePage() {
  const { materiaId } = Route.useParams()
  const navigate = useNavigate()
  const id = Number(materiaId)

  const materia = useMateria(id)
  const inscripciones = useMateriaEstudiantes(id)
  const aprobar = useAprobarPropuesta()
  const rechazar = useRechazarPropuesta()

  const [rechazoDe, setRechazoDe] = useState<Inscripcion | null>(null)
  const [motivo, setMotivo] = useState('')

  const data = materia.data
  const lista = inscripciones.data ?? []
  const conProyecto = lista.filter((i) => i.proyecto)
  const pendientes = conProyecto.filter((i) => i.proyecto?.estado_aprobacion === 'PENDIENTE')

  if (materia.isLoading) {
    return <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
  }

  return (
    <div className="space-y-lg">
      <section className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={() => navigate({ to: '/docente/materias' })}
            className="rounded-lg border border-outline-variant p-sm text-on-surface-variant transition-colors hover:text-primary"
            aria-label="Volver"
          >
            <MaterialIcon name="arrow_back" size={18} />
          </button>
          <div>
            <h2 className="text-headline-lg text-primary">{data?.nombre}</h2>
            <p className="text-body-md text-on-surface-variant">
              {data?.grupo} · {data?.semestre}° semestre
            </p>
          </div>
        </div>
        <div className="flex gap-md">
          <div className="rounded-xl border border-outline-variant bg-white px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">{lista.length}</p>
            <p className="text-label-sm text-outline">Estudiantes</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-white px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">{pendientes.length}</p>
            <p className="text-label-sm text-outline">Propuestas pendientes</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-white p-lg">
        <h3 className="mb-md text-label-md font-bold text-on-surface">
          Estudiantes y proyectos
        </h3>
        <div className="divide-y divide-outline-variant/50">
          {lista.map((inscripcion) => {
            const proyecto = inscripcion.proyecto
            return (
              <div key={inscripcion.id} className="flex items-center justify-between gap-md py-sm">
                <div className="flex min-w-0 items-center gap-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                    {initials(inscripcion.estudiante_nombre)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-label-md text-on-surface">{inscripcion.estudiante_nombre}</p>
                    <p className="truncate text-label-sm text-outline">
                      {proyecto ? proyecto.titulo : 'Sin propuesta de proyecto'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-sm">
                  {proyecto && (
                    <span
                      className={cn(
                        'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase',
                        ESTADO_STYLES[proyecto.estado_aprobacion],
                      )}
                    >
                      {proyecto.estado_aprobacion}
                    </span>
                  )}
                  {proyecto?.estado_aprobacion === 'PENDIENTE' && (
                    <>
                      <button
                        type="button"
                        disabled={aprobar.isPending}
                        onClick={() =>
                          aprobar.mutate(proyecto.id, {
                            onSuccess: () => {
                              toast.success('Propuesta aprobada.')
                              inscripciones.refetch()
                            },
                          })
                        }
                        className="rounded-lg bg-[#10B981] px-md py-xs text-label-sm font-bold text-[#fff] transition-all hover:brightness-110 disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRechazoDe(inscripcion)
                          setMotivo('')
                        }}
                        className="rounded-lg border border-error px-md py-xs text-label-sm font-bold text-error transition-all hover:bg-error-container"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {proyecto?.estado_aprobacion === 'APROBADO' && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: '/proyectos/$proyectoId',
                          params: { proyectoId: String(proyecto.id) },
                        })
                      }
                      className="rounded-lg border border-outline-variant px-md py-xs text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      Ver proyecto
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {lista.length === 0 && (
            <p className="py-lg text-center text-body-sm text-outline">
              No hay estudiantes inscritos en esta materia.
            </p>
          )}
        </div>
      </section>

      <Dialog open={!!rechazoDe} onOpenChange={(o) => !o && setRechazoDe(null)}>
        <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle className="text-headline-md text-error">Rechazar propuesta</DialogTitle>
            <DialogDescription className="text-body-sm text-on-surface-variant">
              {rechazoDe?.estudiante_nombre} — {rechazoDe?.proyecto?.titulo}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-md"
            onSubmit={(e) => {
              e.preventDefault()
              const proyectoId = rechazoDe?.proyecto?.id
              if (!proyectoId) return
              rechazar.mutate(
                { proyectoId, motivo },
                {
                  onSuccess: () => {
                    toast.success('Propuesta rechazada.')
                    setRechazoDe(null)
                    inscripciones.refetch()
                  },
                },
              )
            }}
          >
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del rechazo"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setRechazoDe(null)}
                className="flex-1 rounded-xl border border-outline-variant py-sm text-label-md font-bold text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={rechazar.isPending}
                className="flex-1 rounded-xl bg-error py-sm text-label-md font-bold text-on-error disabled:opacity-50"
              >
                {rechazar.isPending ? 'Rechazando…' : 'Rechazar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
