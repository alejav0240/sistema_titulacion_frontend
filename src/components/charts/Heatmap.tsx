import { cn } from '#/lib/utils'

function intensity(value: number, max: number): string {
  if (max === 0 || value === 0) return 'bg-surface-container'
  const ratio = value / max
  if (ratio < 0.25) return 'bg-[#dac0c2]'
  if (ratio < 0.5) return 'bg-[#b06a78]'
  if (ratio < 0.75) return 'bg-[#8a3a4b]'
  return 'bg-[#6b1d2f]'
}

/** Heatmap CSS-grid en escala guindo (carga docente / actividad por hora). */
export function Heatmap({
  rows,
  rowLabels,
  className,
}: {
  rows: number[][]
  rowLabels?: string[]
  className?: string
}) {
  const max = Math.max(0, ...rows.flat())

  return (
    <div className={cn('space-y-1', className)}>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-sm">
          {rowLabels && (
            <span className="w-28 shrink-0 truncate text-label-sm text-on-surface-variant">
              {rowLabels[i]}
            </span>
          )}
          <div className="flex flex-1 gap-1">
            {row.map((value, j) => (
              <div
                key={j}
                title={String(value)}
                className={cn(
                  'h-5 flex-1 rounded-[3px] transition-colors',
                  intensity(value, max),
                )}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-xs pt-xs">
        <span className="text-[10px] text-outline">Menos</span>
        {['bg-surface-container', 'bg-[#dac0c2]', 'bg-[#b06a78]', 'bg-[#8a3a4b]', 'bg-[#6b1d2f]'].map(
          (color) => (
            <span key={color} className={cn('h-3 w-3 rounded-[2px]', color)} />
          ),
        )}
        <span className="text-[10px] text-outline">Más</span>
      </div>
    </div>
  )
}
