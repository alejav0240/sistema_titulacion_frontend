import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'

export interface Relacion {
  id: number
  estudiante: number
  estudiante_nombre: string
  docente: number
  docente_nombre: string
  relacion: 'TUTOR' | 'TRIBUNAL'
  is_active: boolean
  created_at: string
}

export function useRelaciones(params: { estudiante?: number; docente?: number }) {
  return useQuery({
    queryKey: ['relationships', params],
    enabled: Object.values(params).some(Boolean),
    queryFn: async () => {
      const { data } = await api.get<Relacion[]>('/api/relationships/', { params })
      return data
    },
  })
}

export function useCreateRelacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { estudiante: number; docente: number; relacion: 'TUTOR' | 'TRIBUNAL' }) => {
      const { data } = await api.post<Relacion>('/api/relationships/', payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationships'] }),
  })
}

export function useDeleteRelacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/relationships/${id}/`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationships'] }),
  })
}
