import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  useAprobarMatriz,
  useEditarMatriz,
  useRechazarMatriz,
  useSeleccionarMatriz,
} from '#/hooks/useProjects'
import { cn } from '#/lib/utils'
import type { MatrizConsistencia, MatrizInput } from '#/types/project'

const ESTADO_MATRIZ_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  APROBADA: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  RECHAZADA: 'bg-error-container text-on-error-container',
}

const ESTADO_MATRIZ_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
}

interface MatrizConsistenciaPanelProps {
  proyecto: { id: number; etapa: string; matrices: MatrizConsistencia[] }
  /** Rol con el que decide el usuario actual: docente de la materia, o comité de evaluación (Director/DTC/Comité). */
  rolDecisor?: 'DOCENTE' | 'COMITE'
  /** El estudiante dueño del proyecto, con permiso de corregir una matriz rechazada y elegir entre varias aprobadas. */
  puedeEditar?: boolean
}

export function MatrizConsistenciaPanel({
  proyecto,
  rolDecisor,
  puedeEditar = false,
}: MatrizConsistenciaPanelProps) {
  const aprobar = useAprobarMatriz()
  const rechazar = useRechazarMatriz()
  const editar = useEditarMatriz()
  const seleccionar = useSeleccionarMatriz()

  const [rechazoDe, setRechazoDe] = useState<MatrizConsistencia | null>(null)
  const [motivo, setMotivo] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState<MatrizInput>({ tema: '', problematica: '', objetivos: '' })

  const matrices = [...proyecto.matrices].sort((a, b) => a.orden - b.orden)
  if (matrices.length === 0) return null

  const aprobadas = matrices.filter((m) => m.estado === 'APROBADA')
  const hayElegida = matrices.some((m) => m.elegida)
  const debeElegir = puedeEditar && !hayElegida && aprobadas.length > 1

  return (
    <section className="rounded-xl border border-outline-variant bg-white p-lg">
      <h3 className="mb-md text-label-md font-bold text-on-surface">
        Matrices de consistencia
      </h3>

      {debeElegir && (
        <div className="mb-md rounded-lg border border-emerald-300 bg-emerald-50 p-md dark:border-emerald-900 dark:bg-emerald-900/20">
          <p className="text-label-md font-bold text-emerald-800 dark:text-emerald-300">
            Tienes más de un tema aprobado por docente y comité. Elige cuál usar para tu proyecto:
          </p>
          <div className="mt-sm flex flex-col gap-sm">
            {aprobadas.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={seleccionar.isPending}
                onClick={() =>
                  seleccionar.mutate(
                    { proyectoId: proyecto.id, matrizId: m.id },
                    { onSuccess: () => toast.success('Tema elegido.') },
                  )
                }
                className="rounded-lg border border-emerald-400 bg-white px-md py-sm text-left text-body-sm hover:bg-emerald-100 disabled:opacity-50 dark:bg-zinc-900 dark:hover:bg-emerald-900/40"
              >
                <span className="font-bold">Matriz {m.orden}:</span> {m.tema}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-md">
        {matrices.map((m) => {
          const editando = editandoId === m.id
          const miDecision = rolDecisor === 'DOCENTE' ? m.decision_docente : m.decision_comite
          const locked = m.elegida && proyecto.etapa !== 'PROPUESTA'
          return (
            <div key={m.id} className="rounded-lg border border-outline-variant p-md">
              <div className="flex items-center justify-between gap-sm">
                <span className="text-label-sm font-bold text-outline">
                  Matriz {m.orden}
                </span>
                <span
                  className={cn(
                    'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase',
                    ESTADO_MATRIZ_STYLES[m.estado],
                  )}
                >
                  {ESTADO_MATRIZ_LABELS[m.estado]}
                </span>
              </div>

              {editando ? (
                <form
                  className="mt-sm space-y-sm"
                  onSubmit={(e) => {
                    e.preventDefault()
                    editar.mutate(
                      { proyectoId: proyecto.id, matrizId: m.id, ...form },
                      {
                        onSuccess: () => {
                          toast.success('Matriz corregida y reenviada.')
                          setEditandoId(null)
                        },
                      },
                    )
                  }}
                >
                  <input
                    value={form.tema}
                    onChange={(e) => setForm((f) => ({ ...f, tema: e.target.value }))}
                    placeholder="Tema"
                    maxLength={255}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                  />
                  <textarea
                    value={form.problematica}
                    onChange={(e) => setForm((f) => ({ ...f, problematica: e.target.value }))}
                    placeholder="Problemática"
                    rows={2}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                  />
                  <textarea
                    value={form.objetivos}
                    onChange={(e) => setForm((f) => ({ ...f, objetivos: e.target.value }))}
                    placeholder="Objetivos"
                    rows={2}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
                  />
                  <div className="flex gap-sm">
                    <button
                      type="button"
                      onClick={() => setEditandoId(null)}
                      className="flex-1 rounded-lg border border-outline-variant py-xs text-label-sm font-bold text-on-surface-variant"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={editar.isPending || !form.tema.trim()}
                      className="flex-1 rounded-lg bg-primary-container py-xs text-label-sm font-bold text-on-primary disabled:opacity-50"
                    >
                      {editar.isPending ? 'Enviando…' : 'Reenviar'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mt-sm text-label-md font-bold text-on-surface">{m.tema}</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant">
                    <span className="font-bold">Problemática: </span>
                    {m.problematica}
                  </p>
                  <p className="mt-xs text-body-sm text-on-surface-variant">
                    <span className="font-bold">Objetivos: </span>
                    {m.objetivos}
                  </p>

                  {m.decision_docente === 'RECHAZADO' && m.motivo_rechazo_docente && (
                    <p className="mt-sm rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
                      <span className="font-bold">Rechazado por Docente: </span>
                      {m.motivo_rechazo_docente}
                    </p>
                  )}
                  {m.decision_comite === 'RECHAZADO' && m.motivo_rechazo_comite && (
                    <p className="mt-sm rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
                      <span className="font-bold">Rechazado por Comité de Evaluación: </span>
                      {m.motivo_rechazo_comite}
                    </p>
                  )}
                  {m.estado === 'RECHAZADA' && m.motivo_rechazo && (
                    <p className="mt-sm rounded-lg bg-surface-container-low p-sm text-body-sm text-on-surface-variant">
                      <span className="font-bold">Nota: </span>
                      {m.motivo_rechazo}
                    </p>
                  )}

                  <div className="mt-sm flex items-center gap-md text-label-sm">
                    <span
                      className={
                        m.decision_docente === 'APROBADO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-outline'
                      }
                    >
                      {m.decision_docente === 'APROBADO' ? '✓' : '—'} Docente
                    </span>
                    <span
                      className={
                        m.decision_comite === 'APROBADO' ? 'text-emerald-600 dark:text-emerald-400' : 'text-outline'
                      }
                    >
                      {m.decision_comite === 'APROBADO' ? '✓' : '—'} Comité de Evaluación
                    </span>
                  </div>

                  <div className="mt-sm flex gap-sm">
                    {rolDecisor && !locked && (
                      <>
                        <button
                          type="button"
                          disabled={aprobar.isPending || miDecision === 'APROBADO'}
                          onClick={() =>
                            aprobar.mutate(
                              { proyectoId: proyecto.id, matrizId: m.id },
                              { onSuccess: () => toast.success('Matriz aprobada.') },
                            )
                          }
                          className="rounded-lg bg-[#10B981] px-md py-xs text-label-sm font-bold text-[#fff] transition-all hover:brightness-110 disabled:opacity-50"
                        >
                          {miDecision === 'APROBADO' ? 'Aprobado ✓' : 'Aprobar'}
                        </button>
                        <button
                          type="button"
                          disabled={miDecision === 'RECHAZADO'}
                          onClick={() => {
                            setRechazoDe(m)
                            setMotivo('')
                          }}
                          className="rounded-lg border border-error px-md py-xs text-label-sm font-bold text-error transition-all hover:bg-error-container disabled:opacity-50"
                        >
                          {miDecision === 'RECHAZADO' ? 'Rechazado ✓' : 'Rechazar'}
                        </button>
                      </>
                    )}
                    {m.estado === 'RECHAZADA' && puedeEditar && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoId(m.id)
                          setForm({ tema: m.tema, problematica: m.problematica, objetivos: m.objetivos })
                        }}
                        className="flex items-center gap-xs rounded-lg border border-primary px-md py-xs text-label-sm font-bold text-primary transition-all hover:bg-primary-container hover:text-on-primary"
                      >
                        <MaterialIcon name="edit" size={16} />
                        Corregir y reenviar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={!!rechazoDe} onOpenChange={(o) => !o && setRechazoDe(null)}>
        <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
          <DialogHeader>
            <DialogTitle className="text-headline-md text-error">
              Rechazar matriz {rechazoDe?.orden}
            </DialogTitle>
            <DialogDescription className="text-body-sm text-on-surface-variant">
              {rechazoDe?.tema}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-md"
            onSubmit={(e) => {
              e.preventDefault()
              if (!rechazoDe) return
              rechazar.mutate(
                { proyectoId: proyecto.id, matrizId: rechazoDe.id, motivo },
                {
                  onSuccess: () => {
                    toast.success('Matriz rechazada.')
                    setRechazoDe(null)
                  },
                },
              )
            }}
          >
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del rechazo"
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setRechazoDe(null)}
                className="flex-1 rounded-xl border border-outline-variant py-sm text-label-md font-bold text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={rechazar.isPending}
                className="flex-1 rounded-xl bg-error py-sm text-label-md font-bold text-on-error disabled:opacity-50"
              >
                {rechazar.isPending ? 'Rechazando…' : 'Rechazar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
