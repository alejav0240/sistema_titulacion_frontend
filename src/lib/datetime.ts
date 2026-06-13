const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export function timeAgo(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = Date.now() - date.getTime()
  if (diff < MINUTE) return 'Ahora'
  if (diff < HOUR) return `Hace ${Math.floor(diff / MINUTE)} min`
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR)
    return `Hace ${h}h`
  }
  const d = Math.floor(diff / DAY)
  if (d === 1) return 'Ayer'
  if (d < 7) return `Hace ${d} días`
  return formatDate(date)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Periodo académico actual: "2026-I" (ene–jun) o "2026-II" (jul–dic). */
export function periodoActual(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() < 6 ? 'I' : 'II'}`
}

export function formatDayMonth(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'long',
  }).format(date)
}
