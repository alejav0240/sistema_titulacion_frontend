import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'
import { useLogout } from '#/hooks/auth/useAuth'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { NotificationsDropdown } from '#/components/notifications/NotificationsDropdown'
import { ROL_LABELS } from '#/lib/roles'

const SECTION_LABELS: Array<[string, string]> = [
  ['/student', 'Dashboard'],
  ['/docente', 'Dashboard'],
  ['/admin/usuarios', 'Usuarios'],
  ['/admin/materias', 'Gestión de Materias'],
  ['/admin/reportes', 'Reportes'],
  ['/admin', 'Dashboard'],
  ['/proyectos', 'Proyectos'],
  ['/revision', 'Revisión'],
  ['/cronograma', 'Cronograma'],
  ['/notificaciones', 'Notificaciones'],
  ['/perfil', 'Mi Perfil'],
]

export function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function Topbar() {
  const user = useStore(authStore, (s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const section =
    SECTION_LABELS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    'Dashboard'

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface/70 px-container-margin backdrop-blur-md">
      <div className="flex items-center gap-lg">
        <nav className="flex items-center gap-xs text-label-sm text-outline">
          <Link to="/" className="cursor-pointer hover:text-primary">
            Inicio
          </Link>
          <MaterialIcon name="chevron_right" size={14} />
          <span className="font-semibold text-primary">{section}</span>
        </nav>
        <form
          className="group relative hidden md:block"
          onSubmit={(e) => {
            e.preventDefault()
            const term = search.trim()
            if (!term) return
            navigate({ to: '/proyectos', search: { search: term } })
            setSearch('')
          }}
        >
          <MaterialIcon
            name="search"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            className="w-64 rounded-full border border-outline-variant bg-surface-container py-2 pl-10 pr-4 text-body-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
            placeholder="Buscar proyectos…"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>
      <div className="flex items-center gap-md">
        <NotificationsDropdown />
        <div ref={menuRef} className="relative border-l border-outline-variant pl-md">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-sm"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="hidden text-right sm:block">
              <p className="text-label-md text-primary">{user?.nombre}</p>
              <p className="text-[10px] uppercase tracking-wider text-outline">
                {ROL_LABELS[user?.rol ?? ''] ?? user?.rol}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-label-sm font-bold text-primary">
              {initials(user?.nombre)}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-lg">
              <Link
                to="/perfil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-sm px-md py-sm text-label-md text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
              >
                <MaterialIcon name="person" size={18} />
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  logout.mutate()
                }}
                className="flex w-full items-center gap-sm border-t border-outline-variant/60 px-md py-sm text-label-md text-on-surface transition-colors hover:bg-surface-container-low hover:text-error"
              >
                <MaterialIcon name="logout" size={18} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
