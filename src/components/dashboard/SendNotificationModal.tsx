import { useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { UserSearchCombobox } from '#/components/ui/UserSearchCombobox'
import { useSendNotification } from '#/hooks/useNotifications'
import { cn } from '#/lib/utils'

const ROLES_FILTRO = [
  ['', 'Todos'],
  ['ESTUDIANTE', 'Estudiantes'],
  ['DOCENTE', 'Docentes'],
  ['TUTOR', 'Tutores'],
  ['TRIBUNAL', 'Tribunales'],
] as const

/** Envío manual de notificaciones a cualquier usuario, con buscador estilo Teams. */
export function SendNotificationModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [seleccionados, setSeleccionados] = useState<Array<{ id: number; nombre: string }>>([])
  const [rolFiltro, setRolFiltro] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const send = useSendNotification()

  const reset = () => {
    setSeleccionados([])
    setAsunto('')
    setMensaje('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[32rem]">
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
                destinatarios: seleccionados.map((s) => s.id),
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

            {/* Filtro por rol */}
            <div className="flex flex-wrap gap-xs">
              {ROLES_FILTRO.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRolFiltro(value)}
                  className={cn(
                    'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase tracking-wider transition-all',
                    rolFiltro === value
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <UserSearchCombobox
              roles={rolFiltro || undefined}
              excludeIds={seleccionados.map((s) => s.id)}
              placeholder="Buscar usuario por nombre o email…"
              onSelect={(usuario) =>
                setSeleccionados((prev) => [...prev, { id: usuario.id, nombre: usuario.nombre }])
              }
            />

            {/* Chips de seleccionados */}
            {seleccionados.length > 0 && (
              <div className="flex flex-wrap gap-xs">
                {seleccionados.map((sel) => (
                  <span
                    key={sel.id}
                    className="flex items-center gap-xs rounded-full bg-primary-container px-sm py-xs text-label-sm text-on-primary"
                  >
                    {sel.nombre}
                    <button
                      type="button"
                      onClick={() =>
                        setSeleccionados((prev) => prev.filter((s) => s.id !== sel.id))
                      }
                      aria-label={`Quitar ${sel.nombre}`}
                      className="hover:opacity-70"
                    >
                      <MaterialIcon name="close" size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-[#16A34A] text-label-md font-bold text-[#fff] transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="send" size={18} />
            {send.isPending ? 'Enviando…' : 'Enviar notificación'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
