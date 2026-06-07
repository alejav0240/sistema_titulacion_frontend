import api from '#/lib/api'
import { useMutation } from '@tanstack/react-query'
import { clearAuth, setAuth } from '../useAuthStore'

export default function useLogin() {
  return useMutation({
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
        if (data.is_staff) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/student'
        }
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
