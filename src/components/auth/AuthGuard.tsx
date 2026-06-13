import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { authStore, initAuth } from '#/hooks/useAuthStore'
import { homeForRole } from '#/lib/roles'
import type { Rol } from '#/types/user'

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: Rol[]
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    initAuth()
    const state = authStore.state

    if (!state.isAuthenticated) {
      router.navigate({ to: '/auth/login', replace: true })
      return
    }

    if (
      allowedRoles &&
      (!state.user || !allowedRoles.includes(state.user.rol as Rol))
    ) {
      router.navigate({ to: homeForRole(state.user?.rol), replace: true })
      return
    }

    setChecked(true)
  }, [router, allowedRoles])

  if (!checked) return null

  return children
}
