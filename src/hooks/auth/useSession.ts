import api from '#/lib/api'
import { useQuery } from '@tanstack/react-query'
import { authStore, setAuth } from '../useAuthStore'

export function useCheckSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await api.get('/api/users/me/')
      if (data) {
        setAuth(data)
        if (data.rol === 'ESTUDIANTE') window.location.href = '/student'
        else window.location.href = '/admin'
      }
      return data
    },
    retry: false,
    enabled: !authStore.state.isAuthenticated,
  })
}
