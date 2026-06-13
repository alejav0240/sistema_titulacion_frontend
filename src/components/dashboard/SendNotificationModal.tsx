import { useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useSendNotification } from '#/hooks/useNotifications'
import { cn } from '#/lib/utils'

export interface Destinatario {
  id: number
  nombre: string
}

/** Modal "Envío de Notificación Personalizada" (pantalla 03df1d3a). */
export function SendNotificationModal({
  open,
  onClose,
  destinatarios,
}: {
  open: boolean
  onClose: () => void
  destinatarios: Destinatario[]
}) {
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const send = useSendNotification()

  const toggle = (id: number) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const reset = () => {
    setSeleccionados([])
    setAsunto('')
    setMensaje('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Enviar Notificación Personalizada
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            El mensaje llegará al centro de notificaciones de los destinatarios.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!seleccionados.length || !asunto.trim() || !mensaje.trim()) return
            send.mutate(
              {
                destinatarios: seleccionados,
                titulo: asunto.trim(),
                mensaje: mensaje.trim(),
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
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant">Para</label>
            <div className="thin-scrollbar flex max-h-32 flex-wrap gap-xs overflow-y-auto rounded-xl border border-outline-variant p-sm">
              {destinatarios.map((destinatario) => (
                <button
                  key={destinatario.id}
                  type="button"
                  onClick={() => toggle(destinatario.id)}
                  className={cn(
                    'rounded-full border px-sm py-xs text-label-sm transition-all',
                    seleccionados.includes(destinatario.id)
                      ? 'border-primary-container bg-primary-container text-on-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary',
                  )}
                >
                  {destinatario.nombre}
                </button>
              ))}
              {destinatarios.length === 0 && (
                <p className="text-body-sm text-outline">
                  No tienes estudiantes asignados.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="asunto">
              Asunto
            </label>
            <input
              id="asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Recordatorio de entrega"
              className="h-[44px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="mensaje">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              placeholder="Escribe el contenido de la notificación..."
              className="resize-none rounded-xl border border-outline-variant bg-surface-container-lowest p-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div
            title="La integración con WhatsApp aún no está disponible"
            className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-outline-variant bg-surface-container-low/50 p-sm opacity-70"
          >
            <span className="flex items-center gap-sm text-body-sm text-on-surface-variant">
              <MaterialIcon name="chat" size={18} className="text-[#25D366]" />
              Enviar también por WhatsApp
              <span className="rounded-full bg-surface-container-highest px-sm py-[2px] text-[9px] font-bold uppercase tracking-wider text-outline">
                Próximamente
              </span>
            </span>
            <span className="relative h-5 w-9 rounded-full bg-surface-container-highest">
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </span>
          </div>

          {send.isError && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              No se pudo enviar la notificación.
            </p>
          )}

          <button
            type="submit"
            disabled={
              send.isPending ||
              !seleccionados.length ||
              !asunto.trim() ||
              !mensaje.trim()
            }
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-[#16A34A] text-label-md font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="send" size={18} />
            {send.isPending ? 'Enviando…' : 'Enviar notificación'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
