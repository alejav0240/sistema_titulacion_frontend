import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useDebouncedValue } from '#/hooks/useDebouncedValue'
import { useMaterias } from '#/hooks/useMaterias'
import type { Materia } from '#/types/materia'

export const Route = createFileRoute('/_shell/formularios/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL', 'DIRECTOR', 'DTC', 'COMITE_EVALUACION']}>
      <FormulariosPage />
    </AuthGuard>
  )
}

function FormulariosPage() {
  const [search, setSearch] = useState('')
  const [gestionAnio, setGestionAnio] = useState('')
  const [gestionSemestre, setGestionSemestre] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const materias = useMaterias({
    search: debouncedSearch || undefined,
    gestion_anio: gestionAnio || undefined,
    gestion_semestre: gestionSemestre || undefined,
  })

  return (
    <div className="space-y-lg">
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg text-primary">Formularios</h2>
          <p className="text-body-md text-on-surface-variant">
            Seguimiento de F1-F4 por materia: perfil, avance, defensa interna y documento final.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <div className="relative">
            <MaterialIcon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar materia…"
              className="w-56 rounded-lg border border-outline-variant bg-white py-sm pl-10 pr-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <select
            value={gestionAnio}
            onChange={(e) => setGestionAnio(e.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-sm py-sm text-body-sm outline-none focus:border-primary"
          >
            <option value="">Cualquier año</option>
            {Array.from({ length: 6 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={gestionSemestre}
            onChange={(e) => setGestionSemestre(e.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-sm py-sm text-body-sm outline-none focus:border-primary"
          >
            <option value="">Cualquier gestión</option>
            <option value="I">Gestión I</option>
            <option value="II">Gestión II</option>
          </select>
        </div>
      </section>

      {materias.isLoading ? (
        <p className="py-xl text-center text-body-sm text-outline">Cargando materias…</p>
      ) : (
        <section className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3">
          {(materias.data ?? []).map((materia) => (
            <FormularioMateriaCard key={materia.id} materia={materia} />
          ))}
          {(materias.data ?? []).length === 0 && (
            <p className="col-span-full py-xl text-center text-body-sm text-outline">
              No hay materias que coincidan con la búsqueda.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

function FormularioMateriaCard({ materia }: { materia: Materia }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-white p-lg shadow-sm transition-all hover:shadow-md">
      <div className="mb-sm flex items-center justify-between">
        <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-on-surface-variant">
          {materia.codigo}
        </span>
        <span className="text-label-sm text-outline">
          {materia.gestion_semestre} - {materia.gestion_anio}
        </span>
      </div>
      <h3 className="text-label-md font-bold text-on-surface">{materia.nombre}</h3>
      <p className="text-label-sm text-outline">
        {materia.grupo} · {materia.num_estudiantes} estudiantes
      </p>
      <button
        type="button"
        onClick={() =>
          navigate({
            to: '/formularios/$materiaId',
            params: { materiaId: String(materia.id) },
          })
        }
        className="mt-lg rounded-lg bg-primary-container py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
      >
        Ver formularios
      </button>
    </div>
  )
}
