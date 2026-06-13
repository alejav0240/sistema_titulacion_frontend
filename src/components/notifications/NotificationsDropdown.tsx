import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '#/hooks/useNotifications'
import { timeAgo } from '#/lib/datetime'
import { cn } from '#/lib/utils'
import type { CategoriaNotificacion } from '#/types/notification'

export const CATEGORIA_ICONS: Record<CategoriaNotificacion, string> = {
  ENTREGA: 'upload_file',
  OBSERVACION: 'rate_review',
  SISTEMA: 'settings_suggest',
  RECORDATORIO: 'schedule',
}

export function NotificationsDropdown() {
  const unread = useUnreadCount()
  const notifications = useNotifications({ page: 1 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const items = notifications.data?.results.slice(0, 5) ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative p-2 text-on-surface-variant transition-colors hover:text-primary"
          aria-label="Notificaciones"
        >
          <MaterialIcon name="notifications" size={22} />
          {(unread.data ?? 0) > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-error px-0.5 text-[9px] font-bold text-on-error">
              {unread.data! > 9 ? '9+' : unread.data}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-xl border-outline-variant p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
          <p className="text-label-md font-bold text-on-surface">
            Notificaciones
          </p>
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-label-sm text-primary hover:underline"
          >
            Marcar todas como leídas
          </button>
        </div>
        <div className="thin-scrollbar max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-md py-lg text-center text-body-sm text-outline">
              Sin notificaciones
            </p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.leido) markRead.mutate(n.id)
              }}
              className={cn(
                'flex w-full items-start gap-sm px-md py-sm text-left transition-colors hover:bg-surface-container-low',
                !n.leido && 'bg-primary-fixed/20',
              )}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
                <MaterialIcon
                  name={CATEGORIA_ICONS[n.categoria] ?? 'notifications'}
                  size={16}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-body-sm font-medium text-on-surface">
                  {n.titulo || n.mensaje}
                </p>
                {n.titulo && (
                  <p className="line-clamp-2 text-body-sm text-on-surface-variant">
                    {n.mensaje}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-outline">
                  {timeAgo(n.created_at)}
                </p>
              </div>
              {!n.leido && (
                <span className="mt-2 ml-auto h-2 w-2 shrink-0 rounded-full bg-primary-container" />
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-outline-variant p-sm">
          <Link
            to="/notificaciones"
            className="block w-full rounded-lg bg-primary-container py-sm text-center text-label-md text-on-primary transition-all hover:opacity-90"
          >
            Ver todas
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
