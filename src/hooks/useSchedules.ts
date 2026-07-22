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

export interface PlantillaActividad {
  id: number
  nombre: string
}

export function usePlantillasActividad() {
  return useQuery({
    queryKey: ['plantillas-actividad'],
    queryFn: async () => {
      const { data } = await api.get<PlantillaActividad[]>('/api/schedules/plantillas/')
      return data
    },
  })
}

export function useCreatePlantilla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nombre: string) => {
      const { data } = await api.post<PlantillaActividad>('/api/schedules/plantillas/', { nombre })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plantillas-actividad'] }),
  })
}

export function useTiposActividad() {
  return useQuery({
    queryKey: ['tipos-actividad'],
    queryFn: async () => {
      const { data } = await api.get<PlantillaActividad[]>('/api/schedules/tipos/')
      return data
    },
  })
}

export function useCreateTipo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nombre: string) => {
      const { data } = await api.post<PlantillaActividad>('/api/schedules/tipos/', { nombre })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tipos-actividad'] }),
  })
}

export interface EventoPayload {
  descripcion: string
  tipo: string
  carpeta_url?: string
  publicos: string[]
  grupos: number[]
  usuarios?: number[]
  fecha_inicio: string
  fecha_fin?: string
  dias_duracion?: number | null
  semestre: number
}

function useScheduleMutation<TVars, TData = unknown>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['tipos-actividad'] })
      qc.invalidateQueries({ queryKey: ['plantillas-actividad'] })
    },
  })
}

export function useCreateEvento() {
  return useScheduleMutation(async (payload: EventoPayload) => {
    const { data } = await api.post<EventoCronograma>('/api/schedules/', payload)
    return data
  })
}

export function useDeleteEvento() {
  return useScheduleMutation(async (id: number) => {
    await api.delete(`/api/schedules/${id}/`)
  })
}

export function useUpdateEvento() {
  return useScheduleMutation(
    async ({ id, ...payload }: Partial<EventoPayload> & { id: number }) => {
      const { data } = await api.patch<EventoCronograma>(`/api/schedules/${id}/`, payload)
      return data
    },
  )
}

export function useImportCronograma() {
  return useScheduleMutation(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/schedules/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { creados: number; errors: Array<{ row: number; error: string }> }
  })
}

export async function downloadCronogramaExport(formato: 'xlsx' | 'pdf') {
  const { data } = await api.get('/api/reports/cronograma/export/', {
    params: { formato },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cronograma.${formato}`
  link.click()
  URL.revokeObjectURL(url)
}
