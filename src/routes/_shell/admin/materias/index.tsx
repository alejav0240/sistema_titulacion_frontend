import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MateriaModal } from '#/components/materias/MateriaModal'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { useMaterias } from '#/hooks/useMaterias'
import { cn } from '#/lib/utils'
import type { Materia } from '#/types/materia'

export const Route = createFileRoute('/_shell/admin/materias/')({
  validateSearch: z.object({
    view: z.enum(['cards', 'table']).optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <MateriasPage />
    </AuthGuard>
  )
}

function MateriasPage() {
  const { view = 'cards' } = Route.useSearch()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Materia | null>(null)

  const materias = useMaterias({ search: search || undefined })

  const setView = (v: 'cards' | 'table') =>
    navigate({ to: '/admin/materias', search: { view: v }, replace: true })

  const openEdit = (materia: Materia) => {
    setEditing(materia)
    setModalOpen(true)
  }

  return (
    <div className="space-y-lg">
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg text-primary">Gestión de Materias</h2>
          <p className="text-body-md text-on-surface-variant">
            Administra los módulos académicos, docentes y estudiantes inscritos.
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
          <div className="flex rounded-lg border border-outline-variant bg-surface-container-low p-xs">
            {(
              [
                ['table', 'table_rows'],
                ['cards', 'grid_view'],
              ] as const
            ).map(([key, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-label={key === 'cards' ? 'Vista tarjetas' : 'Vista tabla'}
                className={cn(
                  'rounded-md px-sm py-xs transition-all',
                  view === key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary',
                )}
              >
                <MaterialIcon name={icon} size={18} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {materias.isLoading ? (
        <p className="py-xl text-center text-body-sm text-outline">
          Cargando materias…
        </p>
      ) : view === 'cards' ? (
        <section className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3">
          {(materias.data ?? []).map((materia) => (
            <MateriaCard key={materia.id} materia={materia} onEdit={openEdit} />
          ))}
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
            className="flex min-h-[220px] flex-col items-center justify-center gap-sm rounded-xl border-2 border-dashed border-outline-variant text-outline transition-all hover:border-primary hover:text-primary"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current">
              <MaterialIcon name="add" size={24} />
            </span>
            <span className="text-label-md font-bold">Nueva Materia</span>
          </button>
        </section>
      ) : (
        <MateriasTable
          materias={materias.data ?? []}
          onEdit={openEdit}
          onNew={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        />
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => {
          setEditing(null)
          setModalOpen(true)
        }}
        title="Nueva Materia"
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        <MaterialIcon name="add" size={28} />
      </button>

      <MateriaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        materia={editing}
      />
    </div>
  )
}

function MateriaCard({
  materia,
  onEdit,
}: {
  materia: Materia
  onEdit: (materia: Materia) => void
}) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-white p-lg shadow-sm transition-all hover:shadow-md">
      <div className="mb-sm flex items-center justify-between">
        <span className="rounded bg-surface-container px-sm py-[2px] text-label-sm font-bold text-on-surface-variant">
          {materia.codigo}
        </span>
        <span className="rounded-full bg-secondary-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-secondary-container">
          Activa
        </span>
      </div>
      <h3 className="text-label-md font-bold text-on-surface">{materia.nombre}</h3>
      <p className="text-label-sm text-outline">{materia.grupo}</p>

      <div className="mt-md flex items-center gap-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-[10px] font-bold text-on-primary-fixed">
          {initials(materia.docente_nombre)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-label-sm font-bold text-on-surface">
            {materia.docente_nombre ?? 'Sin docente asignado'}
          </p>
          <p className="text-[10px] text-outline">
            {materia.num_estudiantes} Estudiantes
          </p>
        </div>
      </div>

      <div className="mt-md">
        <div className="flex items-center justify-between text-label-sm">
          <span className="text-on-surface-variant">Progreso promedio</span>
          <span className="font-bold text-on-surface">{materia.progreso}%</span>
        </div>
        <div className="mt-xs h-1.5 overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary-container"
            style={{ width: `${materia.progreso}%` }}
          />
        </div>
      </div>

      <div className="mt-lg flex items-center gap-sm">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: '/admin/materias/$materiaId',
              params: { materiaId: String(materia.id) },
            })
          }
          className="flex-1 rounded-lg bg-primary-container py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
        >
          Ver detalle
        </button>
        <button
          type="button"
          onClick={() => onEdit(materia)}
          title="Editar materia"
          className="rounded-lg border border-outline-variant p-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialIcon name="edit" size={18} />
        </button>
      </div>
    </div>
  )
}

function MateriasTable({
  materias,
  onEdit,
  onNew,
}: {
  materias: Materia[]
  onEdit: (materia: Materia) => void
  onNew: () => void
}) {
  const navigate = useNavigate()
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low text-left">
            {[
              'Código',
              'Materia',
              'Docente a cargo',
              'Semestre',
              'Estudiantes',
              'Progreso',
              'Acciones',
            ].map((header) => (
              <th
                key={header}
                className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {materias.map((materia) => (
            <tr
              key={materia.id}
              className="border-b border-outline-variant/50 transition-colors last:border-none hover:bg-surface-container-low/50"
            >
              <td className="px-md py-md text-label-sm font-bold text-on-surface-variant">
                {materia.codigo}
              </td>
              <td className="px-md py-md">
                <p className="text-label-md font-bold text-on-surface">
                  {materia.nombre}
                </p>
                <p className="text-label-sm text-outline">{materia.grupo}</p>
              </td>
              <td className="px-md py-md text-body-sm text-on-surface-variant">
                {materia.docente_nombre ?? '—'}
              </td>
              <td className="px-md py-md text-body-sm text-on-surface-variant">
                {materia.semestre}°
              </td>
              <td className="px-md py-md text-body-sm text-on-surface-variant">
                {materia.num_estudiantes}
              </td>
              <td className="px-md py-md">
                <div className="flex items-center gap-sm">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary-container"
                      style={{ width: `${materia.progreso}%` }}
                    />
                  </div>
                  <span className="text-label-sm font-bold">
                    {materia.progreso}%
                  </span>
                </div>
              </td>
              <td className="px-md py-md">
                <div className="flex gap-xs">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: '/admin/materias/$materiaId',
                        params: { materiaId: String(materia.id) },
                      })
                    }
                    title="Ver detalle"
                    className="rounded-lg p-xs text-primary hover:bg-surface-container-low"
                  >
                    <MaterialIcon name="visibility" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(materia)}
                    title="Editar"
                    className="rounded-lg p-xs text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  >
                    <MaterialIcon name="edit" size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {materias.length === 0 && (
            <tr>
              <td colSpan={7} className="py-xl text-center text-body-sm text-outline">
                No hay materias.{' '}
                <button
                  type="button"
                  onClick={onNew}
                  className="font-bold text-primary hover:underline"
                >
                  Crear la primera
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
