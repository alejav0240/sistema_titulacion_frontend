import { cn } from '#/lib/utils'

export function MaterialIcon({
  name,
  fill = false,
  size,
  className,
  ...props
}: {
  name: string
  fill?: boolean
  size?: number
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'material-symbols-outlined select-none',
        fill && 'icon-fill',
        className,
      )}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}

export default MaterialIcon
