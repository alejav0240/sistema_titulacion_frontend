import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useCreateMateria, useUpdateMateria } from '#/hooks/useMaterias'
import { useUsers } from '#/hooks/useUsers'
import type { Materia } from '#/types/materia'

const inputClass =
  'h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container'

/** Modal de creación/edición de materia (pantalla 8f31c7ad). */
export function MateriaModal({
  open,
  onClose,
  materia,
}: {
  open: boolean
  onClose: () => void
  materia: Materia | null
}) {
  const [nombre, setNombre] = useState('')
  const [grupo, setGrupo] = useState('')
  const [semestre, setSemestre] = useState(9)
  const [docente, setDocente] = useState<string>('')

  const docentes = useUsers(1, { rol: 'DOCENTE' })
  const create = useCreateMateria()
  const update = useUpdateMateria()
  const pending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setNombre(materia?.nombre ?? '')
      setGrupo(materia?.grupo ?? '')
      setSemestre(materia?.semestre ?? 9)
      setDocente(materia?.docente_a_cargo ? String(materia.docente_a_cargo) : '')
    }
  }, [open, materia])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      nombre: nombre.trim(),
      grupo: grupo.trim(),
      semestre,
      docente_a_cargo: docente ? Number(docente) : null,
    }
    const options = { onSuccess: onClose }
    if (materia) update.mutate({ id: materia.id, ...payload }, options)
    else create.mutate(payload, options)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            {materia ? 'Editar Materia' : 'Nueva Materia'}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Define el módulo académico y el docente titular a cargo.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="m-nombre">
              Nombre de la materia
            </label>
            <input
              id="m-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Proyecto de Grado I"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="m-grupo">
                Carrera / Grupo
              </label>
              <input
                id="m-grupo"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                placeholder="Ej. Ing. de Sistemas"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="m-semestre">
                Semestre
              </label>
              <select
                id="m-semestre"
                value={semestre}
                onChange={(e) => setSemestre(Number(e.target.value))}
                className={inputClass}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}°
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="m-docente">
              Docente titular
            </label>
            <select
              id="m-docente"
              value={docente}
              onChange={(e) => setDocente(e.target.value)}
              className={inputClass}
            >
              <option value="">Sin asignar</option>
              {(docentes.data?.results ?? []).map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
          {(create.isError || update.isError) && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              No se pudo guardar la materia.
            </p>
          )}
          <div className="flex justify-end gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-lg py-sm text-label-md text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || !nombre.trim() || !grupo.trim()}
              className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {pending ? 'Guardando…' : materia ? 'Guardar cambios' : 'Crear materia'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
