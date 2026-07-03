import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { CsvImportModal } from '#/components/ui/CsvImportModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useCreateGrupo, useDeleteGrupo, useGrupos, useImportGrupos } from '#/hooks/useGrupos'
import { useMaterias } from '#/hooks/useMaterias'

export const Route = createFileRoute('/_shell/admin/grupos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <GruposPage />
    </AuthGuard>
  )
}

function GruposPage() {
  const navigate = useNavigate()
  const grupos = useGrupos()
  const eliminar = useDeleteGrupo()
  const importGrupos = useImportGrupos()
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-lg text-primary">Grupos</h2>
          <p className="text-body-md text-on-surface-variant">
            Agrupaciones de materias para el cronograma
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-label-md text-on-surface-variant transition-colors hover:text-primary"
          >
            <MaterialIcon name="upload_file" size={16} />
            Importar CSV
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-sm rounded-lg bg-primary-container px-lg py-sm text-label-md text-on-primary hover:opacity-90"
          >
            <MaterialIcon name="add" size={18} />
            Nuevo grupo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
        {(grupos.data ?? []).map((grupo) => (
          <div
            key={grupo.id}
            className="flex flex-col rounded-xl border border-outline-variant bg-white p-lg shadow-sm"
          >
            <div className="mb-sm flex items-start justify-between gap-sm">
              <div>
                <p className="text-label-md font-bold text-on-surface">{grupo.nombre}</p>
                {grupo.descripcion && (
                  <p className="mt-xs text-body-sm text-on-surface-variant">{grupo.descripcion}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => eliminar.mutate(grupo.id)}
                title="Eliminar grupo"
                className="shrink-0 rounded-lg p-xs text-outline hover:text-error"
              >
                <MaterialIcon name="delete" size={16} />
              </button>
            </div>
            <p className="mb-md text-label-sm text-outline">
              {grupo.materias_nombres.length} materia{grupo.materias_nombres.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: '/admin/grupos/$grupoId', params: { grupoId: String(grupo.id) } })}
              className="mt-auto rounded-lg border border-outline-variant px-md py-sm text-label-sm text-on-surface-variant hover:text-primary"
            >
              Gestionar materias
            </button>
          </div>
        ))}
        {grupos.data?.length === 0 && (
          <p className="col-span-full py-xl text-center text-body-sm text-outline">
            No hay grupos creados aún.
          </p>
        )}
      </div>

      <GrupoModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <CsvImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importar Grupos"
        columns={['nombregrupo', 'materias', 'descripcion']}
        exampleRows={[
          'GRUPO A,TALLER DE GRADO I|SEMINARIO DE TESIS,Grupo de la mañana',
          'GRUPO B,TALLER DE GRADO II,',
        ]}
        helpText="Separa varias materias con | o ;. Las materias deben existir previamente (los nombres se comparan en mayúsculas)."
        onImport={async (file) => {
          const result = await importGrupos.mutateAsync(file)
          const partes = []
          if (result.creados.length) partes.push(`${result.creados.length} creados`)
          if (result.errors.length) partes.push(`${result.errors.length} errores`)
          toast.info(partes.join(', ') || 'Sin cambios.')
        }}
        pending={importGrupos.isPending}
      />
    </div>
  )
}

function GrupoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const crear = useCreateGrupo()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [materiaSearch, setMateriaSearch] = useState('')
  const [materiasSel, setMateriasSel] = useState<Set<number>>(new Set())

  const materias = useMaterias()
  const filtradas = (materias.data ?? []).filter((m) =>
    m.nombre.toLowerCase().includes(materiaSearch.toLowerCase()),
  )

  const toggleMateria = (materiaId: number) => {
    setMateriasSel((prev) => {
      const next = new Set(prev)
      if (next.has(materiaId)) next.delete(materiaId)
      else next.add(materiaId)
      return next
    })
  }

  const reset = () => {
    setNombre('')
    setDescripcion('')
    setMateriaSearch('')
    setMateriasSel(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[30rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">Nuevo grupo</DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Crea el grupo y asigna sus materias de una vez.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!nombre.trim()) return
            crear.mutate(
              {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                materias: [...materiasSel],
              },
              {
                onSuccess: () => {
                  reset()
                  onClose()
                },
              },
            )
          }}
        >
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del grupo"
            className="h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
          />

          {/* Materias con buscador y checkboxes */}
          <div>
            <p className="mb-xs text-[10px] font-bold uppercase tracking-wider text-outline">
              Materias ({materiasSel.size} seleccionadas)
            </p>
            <div className="relative mb-sm">
              <MaterialIcon
                name="search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                value={materiaSearch}
                onChange={(e) => setMateriaSearch(e.target.value)}
                placeholder="Buscar materia…"
                className="w-full rounded-lg border border-outline-variant py-sm pl-9 pr-md text-body-sm outline-none focus:border-primary"
              />
            </div>
            <div className="thin-scrollbar max-h-[180px] space-y-xs overflow-y-auto rounded-lg border border-outline-variant p-sm">
              {filtradas.map((materia) => (
                <label
                  key={materia.id}
                  className="flex cursor-pointer items-center gap-sm rounded px-xs py-xs hover:bg-surface-container-low"
                >
                  <input
                    type="checkbox"
                    checked={materiasSel.has(materia.id)}
                    onChange={() => toggleMateria(materia.id)}
                    className="h-4 w-4 rounded border-outline-variant accent-[#6b1d2f]"
                  />
                  <span className="text-body-sm text-on-surface">
                    {materia.nombre}
                    <span className="ml-xs text-label-sm text-outline">({materia.grupo})</span>
                  </span>
                </label>
              ))}
              {filtradas.length === 0 && (
                <p className="py-sm text-center text-body-sm text-outline">Sin resultados.</p>
              )}
            </div>
          </div>

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
              disabled={!nombre.trim() || crear.isPending}
              className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {crear.isPending ? 'Creando…' : 'Crear grupo'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
