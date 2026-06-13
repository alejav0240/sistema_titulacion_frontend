import api from '#/lib/api'
import { useQuery } from '@tanstack/react-query'
import { authStore, setAuth } from '../useAuthStore'

export function useCheckSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/')
      if (data) setAuth(data)
      return data
    },
    retry: false,
    enabled: !authStore.state.isAuthenticated,
  })
}
