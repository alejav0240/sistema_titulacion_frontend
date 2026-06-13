import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { Heatmap } from '#/components/charts/Heatmap'
import { ClientOnly } from '#/components/ui/ClientOnly'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useAnalytics, useExportReport } from '#/hooks/useReports'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_shell/admin/reportes')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <ReportesPage />
    </AuthGuard>
  )
}

function ReportesPage() {
  const analytics = useAnalytics()
  const [exportOpen, setExportOpen] = useState(false)
  const data = analytics.data

  if (analytics.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">
        Calculando analíticas…
      </p>
    )
  }

  const kpis = [
    {
      label: 'Tasa de aprobación',
      value: `${data?.kpis.tasa_aprobacion ?? 0}%`,
      icon: 'trending_up',
    },
    {
      label: 'Tiempo prom. resolución',
      value: `${data?.kpis.tiempo_resolucion_dias ?? 0} días`,
      icon: 'schedule',
    },
    {
      label: 'Obs. resueltas',
      value: `${data?.kpis.obs_resueltas_pct ?? 0}%`,
      icon: 'task_alt',
    },
    {
      label: 'Observaciones totales',
      value: data?.kpis.total_observaciones ?? 0,
      icon: 'rate_review',
    },
  ]

  const maxHora = Math.max(1, ...(data?.actividad_por_hora ?? [0]))
  const maxPalabra = Math.max(1, ...(data?.nube_observaciones ?? []).map((p) => p.total))

  return (
    <div className="space-y-lg">
      {/* Encabezado */}
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg text-primary">Reportes y Analíticas</h2>
          <p className="text-body-md text-on-surface-variant">
            Visión estratégica del rendimiento académico y operativo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
        >
          <MaterialIcon name="ios_share" size={18} />
          Exportar datos
        </button>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-md xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card rounded-xl p-md">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {kpi.label}
              </span>
              <MaterialIcon name={kpi.icon} size={18} className="text-primary" />
            </div>
            <p className="mt-sm text-headline-lg font-bold leading-none text-primary">
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-lg xl:grid-cols-3">
        {/* Evolución de entregas */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg xl:col-span-2">
          <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
            Evolución de Entregas
          </p>
          <ClientOnly fallback={<div className="h-56" />}>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={data?.evolucion_entregas ?? []}>
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Entregas"
                  stroke="#6b1d2f"
                  strokeWidth={2.5}
                  dot={{ fill: '#6b1d2f', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>

        {/* Radar competencias */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg">
          <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
            Competencias Docentes
          </p>
          <ClientOnly fallback={<div className="h-56" />}>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={data?.competencias ?? []}>
                <PolarGrid stroke="#dac0c2" />
                <PolarAngleAxis dataKey="eje" tick={{ fontSize: 10 }} />
                <Radar
                  dataKey="valor"
                  stroke="#6b1d2f"
                  fill="#6b1d2f"
                  fillOpacity={0.25}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
      </section>

      {/* Proyectos por estado y materia */}
      <section className="rounded-xl border border-outline-variant bg-white p-lg">
        <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
          Proyectos por Estado y Materia
        </p>
        <ClientOnly fallback={<div className="h-56" />}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart layout="vertical" data={data?.proyectos_por_materia ?? []}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="materia"
                width={150}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="aprobado" name="Aprobado" stackId="a" fill="#6b1d2f" />
              <Bar
                dataKey="en_revision"
                name="En revisión"
                stackId="a"
                fill="#455f87"
              />
              <Bar
                dataKey="observado"
                name="Observado"
                stackId="a"
                fill="#adc8f5"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ClientOnly>
        <div className="mt-sm flex gap-md">
          {(
            [
              ['#6b1d2f', 'Aprobado'],
              ['#455f87', 'En revisión'],
              ['#adc8f5', 'Observado'],
            ] as const
          ).map(([color, label]) => (
            <span
              key={label}
              className="flex items-center gap-xs text-label-sm text-on-surface-variant"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-lg xl:grid-cols-3">
        {/* Ranking tutores */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg">
          <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
            Ranking Tutores
          </p>
          <div className="space-y-md">
            {(data?.ranking_tutores ?? []).map((tutor) => (
              <div key={tutor.nombre} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-label-md font-bold text-on-surface">
                    {tutor.nombre}
                  </p>
                  <p className="text-label-sm text-outline">
                    {tutor.estudiantes} est.
                  </p>
                </div>
                <span className="text-headline-md font-bold text-primary">
                  {tutor.efectividad}%
                </span>
              </div>
            ))}
            {(data?.ranking_tutores ?? []).length === 0 && (
              <p className="text-body-sm text-outline">Sin datos.</p>
            )}
          </div>
        </div>

        {/* Obs. por materia */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg">
          <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
            Obs. por Materia
          </p>
          <div className="space-y-md">
            {(data?.obs_por_materia ?? []).map((item) => (
              <div key={item.materia} className="flex items-center justify-between">
                <p className="truncate text-label-md text-on-surface-variant">
                  {item.materia}
                </p>
                <span className="text-label-md font-bold text-primary">
                  {item.promedio} obs
                </span>
              </div>
            ))}
            {(data?.obs_por_materia ?? []).length === 0 && (
              <p className="text-body-sm text-outline">Sin datos.</p>
            )}
          </div>
        </div>

        {/* Nube de observaciones */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg">
          <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
            Nube de Observaciones
          </p>
          <div className="flex flex-wrap items-baseline gap-x-md gap-y-sm">
            {(data?.nube_observaciones ?? []).slice(0, 20).map((palabra, i) => (
              <span
                key={palabra.palabra}
                className={cn(
                  'leading-none transition-colors hover:text-primary',
                  i % 3 === 0 ? 'font-bold text-primary' : 'text-secondary',
                )}
                style={{
                  fontSize: `${12 + (palabra.total / maxPalabra) * 20}px`,
                }}
                title={`${palabra.total} menciones`}
              >
                {palabra.palabra}
              </span>
            ))}
            {(data?.nube_observaciones ?? []).length === 0 && (
              <p className="text-body-sm text-outline">
                Aún no hay suficientes observaciones.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actividad por hora */}
      <section className="rounded-xl border border-outline-variant bg-white p-lg">
        <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
          Actividad por Hora
        </p>
        <Heatmap rows={[data?.actividad_por_hora ?? []]} />
        <div className="mt-xs flex justify-between text-[10px] text-outline">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
        <span className="sr-only">máximo {maxHora}</span>
      </section>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}

/** Modal de exportación (pantalla ea576a38). */
function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [formato, setFormato] = useState<'pdf' | 'xlsx'>('pdf')
  const exportReport = useExportReport()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Exportar reporte
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Genera un documento con el estado actual de los proyectos y su
            revisión.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-md">
          <div className="grid grid-cols-2 gap-md">
            {(
              [
                ['pdf', 'picture_as_pdf', 'PDF', 'Documento con formato'],
                ['xlsx', 'table_view', 'Excel', 'Datos tabulares (.xlsx)'],
              ] as const
            ).map(([value, icon, label, desc]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormato(value)}
                className={cn(
                  'flex flex-col items-center gap-xs rounded-xl border-2 p-lg transition-all',
                  formato === value
                    ? 'border-primary-container bg-primary-fixed/20'
                    : 'border-outline-variant hover:border-primary',
                )}
              >
                <MaterialIcon
                  name={icon}
                  size={32}
                  className={formato === value ? 'text-primary' : 'text-outline'}
                />
                <span className="text-label-md font-bold text-on-surface">
                  {label}
                </span>
                <span className="text-center text-label-sm text-outline">{desc}</span>
              </button>
            ))}
          </div>
          {exportReport.isError && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              No se pudo generar el reporte.
            </p>
          )}
          <button
            type="button"
            disabled={exportReport.isPending}
            onClick={() =>
              exportReport.mutate({ formato }, { onSuccess: onClose })
            }
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="download" size={18} />
            {exportReport.isPending ? 'Generando…' : 'Generar y descargar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
