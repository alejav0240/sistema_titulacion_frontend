import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'
import type { Grupo } from '#/types/materia'

export function useGrupos() {
  return useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const { data } = await api.get<Grupo[]>('/api/grupos/')
      return data
    },
  })
}

export function useGrupo(id: number | undefined) {
  return useQuery({
    queryKey: ['grupo', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Grupo>(`/api/grupos/${id}/`)
      return data
    },
  })
}

function useGrupoMutation<TVars, TData = unknown>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grupos'] })
      qc.invalidateQueries({ queryKey: ['grupo'] })
    },
  })
}

export interface GrupoPayload {
  nombre: string
  descripcion?: string
  materias?: number[]
}

export function useCreateGrupo() {
  return useGrupoMutation(async (payload: GrupoPayload) => {
    const { data } = await api.post<Grupo>('/api/grupos/', payload)
    return data
  })
}

export function useUpdateGrupo() {
  return useGrupoMutation(async ({ id, ...payload }: Partial<GrupoPayload> & { id: number }) => {
    const { data } = await api.patch<Grupo>(`/api/grupos/${id}/`, payload)
    return data
  })
}

export function useDeleteGrupo() {
  return useGrupoMutation(async (id: number) => {
    await api.delete(`/api/grupos/${id}/`)
  })
}

export function useImportGrupos() {
  return useGrupoMutation(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/grupos/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { creados: string[]; errors: Array<{ row: number; error: string }> }
  })
}
