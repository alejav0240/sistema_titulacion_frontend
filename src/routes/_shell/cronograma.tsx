import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
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
import { z } from 'zod'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { authStore } from '#/hooks/useAuthStore'
import { useProjects } from '#/hooks/useProjects'
import { useCreateEvento, useDeleteEvento, useSchedules } from '#/hooks/useSchedules'
import { formatDate } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import { ETAPAS, ETAPA_LABELS } from '#/types/project'
import type { EventoCronograma } from '#/types/dashboard'

export const Route = createFileRoute('/_shell/cronograma')({
  validateSearch: z.object({
    vista: z.enum(['calendario', 'timeline', 'gantt']).optional(),
  }),
  component: CronogramaPage,
})

const TIPO_STYLES: Record<string, { chip: string; label: string }> = {
  ENTREGA: { chip: 'bg-error-container text-on-error-container', label: 'Fecha límite' },
  REVISION: { chip: 'bg-[#FEF3C7] text-[#92400E]', label: 'Revisión' },
  DEFENSA: { chip: 'bg-secondary-container text-on-secondary-container', label: 'Defensa' },
  ADMINISTRATIVO: { chip: 'bg-surface-container text-on-surface-variant', label: 'Administrativo' },
}

const TIPO_DOTS: Record<string, string> = {
  ENTREGA: 'bg-error',
  REVISION: 'bg-[#F59E0B]',
  DEFENSA: 'bg-secondary',
  ADMINISTRATIVO: 'bg-outline',
}

