import { Chart } from 'react-google-charts'
import { publicosLabel, gruposLabel, tipoStyle } from './shared'
import type { EventoCronograma } from '#/types/dashboard'

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
        chartType="Gantt"
        chartPackages={['gantt']}
        width="100%"
        height={`${height}px`}
        columns={[...COLUMNS]}
        rows={rows}
        options={{
          gantt: {
            trackHeight: ROW_HEIGHT,
            criticalPathEnabled: false,
            labelStyle: { fontName: 'Inter', fontSize: 12 },
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
