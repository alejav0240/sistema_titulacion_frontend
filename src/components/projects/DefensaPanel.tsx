import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import {
  useActualizarDefensa,
  useDefensa,
  useProgramarDefensa,
} from '#/hooks/useProjects'
import { formatDateTime } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import {
  ESTADO_DEFENSA_LABELS,
  RESULTADO_DEFENSA_LABELS,
} from '#/types/project'
import type { Defensa } from '#/types/project'

const inputClass =
  'w-full rounded-lg border border-outline-variant px-md py-sm text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container'

const ESTADO_CHIP: Record<string, string> = {
  PROGRAMADA: 'bg-secondary-container text-on-secondary-container',
  REALIZADA: 'bg-[#D1FAE5] text-[#065F46]',
  CANCELADA: 'bg-error-container text-on-error-container',
}

export function DefensaPanel({
  proyectoId,
  isAdmin,
  tieneVersionAprobada,
}: {
  proyectoId: number
  isAdmin: boolean
  tieneVersionAprobada: boolean
}) {
  const defensa = useDefensa(proyectoId)
  const [modal, setModal] = useState<'programar' | 'resultado' | null>(null)

  const data = defensa.data ?? null

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="mb-md flex items-center justify-between">
        <h3 className="flex items-center gap-sm text-label-md font-bold text-on-surface">
          <MaterialIcon name="gavel" size={20} className="text-primary" />
          Defensa
        </h3>
        {data && (
          <span
            className={cn(
              'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase tracking-wider',
              ESTADO_CHIP[data.estado],
            )}
          >
            {ESTADO_DEFENSA_LABELS[data.estado]}
          </span>
        )}
      </div>

      {defensa.isLoading ? (
        <p className="text-body-sm text-outline">Cargando…</p>
      ) : !data ? (
        <div className="space-y-sm">
          <p className="text-body-sm text-on-surface-variant">
            Este proyecto aún no tiene defensa programada.
          </p>
          {isAdmin && (
            <>
              {!tieneVersionAprobada && (
                <p className="rounded-lg bg-surface-container p-sm text-label-sm text-outline">
                  Se necesita al menos una versión aprobada para programarla.
                </p>
              )}
              <button
                type="button"
                disabled={!tieneVersionAprobada}
                onClick={() => setModal('programar')}
                className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
              >
                <MaterialIcon name="event" size={18} />
                Programar defensa
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-sm">
          <InfoRow icon="calendar_month" label="Fecha y hora">
            {formatDateTime(data.fecha_hora)}
          </InfoRow>
          {data.lugar && (
            <InfoRow icon="location_on" label="Lugar">
              {data.lugar}
            </InfoRow>
          )}
          {data.tribunal.length > 0 && (
            <InfoRow icon="groups" label="Tribunal">
              {data.tribunal.map((t) => t.nombre).join(', ')}
            </InfoRow>
          )}
          {data.estado === 'REALIZADA' && (
            <div className="rounded-lg bg-surface-container-low p-md">
              <p className="text-label-sm uppercase tracking-wider text-outline">
                Resultado
              </p>
              <p className="mt-xs text-headline-md font-bold text-primary">
                {data.calificacion ?? '—'}
                <span className="text-body-sm font-normal text-on-surface-variant">
                  {' '}
                  / 100
                </span>
              </p>
              <p className="text-label-md text-on-surface">
                {RESULTADO_DEFENSA_LABELS[data.resultado] ?? '—'}
              </p>
              {data.acta_url && (
                <a
                  href={data.acta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-sm inline-flex items-center gap-xs text-label-md text-primary hover:underline"
                >
                  <MaterialIcon name="description" size={16} />
                  Ver acta de defensa
                </a>
              )}
            </div>
          )}
          {data.observaciones && (
            <p className="rounded-lg bg-surface-container p-sm text-body-sm text-on-surface-variant">
              {data.observaciones}
            </p>
          )}
          {isAdmin && data.estado === 'PROGRAMADA' && (
            <div className="flex gap-sm pt-xs">
              <button
                type="button"
                onClick={() => setModal('resultado')}
                className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
              >
                <MaterialIcon name="grading" size={18} />
                Registrar resultado
              </button>
              <button
                type="button"
                onClick={() => setModal('programar')}
                className="flex items-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-label-md text-on-surface-variant transition-colors hover:text-primary"
              >
                <MaterialIcon name="edit_calendar" size={18} />
                Reprogramar
              </button>
            </div>
          )}
        </div>
      )}

      <DefensaModal
        proyectoId={proyectoId}
        mode={modal}
        defensa={data}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-sm">
      <MaterialIcon name={icon} size={18} className="mt-[2px] text-outline" />
      <div>
        <p className="text-label-sm uppercase tracking-wider text-outline">
          {label}
        </p>
        <p className="text-body-sm text-on-surface">{children}</p>
      </div>
    </div>
  )
}

function toLocalInput(iso: string | undefined) {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function DefensaModal({
  proyectoId,
  mode,
  defensa,
  onClose,
}: {
  proyectoId: number
  mode: 'programar' | 'resultado' | null
  defensa: Defensa | null
  onClose: () => void
}) {
  const programar = useProgramarDefensa()
  const actualizar = useActualizarDefensa()

  const [fecha, setFecha] = useState('')
  const [lugar, setLugar] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [calificacion, setCalificacion] = useState('')
  const [resultado, setResultado] = useState('APROBADO')
  const [actaUrl, setActaUrl] = useState('')

  useEffect(() => {
    if (!mode) return
    setFecha(toLocalInput(defensa?.fecha_hora))
    setLugar(defensa?.lugar ?? '')
    setObservaciones(defensa?.observaciones ?? '')
    setCalificacion(defensa?.calificacion ?? '')
    setResultado(defensa?.resultado || 'APROBADO')
    setActaUrl(defensa?.acta_url ?? '')
  }, [mode, defensa])

  const isPending = programar.isPending || actualizar.isPending

  const submit = () => {
    if (mode === 'programar') {
      const payload = {
        proyectoId,
        fecha_hora: new Date(fecha).toISOString(),
        lugar,
        observaciones,
      }
      const action = defensa ? actualizar : programar
      action.mutate(payload, {
        onSuccess: () => {
          toast.success(
            defensa ? 'Defensa reprogramada.' : 'Defensa programada. Se notificó al estudiante y al tribunal.',
          )
          onClose()
        },
      })
    } else {
      actualizar.mutate(
        {
          proyectoId,
          estado: 'REALIZADA',
          calificacion,
          resultado,
          acta_url: actaUrl,
          observaciones,
        },
        {
          onSuccess: () => {
            toast.success('Resultado de la defensa registrado.')
            onClose()
          },
        },
      )
    }
  }

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[32rem] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">
            {mode === 'programar'
              ? defensa
                ? 'Reprogramar defensa'
                : 'Programar defensa'
              : 'Registrar resultado de defensa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'programar'
              ? 'El estudiante y el tribunal serán notificados.'
              : 'Al registrar un resultado aprobatorio el proyecto se marcará como concluido.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-md py-2">
          {mode === 'programar' && (
            <>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant" htmlFor="fecha">
                  Fecha y hora
                </label>
                <input
                  id="fecha"
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant" htmlFor="lugar">
                  Lugar
                </label>
                <input
                  id="lugar"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Auditorio Principal / Virtual: <link>"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {mode === 'resultado' && (
            <>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant" htmlFor="nota">
                    Calificación (0–100)
                  </label>
                  <input
                    id="nota"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant" htmlFor="resultado">
                    Resultado
                  </label>
                  <select
                    id="resultado"
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                    className={inputClass}
                  >
                    {Object.entries(RESULTADO_DEFENSA_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant" htmlFor="acta">
                  Link del acta (Google Drive, opcional)
                </label>
                <input
                  id="acta"
                  value={actaUrl}
                  onChange={(e) => setActaUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/…"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="obs">
              Observaciones (opcional)
            </label>
            <textarea
              id="obs"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={
              isPending ||
              (mode === 'programar' && !fecha) ||
              (mode === 'resultado' && !calificacion)
            }
            onClick={submit}
          >
            {isPending
              ? 'Guardando…'
              : mode === 'programar'
                ? 'Guardar'
                : 'Registrar resultado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
