import { createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { Heatmap } from '#/components/charts/Heatmap'
import { ClientOnly } from '#/components/ui/ClientOnly'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { authStore } from '#/hooks/useAuthStore'
import { useDirectorDashboard } from '#/hooks/useDashboard'
import { formatDate, periodoActual, timeAgo } from '#/lib/datetime'

export const Route = createFileRoute('/_shell/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DTC']}>
      <DirectorDashboard />
    </AuthGuard>
  )
}

const DONUT_COLORS: Record<string, string> = {
  APROBADO: '#10B981',
  'EN REVISION': '#455f87',
  OBSERVADO: '#F59E0B',
  BORRADOR: '#877274',
}

const DONUT_LABELS: Record<string, string> = {
  APROBADO: 'Aprobados',
  'EN REVISION': 'En revisión',
  OBSERVADO: 'Observados',
  BORRADOR: 'Borradores',
}

const ACTIVIDAD_LABELS: Record<string, string> = {
  CREACION: 'creó observación en',
  SUBSANACION: 'subsanó observación en',
  APROBACION: 'aprobó corrección en',
  REOBSERVACION: 'reobservó en',
}

function DirectorDashboard() {
  const user = useStore(authStore, (s) => s.user)
  const dashboard = useDirectorDashboard()
  const data = dashboard.data

  if (dashboard.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">
        Cargando panel…
      </p>
    )
  }

  const donutData = Object.entries(data?.estado_proyectos ?? {})
    .filter(([, value]) => value > 0)
    .map(([estado, value]) => ({
      name: DONUT_LABELS[estado] ?? estado,
      value,
      color: DONUT_COLORS[estado] ?? '#877274',
    }))

  const kpis = [
    {
      label: 'Total proyectos',
      value: data?.kpis.total_proyectos ?? 0,
      icon: 'folder_special',
    },
    {
      label: 'Proyectos aprobados',
      value: data?.kpis.aprobados ?? 0,
      icon: 'verified',
    },
    { label: 'Pendientes', value: data?.kpis.pendientes ?? 0, icon: 'pending_actions' },
    {
      label: 'Observaciones activas',
      value: data?.kpis.observaciones_activas ?? 0,
      icon: 'rate_review',
    },
    {
      label: 'Tutores activos',
      value: data?.kpis.tutores_activos ?? 0,
      icon: 'supervisor_account',
    },
    {
      label: 'Días prom. revisión',
      value: data?.kpis.dias_promedio_revision ?? 0,
      icon: 'timer',
    },
  ]

  return (
    <div className="space-y-lg">
      {/* Encabezado */}
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg text-primary">
            Bienvenido, {user?.nombre}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Gestión académica centralizada y revisión de proyectos.
          </p>
        </div>
        <div className="flex items-center gap-xs rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md text-on-surface-variant">
          Periodo Académico:{' '}
          <span className="font-bold text-primary">{periodoActual()}</span>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-md md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="glass-card flex flex-col justify-between rounded-xl p-md"
          >
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
        <div className="space-y-lg xl:col-span-2">
          <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
            {/* Donut estado de proyectos */}
            <div className="rounded-xl border border-outline-variant bg-white p-lg">
              <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
                Estado de Proyectos
              </p>
              <ClientOnly fallback={<div className="h-48" />}>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ClientOnly>
              <div className="mt-sm grid grid-cols-2 gap-xs">
                {donutData.map((entry) => (
                  <span
                    key={entry.name}
                    className="flex items-center gap-xs text-label-sm text-on-surface-variant"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Actividad mensual */}
            <div className="rounded-xl border border-outline-variant bg-white p-lg">
              <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
                Actividad Mensual de Entregas
              </p>
              <ClientOnly fallback={<div className="h-48" />}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.actividad_mensual ?? []}>
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      name="Entregas"
                      fill="#6b1d2f"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={26}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </div>
          </div>

          {/* Distribución por materia */}
          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
              Distribución por Materia
            </p>
            <div className="space-y-sm">
              {(data?.distribucion_materia ?? []).map((item) => {
                const max = Math.max(
                  1,
                  ...(data?.distribucion_materia ?? []).map((d) => d.proyectos),
                )
                return (
                  <div key={item.nombre} className="flex items-center gap-md">
                    <span className="w-44 shrink-0 truncate text-body-sm text-on-surface-variant">
                      {item.nombre}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${(item.proyectos / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-label-sm font-bold text-on-surface">
                      {item.proyectos}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Heatmap carga docente */}
          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <p className="mb-md text-label-sm font-bold uppercase tracking-wider text-outline">
              Carga de Trabajo por Docente (8 semanas)
            </p>
            <Heatmap
              rows={(data?.carga_docente ?? []).map((d) => d.semanas)}
              rowLabels={(data?.carga_docente ?? []).map((d) => d.docente)}
            />
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-lg">
          {/* Alertas críticas */}
          <div className="rounded-xl border border-error/30 bg-error-container/40 p-md">
            <div className="flex items-center gap-sm">
              <MaterialIcon name="warning" size={20} className="text-error" />
              <p className="text-label-md font-bold text-on-error-container">
                Alertas Críticas
              </p>
            </div>
            <p className="mt-sm text-body-sm text-on-error-container">
              <span className="text-headline-md font-bold">
                {data?.alertas.proyectos_en_riesgo ?? 0}
              </span>{' '}
              proyectos en riesgo: superan los 10 días sin actividad.
            </p>
          </div>

          {/* Próximos vencimientos */}
          <div className="rounded-xl border border-outline-variant bg-white p-md">
            <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
              Próximos Vencimientos
            </p>
            <div className="space-y-sm">
              {(data?.vencimientos ?? []).map((evento) => (
                <div key={evento.id} className="flex items-start gap-sm">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-error-container text-on-error-container">
                    <span className="text-[9px] font-bold uppercase leading-none">
                      {new Date(evento.fecha_inicio)
                        .toLocaleDateString('es-BO', { month: 'short' })
                        .replace('.', '')}
                    </span>
                    <span className="text-label-md font-bold leading-none">
                      {new Date(evento.fecha_inicio).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-label-md font-bold text-on-surface">
                      {evento.descripcion}
                    </p>
                    <p className="text-label-sm text-outline">
                      {formatDate(evento.fecha_inicio)}
                    </p>
                  </div>
                </div>
              ))}
              {(data?.vencimientos ?? []).length === 0 && (
                <p className="text-body-sm text-outline">Sin vencimientos.</p>
              )}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="rounded-xl border border-outline-variant bg-white p-md">
            <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-outline">
              Actividad Reciente
            </p>
            <div className="relative space-y-md">
              <div className="absolute bottom-1 left-[5px] top-1 w-px bg-outline-variant" />
              {(data?.actividad_reciente ?? []).map((item, i) => (
                <div key={i} className="relative flex gap-sm">
                  <span className="z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-outline-variant bg-primary-container ring-2 ring-white" />
                  <div className="min-w-0">
                    <p className="text-body-sm text-on-surface">
                      <span className="font-bold">{item.autor}</span>{' '}
                      {ACTIVIDAD_LABELS[item.tipo] ?? item.tipo}{' '}
                      <span className="font-medium text-primary">
                        {item.proyecto}
                      </span>
                    </p>
                    <p className="text-label-sm text-outline">
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {(data?.actividad_reciente ?? []).length === 0 && (
                <p className="text-body-sm text-outline">Sin actividad.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
