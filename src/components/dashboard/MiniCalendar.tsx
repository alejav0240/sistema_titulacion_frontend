import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { cn } from '#/lib/utils'
import type { EventoCronograma } from '#/types/dashboard'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function MiniCalendar({ eventos = [] }: { eventos?: EventoCronograma[] }) {
  const [month, setMonth] = useState(() => new Date())
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-md">
      <div className="mb-sm flex items-center justify-between">
        <p className="text-label-md font-bold capitalize text-on-surface">
          {format(month, 'MMMM yyyy', { locale: es })}
        </p>
        <div className="flex gap-xs">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="rounded p-xs hover:bg-surface-container-low"
            aria-label="Mes anterior"
          >
            <MaterialIcon name="chevron_left" size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded p-xs hover:bg-surface-container-low"
            aria-label="Mes siguiente"
          >
            <MaterialIcon name="chevron_right" size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((dia, i) => (
          <span key={i} className="text-[10px] font-bold text-outline">
            {dia}
          </span>
        ))}
        {days.map((day) => {
          const hasEvent = eventos.some((evento) =>
            isSameDay(parseISO(evento.fecha_inicio), day),
          )
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'relative flex h-7 items-center justify-center rounded-full text-label-sm',
                !isSameMonth(day, month) && 'text-outline-variant',
                isToday(day) && 'bg-primary-container font-bold text-on-primary',
              )}
            >
              {format(day, 'd')}
              {hasEvent && !isToday(day) && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary-container" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
