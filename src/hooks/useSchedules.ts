import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type { EventoCronograma } from '#/types/dashboard'

export function useSchedules(filters?: {
  from?: string
  to?: string
  tipo?: string
}) {
  return useQuery({
    queryKey: ['schedules', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.from) params.from = filters.from
      if (filters?.to) params.to = filters.to
      if (filters?.tipo) params.tipo = filters.tipo
      const { data } = await api.get<EventoCronograma[]>('/api/schedules/', {
        params,
      })
      return data
    },
  })
}

export interface EventoPayload {
  descripcion: string
  tipo: string
  publico_objetivo: string
  fecha_inicio: string
  fecha_fin: string
  semestre: number
}

export function useCreateEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EventoPayload) => {
      const { data } = await api.post<EventoCronograma>(
        '/api/schedules/',
        payload,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/schedules/${id}/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
