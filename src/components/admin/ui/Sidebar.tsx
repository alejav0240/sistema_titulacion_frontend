import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Archive,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
} from 'lucide-react'
import { useLogout } from '#/hooks/auth/useAuth'
import ThemeToggle from '../../ThemeToggle'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Gestión de Usuarios', href: '/admin/usuarios' },
  { icon: FileCheck, label: 'Revisiones', href: '/admin/revisiones' },
  { icon: Archive, label: 'Archivo', href: '/admin/archivo' },
  { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
]

export function Sidebar() {
  const location = useLocation()
  const logout = useLogout()

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col py-6 px-4 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-red-900">AcademicFlow</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sistema de Titulación
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 dark:bg-zinc-800 text-red-900 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <ThemeToggle />
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 cursor-pointer transition-colors"
          onClick={() => logout.mutate()}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
