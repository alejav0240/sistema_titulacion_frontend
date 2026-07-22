import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { MatrizConsistenciaPanel } from '#/components/projects/MatrizConsistenciaPanel'
import { useMateria, useMateriaEstudiantes } from '#/hooks/useMaterias'
import { cn } from '#/lib/utils'

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
  const [expandidoId, setExpandidoId] = useState<number | null>(null)

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
            const expandido = expandidoId === inscripcion.id
            return (
              <div key={inscripcion.id} className="py-sm">
                <div className="flex items-center justify-between gap-md">
                  <div className="flex min-w-0 items-center gap-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                      {initials(inscripcion.estudiante_nombre)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-label-md text-on-surface">{inscripcion.estudiante_nombre}</p>
                      <p className="truncate text-label-sm text-outline">{inscripcion.estudiante_email}</p>
                      <p className="truncate text-label-sm text-outline">
                        {proyecto?.titulo || (proyecto ? 'Tema pendiente' : 'Sin perfil registrado')}
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
                      <button
                        type="button"
                        onClick={() => setExpandidoId(expandido ? null : inscripcion.id)}
                        className="rounded-lg border border-primary px-md py-xs text-label-sm font-bold text-primary transition-all hover:bg-primary-container hover:text-on-primary"
                      >
                        {expandido ? 'Ocultar matrices' : 'Revisar matrices'}
                      </button>
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
                {expandido && proyecto && (
                  <div className="mt-sm">
                    <MatrizConsistenciaPanel proyecto={proyecto} rolDecisor="DOCENTE" />
                  </div>
                )}
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
    </div>
  )
}
