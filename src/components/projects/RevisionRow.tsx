import { ESTADO_VERSION_STYLES } from '#/components/projects/StatusBadge'
import { cn } from '#/lib/utils'

const REVISION_STYLES: Record<string, string> = {
  APROBADO: ESTADO_VERSION_STYLES.APROBADO,
  OBSERVADO: ESTADO_VERSION_STYLES.OBSERVADO,
  PENDIENTE: 'bg-surface-container text-on-surface-variant',
}

export function RevisionRow({
  revision,
}: {
  revision: {
    revisor_nombre: string
    estado: 'PENDIENTE' | 'APROBADO' | 'OBSERVADO'
  }
}) {
  return (
    <div className="mt-xs flex items-center justify-between gap-sm">
      <span className="truncate text-label-sm text-on-surface">
        {revision.revisor_nombre}
      </span>
      <span
        className={cn(
          'shrink-0 rounded-full px-sm py-[1px] text-[9px] font-bold uppercase',
          REVISION_STYLES[revision.estado],
        )}
      >
        {revision.estado.toLowerCase()}
      </span>
    </div>
  )
}

/** Fila compacta "Revisión de tutor / Revisión de tribunales" reusada en el
 * detalle del proyecto y en el visor de documento. */
export function RevisionBreakdown({
  revisiones,
}: {
  revisiones: Array<{
    revisor_id: number
    revisor_nombre: string
    rol_revision: 'TUTOR' | 'TRIBUNAL'
    estado: 'PENDIENTE' | 'APROBADO' | 'OBSERVADO'
  }>
}) {
  if (revisiones.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-sm rounded-lg bg-surface-container-lowest p-sm sm:grid-cols-2">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
          Revisión de tutor
        </p>
        {revisiones
          .filter((r) => r.rol_revision === 'TUTOR')
          .map((r) => (
            <RevisionRow key={r.revisor_id} revision={r} />
          ))}
        {revisiones.every((r) => r.rol_revision !== 'TUTOR') && (
          <p className="text-label-sm text-outline">Sin tutor asignado</p>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
          Revisión de tribunales
        </p>
        {revisiones
          .filter((r) => r.rol_revision === 'TRIBUNAL')
          .map((r) => (
            <RevisionRow key={r.revisor_id} revision={r} />
          ))}
        {revisiones.every((r) => r.rol_revision !== 'TRIBUNAL') && (
          <p className="text-label-sm text-outline">Sin tribunales asignados</p>
        )}
      </div>
    </div>
  )
}
