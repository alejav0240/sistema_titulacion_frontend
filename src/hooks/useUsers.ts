import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  UsersResponse,
  ImportResult,
} from '#/types/user'

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

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData: UsuarioCreate) => {
      const { data } = await api.post<Usuario>('/api/users/', userData)
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
