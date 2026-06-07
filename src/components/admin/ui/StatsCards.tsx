import { Users, UserCheck, Clock } from 'lucide-react'

interface StatsCardsProps {
  total: number
  activos: number
  pendientes: number
}

export function StatsCards({ total, activos, pendientes }: StatsCardsProps) {
  const stats = [
    {
      icon: Users,
      value: total,
      label: 'Usuarios Totales',
      bg: 'bg-red-900/10 dark:bg-red-900/20',
      color: 'text-red-900 dark:text-red-400',
    },
    {
      icon: UserCheck,
      value: activos,
      label: 'Activos este mes',
      bg: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-700 dark:text-green-400',
    },
    {
      icon: Clock,
      value: pendientes,
      label: 'Pendientes de alta',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      color: 'text-blue-700 dark:text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div
            className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}
          >
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-red-900 dark:text-red-400">
              {stat.value}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
