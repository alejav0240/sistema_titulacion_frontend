import { Chart } from 'react-google-charts'
import { useTheme } from '#/hooks/useTheme'
import { publicosLabel, gruposLabel, tipoStyle } from './shared'
import type { EventoCronograma } from '#/types/dashboard'

/** Google Charts no lee variables CSS: los colores del tema hay que
 * pasarlos como opciones JS, calcados de los tokens M3 de styles.css. */
const GANTT_THEME = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#1a1c1c',
    gridColor: '#e2e2e2',
    trackFill: '#ffffff',
    trackFillAlt: '#f3f3f3',
    arrowColor: '#877274',
  },
  dark: {
    backgroundColor: '#1b1b1c',
    textColor: '#e4e2e2',
    gridColor: '#3f3a3b',
    trackFill: '#1f1f20',
    trackFillAlt: '#2a2a2b',
    arrowColor: '#a08a8c',
  },
} as const

const COLUMNS = [
  { type: 'string', label: 'ID' },
  { type: 'string', label: 'Actividad' },
  { type: 'string', label: 'Recurso' },
  { type: 'date', label: 'Inicio' },
  { type: 'date', label: 'Fin' },
  { type: 'number', label: 'Duración' },
  { type: 'number', label: '% completado' },
  { type: 'string', label: 'Dependencias' },
] as const

const ROW_HEIGHT = 42

/** Gantt con react-google-charts (tipo "Gantt" nativo). */
export function GanttView({ eventos }: { eventos: EventoCronograma[] }) {
  const { theme } = useTheme()
  const colors = GANTT_THEME[theme]

  if (eventos.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-white p-lg">
        <p className="py-lg text-center text-body-sm text-outline">
          No hay eventos para mostrar.
        </p>
      </div>
    )
  }

  const ordered = [...eventos].sort(
    (a, b) => +new Date(a.fecha_inicio) - +new Date(b.fecha_inicio),
  )

  const rows = ordered.map((evento) => [
    String(evento.id),
    evento.descripcion,
    tipoStyle(evento.tipo).label,
    new Date(`${evento.fecha_inicio}T00:00:00`),
    new Date(`${evento.fecha_fin}T00:00:00`),
    null,
    0,
    null,
  ])

  const height = ordered.length * ROW_HEIGHT + 60

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white p-lg">
      <Chart
        key={theme}
        chartType="Gantt"
        chartPackages={['corechart', 'controls', 'gantt']}
        width="100%"
        height={`${height}px`}
        columns={[...COLUMNS]}
        rows={rows}
        options={{
          backgroundColor: colors.backgroundColor,
          gantt: {
            trackHeight: ROW_HEIGHT,
            criticalPathEnabled: false,
            labelStyle: {
              fontName: 'Inter',
              fontSize: 12,
              color: colors.textColor,
            },
            innerGridHorizLine: { stroke: colors.gridColor, strokeWidth: 1 },
            innerGridTrack: { fill: colors.trackFill },
            innerGridDarkTrack: { fill: colors.trackFillAlt },
            arrow: { color: colors.arrowColor },
          },
        }}
        legendToggle={false}
      />
      <ul className="mt-md space-y-[2px]">
        {ordered.map((evento) => (
          <li key={evento.id} className="truncate text-[10px] text-outline">
            <span className="font-bold text-on-surface-variant">{evento.descripcion}</span>
            {' · '}
            {publicosLabel(evento)} · {gruposLabel(evento)}
          </li>
        ))}
      </ul>
    </div>
  )
}
