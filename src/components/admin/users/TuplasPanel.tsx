import { useState } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { UserSearchCombobox } from '#/components/ui/UserSearchCombobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  useCreateRelacion,
  useDeleteRelacion,
  useTuplas,
  type Relacion,
} from '#/hooks/useRelaciones'
import { TUPLA_CANDIDATO_ROLES } from '#/lib/roles'
import type { Usuario } from '#/types/user'

/** Armado de tuplas de docentes (metodológico + de proyecto) para asignar juntos como tribunal. */
export function TuplasPanel() {
  const tuplas = useTuplas()
  const crear = useCreateRelacion()
  const eliminar = useDeleteRelacion()
  const [docente1, setDocente1] = useState<Usuario | null>(null)
  const [removiendo, setRemoviendo] = useState<Relacion | null>(null)
  const [motivo, setMotivo] = useState('')

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-lg dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-sm text-label-md font-bold text-gray-900 dark:text-[#fff]">
        Tuplas de evaluación
      </h3>
      <p className="mb-md text-body-sm text-gray-500 dark:text-gray-400">
        Combina un docente tribunal metodológico con uno de proyecto para asignarlos juntos.
      </p>

      <div className="mb-md flex flex-wrap items-center gap-sm">
        <div className="min-w-[16rem] flex-1">
          <UserSearchCombobox
            roles={TUPLA_CANDIDATO_ROLES}
            placeholder="Docente 1…"
            onSelect={setDocente1}
          />
        </div>
        {docente1 && (
          <span className="rounded-full bg-primary-container px-sm py-xs text-label-sm font-bold text-on-primary">
            {docente1.nombre}
          </span>
        )}
        <div className="min-w-[16rem] flex-1">
          <UserSearchCombobox
            roles={TUPLA_CANDIDATO_ROLES}
            excludeIds={docente1 ? [docente1.id] : []}
            placeholder="Docente 2…"
            onSelect={(docente2) => {
              if (!docente1) {
                toast.error('Selecciona primero el Docente 1.')
                return
              }
              crear.mutate(
                { estudiante: docente2.id, docente: docente1.id, relacion: 'TUPLA_EVALUACION' },
                {
                  onSuccess: () => {
                    toast.success('Tupla creada.')
                    setDocente1(null)
                  },
                  onError: () => toast.error('No se pudo crear la tupla.'),
                },
              )
            }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {(tuplas.data ?? []).map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-sm py-sm">
            <p className="text-label-md text-gray-900 dark:text-[#fff]">
              {t.docente_nombre} + {t.estudiante_nombre}
            </p>
            <button
              type="button"
              onClick={() => {
                setRemoviendo(t)
                setMotivo('')
              }}
              className="rounded-lg p-xs text-gray-400 transition-colors hover:text-error"
              title="Deshacer tupla"
            >
              <MaterialIcon name="link_off" size={18} />
            </button>
          </div>
        ))}
        {(tuplas.data ?? []).length === 0 && (
          <p className="py-md text-center text-body-sm text-gray-400">
            No hay tuplas armadas todavía.
          </p>
        )}
      </div>

      <Dialog open={!!removiendo} onOpenChange={(o) => !o && setRemoviendo(null)}>
        <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle className="text-headline-md text-error">Deshacer tupla</DialogTitle>
            <DialogDescription className="text-body-sm text-on-surface-variant">
              {removiendo?.docente_nombre} + {removiendo?.estudiante_nombre} — indica el motivo.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-md"
            onSubmit={(e) => {
              e.preventDefault()
              if (!removiendo || !motivo.trim()) return
              eliminar.mutate(
                { id: removiendo.id, motivo: motivo.trim() },
                {
                  onSuccess: () => {
                    toast.success('Tupla eliminada.')
                    setRemoviendo(null)
                  },
                  onError: () => toast.error('No se pudo eliminar la tupla.'),
                },
              )
            }}
          >
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo para deshacer esta tupla"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setRemoviendo(null)}
                className="flex-1 rounded-xl border border-outline-variant py-sm text-label-md font-bold text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={eliminar.isPending || !motivo.trim()}
                className="flex-1 rounded-xl bg-error py-sm text-label-md font-bold text-on-error disabled:opacity-50"
              >
                {eliminar.isPending ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
