import { Link, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { cn } from '#/lib/utils'
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  School,
} from 'lucide-react'
import { authStore } from '#/hooks/useAuthStore'
import { useLogout } from '#/hooks/auth/useAuth'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { useState } from 'react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student/' },
  { icon: FolderOpen, label: 'Proyectos', href: '/student/proyectos' },
]

const placeholderItems = [
  { icon: MessageSquare, label: 'Revisiones' },
  { icon: Calendar, label: 'Cronograma' },
  { icon: BarChart3, label: 'Reportes' },
  { icon: Users, label: 'Usuarios' },
]

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const logout = useLogout()
  const user = useStore(authStore, (s) => s.user)
  const [showPlaceholder, setShowPlaceholder] = useState<string | null>(null)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ES'

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <aside className="fixed left-0 top-0 h-screen w-[260px] z-50 bg-white border-r border-[#dac0c2] flex flex-col py-6 px-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#6b1d2f] text-white">
            <School className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#4e051a]">AcademicFlow</h1>
            <p className="text-xs font-medium text-[#455f87] opacity-70">Portal Estudiantil</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-[#ffd9dd]/30 text-[#4e051a] font-semibold'
                    : 'text-[#455f87] font-medium hover:bg-[#f3f3f3]',
                )}
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {placeholderItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setShowPlaceholder(item.label)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#455f87] font-medium hover:bg-[#f3f3f3] transition-colors text-left cursor-pointer"
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#dac0c2]">
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#455f87] font-medium hover:bg-[#f3f3f3] transition-colors w-full cursor-pointer"
          >
            <LogOut className="size-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <header className="fixed top-0 right-0 left-[260px] h-16 z-40 bg-[#f9f9f9]/70 backdrop-blur-md border-b border-[#dac0c2] flex items-center justify-between px-10">
        <div className="flex items-center gap-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold text-[#4e051a]">
            {location.pathname === '/student/' && 'Dashboard'}
            {location.pathname === '/student/proyectos' && 'Proyectos'}
          </h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#877274]" />
            <input
              type="text"
              placeholder="Buscar entregas, archivos..."
              className="w-full bg-[#eeeeee] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#6b1d2f]/20 focus:outline-none text-[#1a1c1c] placeholder:text-[#877274]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#455f87] hover:text-[#6b1d2f] transition-colors cursor-pointer">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-[#ba1a1a] rounded-full border-2 border-[#f9f9f9]" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[#dac0c2]">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1a1c1c]">{user?.name || 'Estudiante'}</p>
              <p className="text-xs text-[#455f87]">Ing. Informática</p>
            </div>
            <Avatar className="size-10 border border-[#dac0c2]">
              <AvatarFallback className="bg-[#6b1d2f] text-white text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="ml-[260px] pt-24 px-10 pb-10">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {showPlaceholder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-xl max-w-sm text-center border border-[#dac0c2]">
            <div className="size-14 rounded-full bg-[#ffd9dd] flex items-center justify-center mx-auto mb-4">
              <School className="size-7 text-[#6b1d2f]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a1c1c] mb-2">
              {showPlaceholder}
            </h3>
            <p className="text-sm text-[#544244] mb-6">
              Esta funcionalidad estará disponible pronto.
            </p>
            <Button
              onClick={() => setShowPlaceholder(null)}
              className="bg-[#6b1d2f] text-white hover:bg-[#4e051a] rounded-xl px-6"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
