import api from '#/lib/api'
import { useMutation } from '@tanstack/react-query'
import { clearAuth, setAuth } from '../useAuthStore'
import { homeForRole } from '#/lib/roles'

export default function useLogin() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: async ({
      email,
      password,
      rememberMe,
    }: {
      email: string
      password: string
      rememberMe: boolean
    }) => {
      await api.post('/api/login/', {
        email,
        password,
        rememberMe,
      })
      const { data } = await api.get('/api/users/me/')
      return data
    },
    onSuccess: (data) => {
      setAuth(data)
      if (data) {
        window.location.href = homeForRole(data.rol)
      }
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.get('/api/logout/')
    },
    onSuccess: () => {
      clearAuth()
      window.location.href = '/auth/login'
    },
  })
}
