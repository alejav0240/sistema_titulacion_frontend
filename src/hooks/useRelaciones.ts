import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'

export type TipoRelacion = 'TUTOR' | 'TRIBUNAL' | 'TUPLA_EVALUACION'

export interface Relacion {
  id: number
  estudiante: number
  estudiante_nombre: string
  docente: number
  docente_nombre: string
  relacion: TipoRelacion
  is_active: boolean
  aval_enviado: boolean
  carta_firmada: boolean
  created_at: string
}

export function useRelaciones(params: { estudiante?: number; docente?: number; relacion?: TipoRelacion }) {
  return useQuery({
    queryKey: ['relationships', params],
    enabled: Object.values(params).some(Boolean),
    queryFn: async () => {
      const { data } = await api.get<Relacion[]>('/api/relationships/', { params })
      return data
    },
  })
}

/** Tuplas de evaluación activas (docente-docente), para el picker de asignación. */
export function useTuplas() {
  return useQuery({
    queryKey: ['relationships', 'tuplas'],
    queryFn: async () => {
      const { data } = await api.get<Relacion[]>('/api/relationships/', {
        params: { relacion: 'TUPLA_EVALUACION' },
      })
      return data.filter((r) => r.is_active)
    },
  })
}

export function useCreateRelacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      estudiante: number
      docente: number
      relacion: TipoRelacion
      force?: boolean
    }) => {
      const { data } = await api.post<Relacion>('/api/relationships/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project'] })
      qc.invalidateQueries({ queryKey: ['versions'] })
    },
    meta: { silentError: true },
  })
}

export function useAsignarTupla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { estudiante: number; tupla_id: number; force?: boolean }) => {
      const { data } = await api.post<Relacion[]>('/api/relationships/asignar-tupla/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project'] })
      qc.invalidateQueries({ queryKey: ['versions'] })
    },
    meta: { silentError: true },
  })
}

export function useUpdateRelacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number
      aval_enviado?: boolean
      carta_firmada?: boolean
    }) => {
      const { data } = await api.patch<Relacion>(`/api/relationships/${id}/`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationships'] }),
  })
}

/** Sugerencia de cupos: estudiantes inscritos en Taller I / docentes activos. */
export function useCuposSugeridos() {
  return useQuery({
    queryKey: ['relationships', 'cupos-sugeridos'],
    queryFn: async () => {
      const { data } = await api.get<{
        estudiantes_taller1: number
        docentes: number
        sugerido: number
      }>('/api/relationships/cupos-sugeridos/')
      return data
    },
  })
}

export function useDeleteRelacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: number; motivo: string }) => {
      const { data } = await api.delete<{ detail: string }>(`/api/relationships/${id}/`, {
        data: { motivo },
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project'] })
      qc.invalidateQueries({ queryKey: ['versions'] })
    },
  })
}
