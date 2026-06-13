import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { CATEGORIA_ICONS } from '#/components/notifications/NotificationsDropdown'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from '#/hooks/useNotifications'
import { timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type {
  CategoriaNotificacion,
  Notificacion,
} from '#/types/notification'

export const Route = createFileRoute('/_shell/notificaciones')({
  component: NotificacionesPage,
})

const TABS: Array<[CategoriaNotificacion | '', string]> = [
  ['', 'Todas'],
  ['OBSERVACION', 'Comentarios'],
  ['ENTREGA', 'Versiones'],
  ['RECORDATORIO', 'Vencimientos'],
  ['SISTEMA', 'Sistema'],
]

const CATEGORIA_LABELS: Record<string, string> = {
  OBSERVACION: 'Comentarios',
  ENTREGA: 'Versión',
  RECORDATORIO: 'Vencimiento',
  SISTEMA: 'Sistema',
}

const CATEGORIA_CHIP: Record<string, string> = {
  OBSERVACION: 'bg-secondary-container text-on-secondary-container',
  ENTREGA: 'bg-surface-container text-on-surface-variant',
  RECORDATORIO: 'bg-error-container text-on-error-container',
  SISTEMA: 'bg-surface-container text-on-surface-variant',
}

function bucket(notificacion: Notificacion): string {
  const fecha = new Date(notificacion.created_at)
  const hoy = new Date()
  const diff = Math.floor(
    (new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime() -
      new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
      ).getTime()) /
      86_400_000,
  )
  if (diff <= 0) return 'HOY'
  if (diff === 1) return 'AYER'
  if (diff < 7) return 'ESTA SEMANA'
  return 'ANTERIORES'
}

function NotificacionesPage() {
  const [categoria, setCategoria] = useState<CategoriaNotificacion | ''>('')
  const [page, setPage] = useState(1)
  const notifications = useNotifications({ categoria, page })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const items = notifications.data?.results ?? []
  const grupos = items.reduce<Record<string, Notificacion[]>>((acc, n) => {
    const key = bucket(n)
    ;(acc[key] ??= []).push(n)
    return acc
  }, {})
  const ordenGrupos = ['HOY', 'AYER', 'ESTA SEMANA', 'ANTERIORES'].filter(
    (g) => grupos[g]?.length,
  )

  return (
    <div className="mx-auto max-w-4xl space-y-lg">
      <section className="flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <p className="text-label-sm text-outline">
            Portal · Notificaciones
          </p>
          <h2 className="text-headline-lg text-primary">
            Centro de Notificaciones
          </h2>
        </div>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          className="flex items-center gap-xs rounded-lg bg-primary-container px-md py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
        >
          <MaterialIcon name="done_all" size={18} />
          Marcar todo como leído
        </button>
      </section>

      {/* Tabs por categoría */}
      <div className="flex flex-wrap gap-sm">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setCategoria(value)
              setPage(1)
            }}
            className={cn(
              'rounded-full px-md py-sm text-label-md transition-all',
              categoria === value
                ? 'bg-primary-container font-bold text-on-primary'
                : 'border border-outline-variant bg-white text-on-surface-variant hover:text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista agrupada */}
      {notifications.isLoading ? (
        <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
      ) : (
        ordenGrupos.map((grupo) => (
          <section key={grupo}>
            <p className="mb-sm text-label-sm font-bold uppercase tracking-widest text-outline">
              {grupo}
            </p>
            <div className="space-y-sm">
              {grupos[grupo].map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.leido && markRead.mutate(n.id)}
                  className={cn(
                    'flex w-full items-start gap-md rounded-xl border p-md text-left transition-all',
                    n.leido
                      ? 'border-outline-variant bg-white'
                      : n.categoria === 'RECORDATORIO'
                        ? 'border-error/40 bg-error-container/30'
                        : 'border-primary-container/30 bg-primary-fixed/10',
                  )}
                >
                  <div className="mt-xs flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
                    <MaterialIcon
                      name={CATEGORIA_ICONS[n.categoria] ?? 'notifications'}
                      size={18}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-sm">
                      <span
                        className={cn(
                          'rounded px-xs py-[1px] text-[9px] font-bold uppercase tracking-wider',
                          CATEGORIA_CHIP[n.categoria],
                        )}
                      >
                        {CATEGORIA_LABELS[n.categoria] ?? n.categoria}
                      </span>
                      <span className="ml-auto text-label-sm text-outline">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.titulo && (
                      <p className="mt-xs text-label-md font-bold text-on-surface">
                        {n.titulo}
                      </p>
                    )}
                    <p className="text-body-sm text-on-surface-variant">
                      {n.mensaje}
                    </p>
                    {n.emisor_nombre && (
                      <p className="mt-xs text-label-sm text-outline">
                        De: {n.emisor_nombre}
                      </p>
                    )}
                  </div>
                  {!n.leido && (
                    <span className="mt-sm h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      {!notifications.isLoading && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-outline-variant py-xl text-center text-body-sm text-outline">
          No tienes notificaciones en esta categoría.
        </p>
      )}

      {/* Paginación simple */}
      {(notifications.data?.count ?? 0) > 15 && (
        <div className="flex justify-center gap-sm">
          <button
            type="button"
            disabled={!notifications.data?.previous}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-outline-variant px-md py-sm text-label-md disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!notifications.data?.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-outline-variant px-md py-sm text-label-md disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Preferencias */}
      <section className="flex items-center justify-between gap-md rounded-xl border border-outline-variant bg-surface-container-low p-lg">
        <div className="flex items-center gap-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary">
            <MaterialIcon name="auto_awesome" size={20} />
          </div>
          <div>
            <p className="text-label-md font-bold text-on-surface">
              Gestiona tus preferencias
            </p>
            <p className="text-body-sm text-on-surface-variant">
              Mantén tu información y contraseña al día desde tu perfil.
            </p>
          </div>
        </div>
        <Link
          to="/perfil"
          className="shrink-0 rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md font-bold text-primary transition-all hover:bg-surface-container-low"
        >
          Ir a Mi Perfil
        </Link>
      </section>
    </div>
  )
}
