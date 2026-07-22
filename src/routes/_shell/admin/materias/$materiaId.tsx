import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import {
  useBulkUnenroll,
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
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC', 'COMITE_EVALUACION']}>
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
  const [csvPreview, setCsvPreview] = useState<Array<{ email: string; nombre: string }> | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)
  const bulkUnenroll = useBulkUnenroll()

  const toggleSeleccion = (inscripcionId: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(inscripcionId)) next.delete(inscripcionId)
      else next.add(inscripcionId)
      return next
    })
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const hasHeader = lines[0].toLowerCase().includes('email')
    return (hasHeader ? lines.slice(1) : lines)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => { const [email = '', nombre = ''] = l.split(',').map((s) => s.trim()); return { email, nombre } })
      .filter((r) => r.email)
  }

  const confirmarCSV = () => {
    if (!pendingFile) return
    enrollCsv.mutate(
      { materiaId: id, file: pendingFile },
      {
        onSuccess: (result) => {
          const r = result as { inscritos: string[]; creados: string[]; errors: Array<unknown> }
          const partes = []
          if (r.creados?.length) partes.push(`${r.creados.length} creados`)
          const soloInscritos = r.inscritos.length - (r.creados?.length ?? 0)
          if (soloInscritos > 0) partes.push(`${soloInscritos} ya existían e inscritos`)
          if (r.errors.length) partes.push(`${r.errors.length} errores`)
          setCsvResult(partes.join(', ') + '.')
          setCsvPreview(null)
          setPendingFile(null)
        },
      },
    )
  }

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
              disabled={enrollCsv.isPending || !!csvPreview}
              className="flex items-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-label-md text-on-surface-variant transition-colors hover:text-primary disabled:opacity-50"
            >
              <MaterialIcon name="upload_file" size={16} />
              Importar CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  const text = ev.target?.result as string
                  setCsvPreview(parseCSV(text))
                  setPendingFile(file)
                  setCsvResult(null)
                }
                reader.readAsText(file)
                e.target.value = ''
              }}
            />
          </div>

          {csvPreview && (
            <div className="mb-md rounded-xl border border-outline-variant bg-surface-container-lowest p-sm">
              <p className="mb-xs text-[10px] font-bold uppercase tracking-wider text-outline">
                Preview — {csvPreview.length} registro{csvPreview.length !== 1 ? 's' : ''}
              </p>
              <div className="max-h-[200px] overflow-y-auto divide-y divide-outline-variant/40">
                {csvPreview.map((row, i) => (
                  <div key={i} className="flex items-center gap-sm py-xs">
                    <span className="w-5 text-center text-[10px] text-outline">{i + 1}</span>
                    <div>
                      <p className="text-label-sm text-on-surface">{row.email}</p>
                      {row.nombre && <p className="text-[10px] text-outline">{row.nombre}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-sm flex justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => { setCsvPreview(null); setPendingFile(null) }}
                  className="px-md py-xs text-label-sm text-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarCSV}
                  disabled={enrollCsv.isPending}
                  className="rounded-lg bg-primary px-md py-xs text-label-sm font-bold text-[#fff] disabled:opacity-50"
                >
                  {enrollCsv.isPending ? 'Importando…' : 'Confirmar importación'}
                </button>
              </div>
            </div>
          )}

          {csvResult && (
            <p className="mb-sm rounded-lg bg-secondary-container/40 p-sm text-label-sm text-on-secondary-container">
              {csvResult}
            </p>
          )}

          {(() => {
            const inscritos = inscripciones.data ?? []
            if (inscritos.length === 0) {
              return (
                <p className="py-lg text-center text-body-sm text-outline">
                  Aún no hay estudiantes inscritos.
                </p>
              )
            }
            const row = (inscripcion: typeof inscritos[0]) => (
              <div key={inscripcion.id} className="flex items-center justify-between py-sm">
                <div className="flex items-center gap-sm">
                  <input
                    type="checkbox"
                    checked={seleccionados.has(inscripcion.id)}
                    onChange={() => toggleSeleccion(inscripcion.id)}
                    className="h-4 w-4 rounded border-outline-variant accent-[#6b1d2f]"
                  />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                    {initials(inscripcion.estudiante_nombre)}
                  </span>
                  <div>
                    <p className="text-label-md text-on-surface">{inscripcion.estudiante_nombre}</p>
                    <p className="text-label-sm text-outline">{inscripcion.estudiante_email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unenroll.mutate({ materiaId: id, inscripcionId: inscripcion.id })}
                  title="Quitar de la materia"
                  className="rounded-lg p-xs text-outline transition-colors hover:text-error"
                >
                  <MaterialIcon name="person_remove" size={18} />
                </button>
              </div>
            )
            return (
              <>
                {seleccionados.size > 0 && (
                  <div className="mb-sm flex items-center justify-between rounded-lg bg-error-container/60 p-sm">
                    <span className="text-label-sm font-bold text-on-error-container">
                      {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmBulkOpen(true)}
                      className="rounded bg-error px-sm py-1 text-[10px] font-bold uppercase text-on-error hover:brightness-110"
                    >
                      Quitar seleccionados
                    </button>
                  </div>
                )}
                <div className="divide-y divide-outline-variant/50">
                  {inscritos.slice(0, 5).map(row)}
                </div>
                {inscritos.length > 5 && (
                  <div className="thin-scrollbar mt-xs max-h-[260px] overflow-y-auto divide-y divide-outline-variant/40 border-t border-outline-variant/50">
                    {inscritos.slice(5).map(row)}
                  </div>
                )}
              </>
            )
          })()}
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

      <ConfirmDialog
        open={confirmBulkOpen}
        title="Quitar estudiantes"
        description={`¿Quitar a ${seleccionados.size} estudiante${seleccionados.size !== 1 ? 's' : ''} de esta materia?`}
        confirmLabel="Quitar"
        destructive
        pending={bulkUnenroll.isPending}
        onConfirm={() =>
          bulkUnenroll.mutate(
            { materiaId: id, inscripcionIds: [...seleccionados] },
            {
              onSuccess: () => {
                setSeleccionados(new Set())
                setConfirmBulkOpen(false)
              },
            },
          )
        }
        onCancel={() => setConfirmBulkOpen(false)}
      />
    </div>
  )
}
