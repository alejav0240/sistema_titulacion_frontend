import { useTheme } from '#/hooks/useTheme'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { cn } from '#/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={cn(
        'rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary',
        className,
      )}
    >
      <MaterialIcon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={20} />
    </button>
  )
}