function CronogramaPage() {
  const { vista = 'calendario' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const user = useStore(authStore, (s) => s.user)
  const isDirector = user?.rol === 'DIRECTOR' || user?.rol === 'DTC'

  const [month, setMonth] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const schedules = useSchedules()
  const eventos = schedules.data ?? []

  const tabs = [
    ['calendario', 'calendar_month', 'Calendario'],
    ['timeline', 'view_timeline', 'Timeline'],
    ...(isDirector ? [['gantt', 'align_horizontal_left', 'Gantt']] : []),
  ] as const

  const proximos = eventos
    .filter((evento) => new Date(evento.fecha_fin) >= new Date())
    .slice(0, 5)

  return (
    <div className="space-y-lg">
      <div className="flex flex-col justify-between gap-md md:flex-row md:items-center">
        <div className="flex rounded-lg border border-outline-variant bg-surface-container-low p-xs">
          {tabs.map(([key, icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                navigate({ search: { vista: key as never }, replace: true })
              }
              className={cn(
                'flex items-center gap-xs rounded-md px-md py-sm text-label-md transition-all',
                vista === key
                  ? 'bg-white font-bold text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary',
              )}
            >
              <MaterialIcon name={icon} size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-sm">
          {vista === 'calendario' && (
            <>
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                className="rounded-lg border border-outline-variant p-sm hover:bg-surface-container-low"
                aria-label="Mes anterior"
              >
                <MaterialIcon name="chevron_left" size={18} />
              </button>
              <span className="min-w-32 text-center text-label-md font-bold capitalize text-on-surface">
                {format(month, 'MMMM yyyy', { locale: es })}
              </span>
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="rounded-lg border border-outline-variant p-sm hover:bg-surface-container-low"
                aria-label="Mes siguiente"
              >
                <MaterialIcon name="chevron_right" size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMonth(new Date())}
                className="rounded-lg border border-outline-variant px-md py-sm text-label-md hover:bg-surface-container-low"
              >
                Hoy
              </button>
            </>
          )}
          {isDirector && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
            >
              <MaterialIcon name="add" size={18} />
              Añadir
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-4">
        <div className="xl:col-span-3">
          {vista === 'calendario' && (
            <CalendarView month={month} eventos={eventos} />
          )}
          {vista === 'timeline' && (
            <TimelineView
              eventos={eventos}
              isDirector={isDirector}
            />
          )}
          {vista === 'gantt' && isDirector && <GanttView />}
        </div>

        {/* Próximos eventos */}
        <aside className="space-y-md">
          <h3 className="text-label-sm font-bold uppercase tracking-wider text-outline">
            Próximos eventos
          </h3>
          {proximos.map((evento) => {
            const estilo = TIPO_STYLES[evento.tipo] ?? TIPO_STYLES.ADMINISTRATIVO
            return (
              <div
                key={evento.id}
                className="rounded-xl border border-outline-variant bg-white p-md"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'rounded px-xs py-[2px] text-[9px] font-bold uppercase tracking-wider',
                      estilo.chip,
                    )}
                  >
                    {estilo.label}
                  </span>
                  <span className="text-label-sm text-outline">
                    {formatDate(evento.fecha_inicio)}
                  </span>
                </div>
                <p className="mt-xs text-label-md font-bold text-on-surface">
                  {evento.descripcion}
                </p>
                <p className="text-label-sm text-outline">
                  {evento.publico_objetivo === 'TODOS'
                    ? 'Todos'
                    : evento.publico_objetivo === 'ESTUDIANTES'
                      ? 'Estudiantes'
                      : 'Docentes'}
                </p>
              </div>
            )
          })}
          {proximos.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant p-md text-center text-body-sm text-outline">
              Sin eventos próximos.
            </p>
          )}
        </aside>
      </div>

      <NuevoEventoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function CalendarView({
  month,
  eventos,
}: {
  month: Date
  eventos: EventoCronograma[]
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((dia) => (
          <span
            key={dia}
            className="py-sm text-center text-[10px] font-bold uppercase tracking-wider text-outline"
          >
            {dia}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const delDia = eventos.filter((evento) =>
            isSameDay(parseISO(evento.fecha_inicio), day),
          )
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
                  isSameMonth(day, month)
                    ? 'text-on-surface'
                    : 'text-outline-variant',
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
                    className={cn(
                      'truncate rounded px-xs text-[9px] font-bold',
                      (TIPO_STYLES[evento.tipo] ?? TIPO_STYLES.ADMINISTRATIVO).chip,
                    )}
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

function TimelineView({
  eventos,
  isDirector,
}: {
  eventos: EventoCronograma[]
  isDirector: boolean
}) {
  const deleteEvento = useDeleteEvento()
  const ordered = [...eventos].sort(
    (a, b) => +new Date(a.fecha_inicio) - +new Date(b.fecha_inicio),
  )

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-lg">
      <div className="relative space-y-lg">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-outline-variant" />
        {ordered.map((evento) => {
          const estilo = TIPO_STYLES[evento.tipo] ?? TIPO_STYLES.ADMINISTRATIVO
          return (
            <div key={evento.id} className="relative flex gap-md">
              <span
                className={cn(
                  'z-10 mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white',
                  TIPO_DOTS[evento.tipo] ?? 'bg-outline',
                )}
              />
              <div className="flex flex-1 items-start justify-between gap-md">
                <div>
                  <div className="flex items-center gap-sm">
                    <p className="text-label-md font-bold text-on-surface">
                      {evento.descripcion}
                    </p>
                    <span
                      className={cn(
                        'rounded px-xs py-[1px] text-[9px] font-bold uppercase tracking-wider',
                        estilo.chip,
                      )}
                    >
                      {estilo.label}
                    </span>
                  </div>
                  <p className="text-label-sm text-outline">
                    {formatDate(evento.fecha_inicio)}
                    {evento.fecha_fin !== evento.fecha_inicio &&
                      ` → ${formatDate(evento.fecha_fin)}`}{' '}
                    · {evento.publico_objetivo.toLowerCase()}
                  </p>
                </div>
                {isDirector && (
                  <button
                    type="button"
                    onClick={() => deleteEvento.mutate(evento.id)}
                    title="Eliminar evento"
                    className="rounded p-xs text-outline transition-colors hover:text-error"
                  >
                    <MaterialIcon name="delete" size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {ordered.length === 0 && (
          <p className="py-lg text-center text-body-sm text-outline">
            No hay eventos registrados.
          </p>
        )}
      </div>
    </div>
  )
}

function GanttView() {
  const projects = useProjects({ page_size: 100 })
  const proyectos = projects.data?.results ?? []

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white p-lg">
      <div
        className="grid min-w-[640px] items-center gap-y-sm"
        style={{ gridTemplateColumns: '180px repeat(5, 1fr)' }}
      >
        <span />
        {ETAPAS.map((etapa) => (
          <span
            key={etapa}
            className="pb-sm text-center text-[10px] font-bold uppercase tracking-wider text-outline"
          >
            {ETAPA_LABELS[etapa]}
          </span>
        ))}
        {proyectos.map((proyecto) => {
          const idx = ETAPAS.indexOf(proyecto.etapa)
          return (
            <div key={proyecto.id} className="contents">
              <div className="min-w-0 pr-md">
                <p className="truncate text-label-sm font-bold text-on-surface">
                  {proyecto.estudiante_nombre}
                </p>
                <p className="truncate text-[10px] text-outline">
                  {proyecto.titulo}
                </p>
              </div>
              <div
                className="col-span-5 grid h-5 overflow-hidden rounded-full bg-surface-container"
                style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
              >
                <div
                  className="rounded-full bg-gradient-to-r from-primary to-primary-container"
                  style={{ gridColumn: `1 / ${idx + 2}` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {proyectos.length === 0 && (
        <p className="py-lg text-center text-body-sm text-outline">
          No hay proyectos para mostrar.
        </p>
      )}
    </div>
  )
}

function NuevoEventoModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('ENTREGA')
  const [publico, setPublico] = useState('TODOS')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const create = useCreateEvento()

  const inputClass =
    'h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Nuevo evento del cronograma
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            El evento será visible para el público objetivo seleccionado.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!descripcion.trim() || !fechaInicio) return
            create.mutate(
              {
                descripcion: descripcion.trim(),
                tipo,
                publico_objetivo: publico,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin || fechaInicio,
                semestre: 1,
              },
              {
                onSuccess: () => {
                  setDescripcion('')
                  setFechaInicio('')
                  setFechaFin('')
                  onClose()
                },
              },
            )
          }}
        >
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="e-desc">
              Descripción
            </label>
            <input
              id="e-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Entrega Propuesta Tesis"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-tipo">
                Tipo
              </label>
              <select
                id="e-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className={inputClass}
              >
                <option value="ENTREGA">Entrega</option>
                <option value="REVISION">Revisión</option>
                <option value="DEFENSA">Defensa</option>
                <option value="ADMINISTRATIVO">Administrativo</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-pub">
                Público
              </label>
              <select
                id="e-pub"
                value={publico}
                onChange={(e) => setPublico(e.target.value)}
                className={inputClass}
              >
                <option value="TODOS">Todos</option>
                <option value="ESTUDIANTES">Estudiantes</option>
                <option value="DOCENTES">Docentes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-inicio">
                Fecha inicio
              </label>
              <input
                id="e-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-fin">
                Fecha fin (opcional)
              </label>
              <input
                id="e-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {create.isError && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              No se pudo crear el evento.
            </p>
          )}
          <div className="flex justify-end gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-lg py-sm text-label-md text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={create.isPending || !descripcion.trim() || !fechaInicio}
              className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {create.isPending ? 'Creando…' : 'Crear evento'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
