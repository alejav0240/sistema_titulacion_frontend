import { cn } from '#/lib/utils'

const roleColors: Record<string, string> = {
  DOCENTE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  TRIBUNAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  TUTOR: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  ESTUDIANTE: 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300',
  DIRECTOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  DTC: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}

interface RoleBadgeProps {
  rol: string
  className?: string
}

export function RoleBadge({ rol, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-tight',
        roleColors[rol] || 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300',
        className,
      )}
    >
      {rol}
    </span>
  )
}
