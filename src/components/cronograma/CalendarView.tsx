import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { tipoStyle } from './shared'
import { cn } from '#/lib/utils'
import type { EventoCronograma } from '#/types/dashboard'

export function CalendarView({ month, eventos }: { month: Date; eventos: EventoCronograma[] }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((dia) => (
          <span key={dia} className="py-sm text-center text-[10px] font-bold uppercase tracking-wider text-outline">
            {dia}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const delDia = eventos.filter((evento) => {
            try {
              return isWithinInterval(day, {
                start: parseISO(evento.fecha_inicio),
                end: parseISO(evento.fecha_fin),
              })
            } catch {
              return false
            }
          })
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[92px] border-b border-r border-outline-variant/40 p-xs',
                !isSameMonth(day, month) && 'bg-surface-container-low/50',
                isToday(day) && 'bg-primary-fixed/20',
              )}
            >
              <span
                className={cn(
                  'text-label-sm',
                  isSameMonth(day, month) ? 'text-on-surface' : 'text-outline-variant',
                  isToday(day) &&
                    'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary',
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-xs space-y-[2px]">
                {delDia.slice(0, 2).map((evento) => (
                  <p
                    key={evento.id}
                    title={evento.descripcion}
                    className={cn('truncate rounded px-xs text-[9px] font-bold', tipoStyle(evento.tipo).chip)}
                  >
                    {evento.descripcion}
                  </p>
                ))}
                {delDia.length > 2 && (
                  <p className="text-[9px] text-outline">+{delDia.length - 2} más</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
