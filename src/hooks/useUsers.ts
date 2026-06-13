import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'
import { setAuth } from '#/hooks/useAuthStore'
import type {
  Usuario,
  UsuarioCreate,
  UsuarioCreado,
  UsuarioUpdate,
  UsersResponse,
  ImportResult,
} from '#/types/user'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<Usuario>('/api/users/me/')
      return data
    },
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nombre: string }) => {
      const { data } = await api.patch<Usuario>('/api/users/me/', payload)
      return data
    },
    onSuccess: (data) => {
      setAuth({
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      old_password: string
      new_password: string
    }) => {
      const { data } = await api.post<{ detail: string }>(
        '/api/users/me/change-password/',
        payload,
      )
      return data
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<{ detail: string }>(
        '/api/auth/forgot-password/',
        { email },
      )
      return data
    },
  })
}

export function useResetPassword() {
  return useMutation({
    meta: { silentError: true },
    mutationFn: async (payload: {
      uid: string
      token: string
      new_password: string
    }) => {
      const { data } = await api.post<{ detail: string }>(
        '/api/auth/reset-password/',
        payload,
      )
      return data
    },
  })
}

export function useUsers(
  page = 1,
  filters?: { rol?: string; estado?: string; search?: string },
) {
  return useQuery({
    queryKey: ['users', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) })
      if (filters?.rol) params.set('rol', filters.rol)
      if (filters?.estado) params.set('estado', filters.estado)
      if (filters?.search) params.set('search', filters.search)
      const { data } = await api.get<UsersResponse>(`/api/users/?${params}`)
      return data
    },
  })
}

export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: ['user', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Usuario>(`/api/users/${id}/`)
      return data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData: UsuarioCreate) => {
      const { data } = await api.post<UsuarioCreado>('/api/users/', userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...userData }: UsuarioUpdate & { id: number }) => {
      const { data } = await api.patch<Usuario>(`/api/users/${id}/`, userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<Usuario>(`/api/users/${id}/`, {
        is_active: false,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<Usuario>(`/api/users/${id}/`, {
        is_active: true,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useImportUsers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<ImportResult>(
        '/api/users/import_users/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
