import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useGrupo, useUpdateGrupo } from '#/hooks/useGrupos'
import { useMaterias } from '#/hooks/useMaterias'

export const Route = createFileRoute('/_shell/admin/grupos/$grupoId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <GrupoDetailPage />
    </AuthGuard>
  )
}

function GrupoDetailPage() {
  const { grupoId } = Route.useParams()
  const navigate = useNavigate()
  const id = Number(grupoId)

  const grupo = useGrupo(id)
  const update = useUpdateGrupo()
  const materias = useMaterias()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editingMeta, setEditingMeta] = useState(false)

  const data = grupo.data
  const materiasAsignadas = new Set(data?.materias ?? [])

  const toggleMateria = (materiaId: number) => {
    if (!data) return
    const nuevas = materiasAsignadas.has(materiaId)
      ? data.materias.filter((m) => m !== materiaId)
      : [...data.materias, materiaId]
    update.mutate({ id, materias: nuevas })
  }

  const saveMeta = () => {
    update.mutate(
      { id, nombre: nombre || data?.nombre, descripcion: descripcion ?? data?.descripcion },
      { onSuccess: () => setEditingMeta(false) },
    )
  }

  if (grupo.isLoading) {
    return <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
  }

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-md">
        <button
          type="button"
          onClick={() => navigate({ to: '/admin/grupos' })}
          className="rounded-lg border border-outline-variant p-sm text-on-surface-variant hover:text-primary"
          aria-label="Volver"
        >
          <MaterialIcon name="arrow_back" size={18} />
        </button>
        <div className="flex-1">
          {editingMeta ? (
            <div className="flex items-center gap-sm">
              <input
                value={nombre || data?.nombre || ''}
                onChange={(e) => setNombre(e.target.value)}
                className="rounded-lg border border-outline-variant px-md py-sm text-headline-md text-primary outline-none focus:border-primary"
              />
              <button type="button" onClick={saveMeta} className="text-primary hover:opacity-80">
                <MaterialIcon name="check" size={20} />
              </button>
              <button type="button" onClick={() => setEditingMeta(false)} className="text-outline hover:text-error">
                <MaterialIcon name="close" size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-sm">
              <h2 className="text-headline-lg text-primary">{data?.nombre}</h2>
              <button type="button" onClick={() => { setNombre(data?.nombre ?? ''); setDescripcion(data?.descripcion ?? ''); setEditingMeta(true) }} className="text-outline hover:text-primary">
                <MaterialIcon name="edit" size={18} />
              </button>
            </div>
          )}
          {data?.descripcion && !editingMeta && (
            <p className="text-body-md text-on-surface-variant">{data.descripcion}</p>
          )}
          {editingMeta && (
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={2}
              className="mt-xs w-full rounded-lg border border-outline-variant px-md py-sm text-body-sm outline-none focus:border-primary"
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-white p-lg">
        <h3 className="mb-md text-label-md font-bold text-on-surface">Materias del grupo</h3>
        <div className="divide-y divide-outline-variant/50">
          {(materias.data ?? []).map((materia) => {
            const asignada = materiasAsignadas.has(materia.id)
            return (
              <div key={materia.id} className="flex items-center justify-between py-sm">
                <div>
                  <p className="text-label-md text-on-surface">{materia.nombre}</p>
                  <p className="text-label-sm text-outline">
                    {materia.grupo} · {materia.semestre}° semestre
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMateria(materia.id)}
                  disabled={update.isPending}
                  className={asignada
                    ? 'rounded-lg bg-primary-container px-md py-sm text-label-sm text-on-primary hover:opacity-80 disabled:opacity-50'
                    : 'rounded-lg border border-outline-variant px-md py-sm text-label-sm text-on-surface-variant hover:text-primary disabled:opacity-50'
                  }
                >
                  {asignada ? 'Quitar' : 'Agregar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
