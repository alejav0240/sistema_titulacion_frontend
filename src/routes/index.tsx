import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { authStore, initAuth } from '#/hooks/useAuthStore'
import { homeForRole } from '#/lib/roles'

export const Route = createFileRoute('/')({
  component: IndexRedirect,
})

function IndexRedirect() {
  const router = useRouter()

  useEffect(() => {
    initAuth()
    const { isAuthenticated, user } = authStore.state
    router.navigate({
      to: isAuthenticated ? homeForRole(user?.rol) : '/auth/login',
      replace: true,
    })
  }, [router])

  return null
}
