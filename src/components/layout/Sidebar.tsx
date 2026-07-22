import { Link, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'
import { useLogout } from '#/hooks/auth/useAuth'
import { useActiveProject } from '#/hooks/useProjects'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { cn } from '#/lib/utils'
import type { Rol } from '#/types/user'

interface NavItem {
  label: string
  icon: string
  to: string
  roles?: Rol[]
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/student', roles: ['ESTUDIANTE'], exact: true },
  {
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/docente',
    roles: ['DOCENTE', 'TUTOR', 'TRIBUNAL'],
    exact: true,
  },
  { label: 'Dashboard', icon: 'dashboard', to: '/admin', roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'], exact: true },
  { label: 'Proyectos', icon: 'folder_open', to: '/proyectos', roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'] },
  {
    label: 'Materias',
    icon: 'school',
    to: '/docente/materias',
    roles: ['DOCENTE', 'TUTOR', 'TRIBUNAL'],
  },
  {
    label: 'Tutorados',
    icon: 'supervisor_account',
    to: '/docente/tutorados',
    roles: ['TUTOR'],
  },
  {
    label: 'Tribunados',
    icon: 'gavel',
    to: '/docente/tribunados',
    roles: ['TRIBUNAL'],
  },
  {
    label: 'Docentes',
    icon: 'group',
    to: '/admin/docentes',
    roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'],
  },
  {
    label: 'Gestión de Materias',
    icon: 'school',
    to: '/admin/materias',
    roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'],
  },
  {
    label: 'Grupos',
    icon: 'category',
    to: '/admin/grupos',
    roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'],
  },
  {
    label: 'Formularios',
    icon: 'assignment',
    to: '/formularios',
    roles: ['DOCENTE', 'TUTOR', 'TRIBUNAL', 'DIRECTOR', 'DTC', 'COMITE_EVALUACION'],
  },
  { label: 'Cronograma', icon: 'calendar_today', to: '/cronograma' },
  { label: 'Notificaciones', icon: 'notifications', to: '/notificaciones' },
  {
    label: 'Reportes',
    icon: 'bar_chart',
    to: '/admin/reportes',
    roles: ['DIRECTOR', 'DTC', 'COMITE_EVALUACION'],
  },
]

function ctaForRole(rol?: string): { label: string; to: string } | null {
  if (rol === 'ESTUDIANTE') return { label: 'Nueva Entrega', to: '/student?nueva=1' }
  return null
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const user = useStore(authStore, (s) => s.user)
  const logout = useLogout()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const rol = user?.rol as Rol | undefined

  const isStudent = rol === 'ESTUDIANTE'
  const activeProject = useActiveProject()
  const proyecto = isStudent ? activeProject.data?.project : null
  const proyectoAprobado = proyecto?.estado_aprobacion === 'APROBADO'

  let items = NAV_ITEMS.filter(
    (item) => !item.roles || (rol && item.roles.includes(rol)),
  )
  if (isStudent) {
    // App bloqueada hasta que la propuesta sea aprobada por el docente de materia
    items = proyectoAprobado
      ? [
          items[0],
          { label: 'Mi proyecto', icon: 'folder_open', to: `/proyectos/${proyecto.id}` },
          ...items.slice(1),
        ]
      : items.filter((i) => i.to === '/student' || i.to === '/notificaciones')
  }
  const cta = isStudent && !proyectoAprobado ? null : ctaForRole(rol)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-outline-variant bg-surface-container-lowest py-lg',
        collapsed ? 'w-20 items-center px-sm' : 'w-[260px] px-md',
      )}
    >
      {/* Logo */}
      <Link to="/" className="mb-xl flex items-center gap-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container">
          <MaterialIcon name="school" fill className="text-[#fff]" size={22} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-headline-md leading-tight font-bold text-primary">
              AcademicFlow
            </h1>
            <p className="text-label-sm text-outline">Institutional Review</p>
          </div>
        )}
      </Link>

      {/* CTA */}
      {cta && !collapsed && (
        <Link
          to={cta.to}
          className="mb-xl flex w-full items-center justify-center gap-sm rounded-lg bg-primary-container px-lg py-md text-label-md text-on-primary shadow-sm transition-all hover:opacity-90"
        >
          <MaterialIcon name="add" size={20} />
          {cta.label}
        </Link>
      )}

      {/* Nav */}
      <nav className="thin-scrollbar flex-1 space-y-xs overflow-y-auto">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to + '/'))
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              title={item.label}
              className={cn(
                'flex items-center gap-md rounded-lg px-md py-sm transition-colors duration-200',
                collapsed && 'justify-center px-sm',
                active
                  ? 'border-r-4 border-primary bg-surface-container-low font-bold text-primary'
                  : 'text-secondary hover:bg-surface-container-low hover:text-primary',
              )}
            >
              <MaterialIcon name={item.icon} size={20} />
              {!collapsed && <span className="text-label-md">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-xs border-t border-outline-variant pt-lg">
        <button
          type="button"
          onClick={() => logout.mutate()}
          title="Cerrar Sesión"
          className={cn(
            'flex w-full items-center gap-md rounded-lg px-md py-sm text-secondary transition-colors duration-200 hover:bg-surface-container-low hover:text-primary',
            collapsed && 'justify-center px-sm',
          )}
        >
          <MaterialIcon name="logout" size={20} />
          {!collapsed && <span className="text-label-md">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}
