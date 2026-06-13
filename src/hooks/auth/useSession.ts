import api from '#/lib/api'
import { useQuery } from '@tanstack/react-query'
import { authStore, setAuth } from '../useAuthStore'
import { homeForRole } from '#/lib/roles'

export function useCheckSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/')
      if (data) {
        setAuth(data)
        window.location.href = homeForRole(data.rol)
      }
      return data
    },
    retry: false,
    enabled: !authStore.state.isAuthenticated,
  })
}
