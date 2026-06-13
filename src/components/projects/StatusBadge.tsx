import { cn } from '#/lib/utils'
import { ESTADO_REVISION_LABELS } from '#/types/project'
import type { EstadoRevision } from '#/types/project'

const STYLES: Record<EstadoRevision, string> = {
  BORRADOR: 'bg-surface-container text-on-surface-variant',
  'EN REVISION': 'bg-secondary-container text-on-secondary-container',
  OBSERVADO: 'bg-[#FEF3C7] text-[#92400E]',
  APROBADO: 'bg-[#D1FAE5] text-[#065F46]',
}

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
