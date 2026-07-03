import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { addMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { z } from 'zod'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { CsvImportModal } from '#/components/ui/CsvImportModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { CalendarView } from '#/components/cronograma/CalendarView'
import { TimelineView } from '#/components/cronograma/TimelineView'
import { GanttView } from '#/components/cronograma/GanttView'
import { TableView } from '#/components/cronograma/TableView'
import { NuevoEventoModal } from '#/components/cronograma/NuevoEventoModal'
import { publicosLabel, tipoStyle } from '#/components/cronograma/shared'
import { authStore } from '#/hooks/useAuthStore'
import {
  downloadCronogramaExport,
  useImportCronograma,
  useSchedules,
} from '#/hooks/useSchedules'
import { formatDate } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { EventoCronograma } from '#/types/dashboard'

export const Route = createFileRoute('/_shell/cronograma')({
  validateSearch: z.object({
    vista: z.enum(['calendario', 'timeline', 'gantt', 'tabla']).optional(),
  }),
  component: CronogramaPage,
})

function CronogramaPage() {
  const { vista = 'calendario' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const user = useStore(authStore, (s) => s.user)
  const isAdmin = user?.rol === 'DIRECTOR' || user?.rol === 'DTC'
  // TUTOR y TRIBUNAL son solo lectura en el cronograma
  const canCreate = isAdmin || user?.rol === 'DOCENTE'

  const [month, setMonth] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<EventoCronograma | null>(null)
  const schedules = useSchedules()
  const importCronograma = useImportCronograma()
  const eventos = schedules.data ?? []

  const canEditEvento = (evento: EventoCronograma) =>
    isAdmin || (canCreate && evento.creado_por_id === (user?.id ?? -1))

  const tabs = [
    ['calendario', 'calendar_month', 'Calendario'],
    ['timeline', 'view_timeline', 'Timeline'],
    ['gantt', 'align_horizontal_left', 'Gantt'],
    ['tabla', 'table_rows', 'Tabla'],
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
              onClick={() => navigate({ search: { vista: key as never }, replace: true })}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-xs rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md text-on-surface transition-all hover:bg-surface-container-low"
              >
                <MaterialIcon name="ios_share" size={18} />
                Exportar
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadCronogramaExport('xlsx')}>
                <MaterialIcon name="table_view" size={18} />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCronogramaExport('pdf')}>
                <MaterialIcon name="picture_as_pdf" size={18} />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canCreate && (
            <>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-xs rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md text-on-surface-variant transition-colors hover:text-primary"
              >
                <MaterialIcon name="upload_file" size={18} />
                Importar
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
              >
                <MaterialIcon name="add" size={18} />
                Añadir
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-4">
        <div className="xl:col-span-3">
          {schedules.isLoading ? (
            <p className="py-xl text-center text-body-sm text-outline">
              Cargando cronograma…
            </p>
          ) : (
            <>
          {vista === 'calendario' && <CalendarView month={month} eventos={eventos} />}
          {vista === 'timeline' && (
            <TimelineView
              eventos={eventos}
              currentUserId={user?.id ?? null}
              isAdmin={isAdmin}
              onEdit={setEditingEvento}
            />
          )}
          {vista === 'gantt' && <GanttView eventos={eventos} />}
          {vista === 'tabla' && (
            <TableView
              eventos={eventos}
              canCreate={canCreate}
              canEdit={canEditEvento}
              onEdit={setEditingEvento}
            />
          )}
            </>
          )}
        </div>

        {/* Próximos eventos */}
        <aside className="space-y-md">
          <h3 className="text-label-sm font-bold uppercase tracking-wider text-outline">
            Próximos eventos
          </h3>
          {proximos.map((evento) => {
            const estilo = tipoStyle(evento.tipo)
            return (
              <div
                key={evento.id}
                className="rounded-xl border border-outline-variant bg-white p-md"
              >
                <div className="flex items-center justify-between">
                  <span className={cn('rounded px-xs py-[2px] text-[9px] font-bold uppercase tracking-wider', estilo.chip)}>
                    {estilo.label}
                  </span>
                  <span className="text-label-sm text-outline">{formatDate(evento.fecha_inicio)}</span>
                </div>
                <p className="mt-xs text-label-md font-bold text-on-surface">{evento.descripcion}</p>
                <p className="text-label-sm text-outline">{publicosLabel(evento)}</p>
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
      <NuevoEventoModal
        open={!!editingEvento}
        onClose={() => setEditingEvento(null)}
        evento={editingEvento ?? undefined}
      />

      <CsvImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importar Actividades"
        columns={['descripcion', 'tipo', 'grupos', 'publicos', 'fechainicio', 'fechafin']}
        exampleRows={[
          'ENTREGA PROPUESTA,ENTREGA,GRUPO A|GRUPO B,ESTUDIANTES,2026-08-01,2026-08-05',
          'DEFENSA FINAL,DEFENSA,,DOCENTES|ESTUDIANTES,2026-11-20,2026-11-20',
        ]}
        helpText="Separa varios grupos/públicos con | o ;. Vacíos = todos. Fechas en formato YYYY-MM-DD. Públicos válidos: ESTUDIANTES, DOCENTES, TUTORES, TRIBUNALES."
        onImport={async (file) => {
          const result = await importCronograma.mutateAsync(file)
          const partes = [`${result.creados} creados`]
          if (result.errors.length) partes.push(`${result.errors.length} errores`)
          toast.info(partes.join(', ') + '.')
        }}
        pending={importCronograma.isPending}
      />
    </div>
  )
}
