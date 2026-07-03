import { Link, createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useMaterias } from '#/hooks/useMaterias'

export const Route = createFileRoute('/_shell/docente/materias/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL']}>
      <MateriasDocentePage />
    </AuthGuard>
  )
}

function MateriasDocentePage() {
  const materias = useMaterias()

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-headline-lg text-primary">Mis materias</h2>
        <p className="text-body-md text-on-surface-variant">
          Materias que dictas y los proyectos de sus estudiantes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3">
        {(materias.data ?? []).map((materia) => (
          <Link
            key={materia.id}
            to="/docente/materias/$materiaId"
            params={{ materiaId: String(materia.id) }}
            className="rounded-xl border border-outline-variant bg-white p-lg transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-on-surface-variant">
                {materia.codigo}
              </span>
              <MaterialIcon name="chevron_right" size={18} className="text-outline" />
            </div>
            <h3 className="mt-sm text-label-md font-bold text-on-surface">{materia.nombre}</h3>
            <p className="text-label-sm text-outline">
              {materia.grupo} · {materia.semestre}° semestre
            </p>
            <p className="mt-md flex items-center gap-xs text-label-sm text-on-surface-variant">
              <MaterialIcon name="group" size={16} />
              {materia.num_estudiantes} estudiantes
            </p>
          </Link>
        ))}
        {!materias.isLoading && (materias.data ?? []).length === 0 && (
          <p className="col-span-full py-xl text-center text-body-sm text-outline">
            No tienes materias asignadas.
          </p>
        )}
      </div>
    </div>
  )
}
