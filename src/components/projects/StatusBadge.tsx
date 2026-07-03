import { cn } from '#/lib/utils'
import { ESTADO_REVISION_LABELS } from '#/types/project'
import type { EstadoRevision } from '#/types/project'

export const ESTADO_VERSION_STYLES: Record<EstadoRevision, string> = {
  BORRADOR: 'bg-surface-container text-on-surface-variant',
  'EN REVISION': 'bg-secondary-container text-on-secondary-container',
  OBSERVADO: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  APROBADO:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}
const STYLES = ESTADO_VERSION_STYLES

export function StatusBadge({
  estado,
  className,
}: {
  estado: EstadoRevision
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-sm py-[2px] text-[10px] font-bold uppercase tracking-wider',
        STYLES[estado] ?? STYLES.BORRADOR,
        className,
      )}
    >
      {ESTADO_REVISION_LABELS[estado] ?? estado}
    </span>
  )
}
