import { cn } from '#/lib/utils'

interface StatusDotProps {
  isActive: boolean
  className?: string
}

export function StatusDot({ isActive, className }: StatusDotProps) {
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600',
        )}
      />
      <span
        className={cn('text-sm', isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400')}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    </span>
  )
}
