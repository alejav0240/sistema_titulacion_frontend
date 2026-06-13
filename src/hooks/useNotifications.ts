import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  CategoriaNotificacion,
  NotificacionesResponse,
} from '#/types/notification'

export function useNotifications(filters?: {
  categoria?: CategoriaNotificacion | ''
  leido?: boolean
  page?: number
}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {}
      if (filters?.categoria) params.categoria = filters.categoria
      if (filters?.leido !== undefined) params.leido = filters.leido
      if (filters?.page) params.page = filters.page
      const { data } = await api.get<NotificacionesResponse>(
        '/api/notifications/',
        { params },
      )
      return data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>(
        '/api/notifications/unread-count/',
      )
      return data.count
    },
    refetchInterval: 30_000,
    retry: false,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/notifications/${id}/read/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/read-all/')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useSendNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      destinatarios: number[]
      titulo: string
      mensaje: string
      prioridad?: string
    }) => {
      const { data } = await api.post('/api/notifications/send/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
