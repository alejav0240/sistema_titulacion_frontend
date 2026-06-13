import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import {
  useEnrollCsv,
  useEnrollStudent,
  useMateria,
  useMateriaEstudiantes,
  useUnenrollStudent,
} from '#/hooks/useMaterias'
import { useUsers } from '#/hooks/useUsers'

export const Route = createFileRoute('/_shell/admin/materias/$materiaId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <MateriaDetailPage />
    </AuthGuard>
  )
}

function MateriaDetailPage() {
  const { materiaId } = Route.useParams()
  const navigate = useNavigate()
  const id = Number(materiaId)

  const materia = useMateria(id)
  const inscripciones = useMateriaEstudiantes(id)
  const enroll = useEnrollStudent()
  const enrollCsv = useEnrollCsv()
  const unenroll = useUnenrollStudent()

  const [studentSearch, setStudentSearch] = useState('')
  const estudiantes = useUsers(1, {
    rol: 'ESTUDIANTE',
    search: studentSearch || undefined,
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const [csvResult, setCsvResult] = useState<string | null>(null)

  const data = materia.data
  const inscritosIds = new Set(
    (inscripciones.data ?? []).map((i) => i.estudiante),
  )

  if (materia.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Encabezado */}
      <section className="flex items-start justify-between gap-md">
        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/materias', search: {} })}
            className="rounded-lg border border-outline-variant p-sm text-on-surface-variant transition-colors hover:text-primary"
            aria-label="Volver"
          >
            <MaterialIcon name="arrow_back" size={18} />
          </button>
          <div>
            <div className="flex items-center gap-sm">
              <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-on-surface-variant">
                {data?.codigo}
              </span>
              <span className="rounded-full bg-secondary-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-secondary-container">
                Activa
              </span>
            </div>
            <h2 className="mt-xs text-headline-lg text-primary">{data?.nombre}</h2>
            <p className="text-body-md text-on-surface-variant">
              {data?.grupo} · {data?.semestre}° semestre ·{' '}
              {data?.docente_nombre ?? 'Sin docente'}
            </p>
          </div>
        </div>
        <div className="flex gap-md">
          <div className="rounded-xl border border-outline-variant bg-white px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">
              {data?.num_estudiantes ?? 0}
            </p>
            <p className="text-label-sm text-outline">Estudiantes</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-white px-lg py-md text-center">
            <p className="text-headline-md font-bold text-primary">
              {data?.progreso ?? 0}%
            </p>
            <p className="text-label-sm text-outline">Progreso</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        {/* Estudiantes inscritos */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg lg:col-span-2">
          <div className="mb-md flex items-center justify-between">
            <h3 className="text-label-md font-bold text-on-surface">
              Estudiantes inscritos
            </h3>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={enrollCsv.isPending}
              className="flex items-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-label-md text-on-surface-variant transition-colors hover:text-primary disabled:opacity-50"
            >
              <MaterialIcon name="upload_file" size={16} />
              {enrollCsv.isPending ? 'Importando…' : 'Importar CSV'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  enrollCsv.mutate(
                    { materiaId: id, file },
                    {
                      onSuccess: (result) => {
                        const r = result as {
                          inscritos: string[]
                          errors: Array<unknown>
                        }
                        setCsvResult(
                          `${r.inscritos.length} inscritos, ${r.errors.length} errores.`,
                        )
                      },
                    },
                  )
                }
                e.target.value = ''
              }}
            />
          </div>

          {csvResult && (
            <p className="mb-sm rounded-lg bg-secondary-container/40 p-sm text-label-sm text-on-secondary-container">
              {csvResult}
            </p>
          )}

          <div className="divide-y divide-outline-variant/50">
            {(inscripciones.data ?? []).map((inscripcion) => (
              <div
                key={inscripcion.id}
                className="flex items-center justify-between py-sm"
              >
                <div className="flex items-center gap-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                    {initials(inscripcion.estudiante_nombre)}
                  </span>
                  <div>
                    <p className="text-label-md text-on-surface">
                      {inscripcion.estudiante_nombre}
                    </p>
                    <p className="text-label-sm text-outline">
                      {inscripcion.estudiante_email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    unenroll.mutate({ materiaId: id, inscripcionId: inscripcion.id })
                  }
                  title="Quitar de la materia"
                  className="rounded-lg p-xs text-outline transition-colors hover:text-error"
                >
                  <MaterialIcon name="person_remove" size={18} />
                </button>
              </div>
            ))}
            {(inscripciones.data ?? []).length === 0 && (
              <p className="py-lg text-center text-body-sm text-outline">
                Aún no hay estudiantes inscritos.
              </p>
            )}
          </div>
        </div>

        {/* Inscribir estudiante */}
        <div className="h-fit rounded-xl border border-outline-variant bg-white p-lg">
          <h3 className="mb-md text-label-md font-bold text-on-surface">
            Inscribir estudiante
          </h3>
          <div className="relative mb-sm">
            <MaterialIcon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="w-full rounded-lg border border-outline-variant py-sm pl-10 pr-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="thin-scrollbar max-h-72 space-y-xs overflow-y-auto">
            {(estudiantes.data?.results ?? [])
              .filter((usuario) => !inscritosIds.has(usuario.id))
              .map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/60 p-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-label-md text-on-surface">
                      {usuario.nombre}
                    </p>
                    <p className="truncate text-label-sm text-outline">
                      {usuario.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={enroll.isPending}
                    onClick={() =>
                      enroll.mutate({ materiaId: id, estudiante: usuario.id })
                    }
                    title="Inscribir"
                    className="rounded-lg bg-primary-container p-xs text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    <MaterialIcon name="person_add" size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
