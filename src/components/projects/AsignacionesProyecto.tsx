import { useState } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import { UserSearchCombobox } from '#/components/ui/UserSearchCombobox'
import { initials } from '#/components/layout/Topbar'
import {
  useCreateRelacion,
  useDeleteRelacion,
  useRelaciones,
  type Relacion,
} from '#/hooks/useRelaciones'

const DOCENTE_ROLES = 'DOCENTE,TUTOR,TRIBUNAL'

/** Asignación de tutor y tribunales desde el detalle del proyecto (solo admin). */
export function AsignacionesProyecto({ estudianteId }: { estudianteId: number }) {
  const relaciones = useRelaciones({ estudiante: estudianteId })
  const crear = useCreateRelacion()
  const eliminar = useDeleteRelacion()

  const [cupoPendiente, setCupoPendiente] = useState<{
    docente: number
    relacion: 'TUTOR' | 'TRIBUNAL'
    detail: string
  } | null>(null)
  const [removiendo, setRemoviendo] = useState<Relacion | null>(null)

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
    <div key={relacion.id} className="flex items-center justify-between gap-sm">
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
        onClick={() => setRemoviendo(relacion)}
        title="Remover asignación"
        className="shrink-0 rounded-lg p-xs text-outline transition-colors hover:text-error"
      >
        <MaterialIcon name="person_remove" size={18} />
      </button>
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

      {/* Confirmación de remoción */}
      <ConfirmDialog
        open={!!removiendo}
        title={`Remover ${removiendo?.relacion === 'TUTOR' ? 'tutor' : 'tribunal'}`}
        description={`¿Deseas remover a ${removiendo?.docente_nombre} como ${removiendo?.relacion.toLowerCase()} de este proyecto?`}
        confirmLabel="Remover"
        destructive
        pending={eliminar.isPending}
        onConfirm={() => {
          if (!removiendo) return
          eliminar.mutate(removiendo.id, {
            onSuccess: () => {
              toast.success('Asignación removida.')
              setRemoviendo(null)
            },
          })
        }}
        onCancel={() => setRemoviendo(null)}
      />
    </div>
  )
}
