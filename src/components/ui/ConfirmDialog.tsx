import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[26rem]">
        <DialogHeader>
          <DialogTitle className={destructive ? 'text-headline-md text-error' : 'text-headline-md text-primary'}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-outline-variant py-sm text-label-md font-bold text-on-surface-variant"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={
              destructive
                ? 'flex-1 rounded-xl bg-error py-sm text-label-md font-bold text-on-error disabled:opacity-50'
                : 'flex-1 rounded-xl bg-primary py-sm text-label-md font-bold text-[#fff] disabled:opacity-50'
            }
          >
            {pending ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
