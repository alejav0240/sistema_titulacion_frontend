import { useState } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import { UserSearchCombobox } from '#/components/ui/UserSearchCombobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { initials } from '#/components/layout/Topbar'
import {
  useAsignarTupla,
  useCreateRelacion,
  useDeleteRelacion,
  useRelaciones,
  useTuplas,
  useUpdateRelacion,
  type Relacion,
} from '#/hooks/useRelaciones'

const DOCENTE_ROLES = 'DOCENTE,TUTOR,TRIBUNAL'

/** Asignación de tutor y tribunales desde el detalle del proyecto (solo admin). */
export function AsignacionesProyecto({ estudianteId }: { estudianteId: number }) {
  const relaciones = useRelaciones({ estudiante: estudianteId })
  const tuplas = useTuplas()
  const crear = useCreateRelacion()
  const asignarTupla = useAsignarTupla()
  const actualizar = useUpdateRelacion()
  const eliminar = useDeleteRelacion()

  const [cupoPendiente, setCupoPendiente] = useState<{
    docente: number
    relacion: 'TUTOR' | 'TRIBUNAL'
    detail: string
  } | null>(null)
  const [tuplaCupoPendiente, setTuplaCupoPendiente] = useState<{
    tuplaId: number
    detail: string
  } | null>(null)
  const [removiendo, setRemoviendo] = useState<Relacion | null>(null)
  const [motivo, setMotivo] = useState('')

  const activas = (relaciones.data ?? []).filter((r) => r.is_active)
  const tutor = activas.find((r) => r.relacion === 'TUTOR')
  const tribunales = activas.filter((r) => r.relacion === 'TRIBUNAL')

  const asignar = (docente: number, relacion: 'TUTOR' | 'TRIBUNAL', force = false) => {
    crear.mutate(
      { estudiante: estudianteId, docente, relacion, force },
      {
        onSuccess: () => {
          toast.success(force ? 'Cupo ampliado y docente asignado.' : 'Docente asignado.')
          setCupoPendiente(null)
        },
        onError: (error) => {
          const data = (error as { response?: { data?: { code?: string; detail?: string } } })
            .response?.data
          if (data?.code === 'CUPO_EXCEDIDO') {
            setCupoPendiente({ docente, relacion, detail: data.detail ?? '' })
          } else {
            toast.error(data?.detail ?? 'No se pudo asignar al docente.')
          }
        },
      },
    )
  }

  const fila = (relacion: Relacion, rolLabel: string) => (
    <div key={relacion.id} className="space-y-xs rounded-lg border border-outline-variant/60 p-sm">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex min-w-0 items-center gap-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-on-primary">
            {initials(relacion.docente_nombre)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-label-md text-on-surface">{relacion.docente_nombre}</p>
            <p className="text-label-sm text-outline">{rolLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setRemoviendo(relacion)
            setMotivo('')
          }}
          title="Remover asignación"
          className="shrink-0 rounded-lg p-xs text-outline transition-colors hover:text-error"
        >
          <MaterialIcon name="person_remove" size={18} />
        </button>
      </div>
      <div className="flex items-center gap-md pl-[40px] text-label-sm">
        <label className="flex items-center gap-xs text-on-surface-variant">
          <input
            type="checkbox"
            checked={relacion.aval_enviado}
            onChange={(e) => actualizar.mutate({ id: relacion.id, aval_enviado: e.target.checked })}
          />
          Aval de aceptación
        </label>
        <label className="flex items-center gap-xs text-on-surface-variant">
          <input
            type="checkbox"
            checked={relacion.carta_firmada}
            onChange={(e) => actualizar.mutate({ id: relacion.id, carta_firmada: e.target.checked })}
          />
          Carta de designación firmada
        </label>
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
        <MaterialIcon name="assignment_ind" size={20} className="text-primary" />
        Asignaciones
      </h3>

      <div className="space-y-md">
        <div>
          <p className="mb-xs text-[10px] font-bold uppercase tracking-wider text-outline">
            Tutor
          </p>
          {tutor ? (
            fila(tutor, 'Tutor')
          ) : (
            <UserSearchCombobox
              roles={DOCENTE_ROLES}
              placeholder="Asignar tutor…"
              onSelect={(usuario) => asignar(usuario.id, 'TUTOR')}
            />
          )}
        </div>

        <div>
          <p className="mb-xs text-[10px] font-bold uppercase tracking-wider text-outline">
            Tribunales
          </p>
          <div className="space-y-sm">
            {tribunales.map((relacion) => fila(relacion, 'Tribunal'))}
            <UserSearchCombobox
              roles={DOCENTE_ROLES}
              excludeIds={tribunales.map((r) => r.docente)}
              placeholder="Agregar tribunal…"
              onSelect={(usuario) => asignar(usuario.id, 'TRIBUNAL')}
            />
            {(tuplas.data ?? []).length > 0 && (
              <select
                defaultValue=""
                disabled={asignarTupla.isPending}
                onChange={(e) => {
                  const tuplaId = Number(e.target.value)
                  if (!tuplaId) return
                  asignarTupla.mutate(
                    { estudiante: estudianteId, tupla_id: tuplaId },
                    {
                      onSuccess: () => toast.success('Tupla asignada como tribunal.'),
                      onError: (error) => {
                        const data = (
                          error as { response?: { data?: { code?: string; detail?: string } } }
                        ).response?.data
                        if (data?.code === 'CUPO_EXCEDIDO') {
                          setTuplaCupoPendiente({ tuplaId, detail: data.detail ?? '' })
                        } else {
                          toast.error(data?.detail ?? 'No se pudo asignar la tupla.')
                        }
                      },
                    },
                  )
                  e.target.value = ''
                }}
                className="h-[40px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
              >
                <option value="">O agregar una tupla de evaluación…</option>
                {(tuplas.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.docente_nombre} + {t.estudiante_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Advertencia de cupo excedido */}
      <ConfirmDialog
        open={!!cupoPendiente}
        title="Límite de cupos alcanzado"
        description={`${cupoPendiente?.detail ?? 'Se alcanzó el límite de cupos.'} ¿Desea asignar a este docente de todas formas? Se incrementará la cantidad de cupos del docente en 1.`}
        confirmLabel="Asignar de todas formas"
        pending={crear.isPending}
        onConfirm={() => {
          if (cupoPendiente) asignar(cupoPendiente.docente, cupoPendiente.relacion, true)
        }}
        onCancel={() => setCupoPendiente(null)}
      />

      {/* Advertencia de cupo excedido al asignar una tupla */}
      <ConfirmDialog
        open={!!tuplaCupoPendiente}
        title="Límite de cupos alcanzado"
        description={`${tuplaCupoPendiente?.detail ?? 'Se alcanzó el límite de cupos.'} ¿Desea asignar la tupla de todas formas? Se incrementará el cupo de tribunal de ambos docentes.`}
        confirmLabel="Asignar de todas formas"
        pending={asignarTupla.isPending}
        onConfirm={() => {
          if (!tuplaCupoPendiente) return
          asignarTupla.mutate(
            { estudiante: estudianteId, tupla_id: tuplaCupoPendiente.tuplaId, force: true },
            {
              onSuccess: () => {
                toast.success('Cupo ampliado y tupla asignada.')
                setTuplaCupoPendiente(null)
              },
              onError: () => toast.error('No se pudo asignar la tupla.'),
            },
          )
        }}
        onCancel={() => setTuplaCupoPendiente(null)}
      />

      {/* Remoción con motivo */}
      <Dialog open={!!removiendo} onOpenChange={(o) => !o && setRemoviendo(null)}>
        <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle className="text-headline-md text-error">
              Remover {removiendo?.relacion === 'TUTOR' ? 'tutor' : 'tribunal'}
            </DialogTitle>
            <DialogDescription className="text-body-sm text-on-surface-variant">
              {removiendo?.docente_nombre} — indica el motivo de la remoción.
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
                    toast.success('Asignación removida.')
                    setRemoviendo(null)
                  },
                  onError: () => toast.error('No se pudo remover la asignación.'),
                },
              )
            }}
          >
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo de la remoción"
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
                {eliminar.isPending ? 'Removiendo…' : 'Remover'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
