import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type { Defensa, Proyecto, ProyectosResponse } from '#/types/project'

export interface ProjectFilters {
  search?: string
  estado?: string
  etapa?: string
  tutor?: string
  page?: number
  page_size?: number
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '') params[key] = value
      }
      const { data } = await api.get<ProyectosResponse>('/api/projects/', {
        params,
      })
      return data
    },
  })
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: ['project', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Proyecto>(`/api/projects/${id}/`)
      return data
    },
  })
}

export function useActiveProject() {
  return useQuery({
    queryKey: ['student-active-project'],
    queryFn: async () => {
      const { data } = await api.get<{ project: Proyecto | null }>(
        '/api/projects/active/',
      )
      return data
    },
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (titulo: string) => {
      const { data } = await api.post<Proyecto>('/api/projects/', { titulo })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-active-project'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number
      titulo?: string
      descripcion?: string
      estado?: string
      etapa?: string
    }) => {
      const { data } = await api.patch<Proyecto>(
        `/api/projects/${id}/`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export interface DefensaPayload {
  fecha_hora?: string
  lugar?: string
  estado?: string
  calificacion?: string
  resultado?: string
  acta_url?: string
  observaciones?: string
}

export function useDefensa(proyectoId: number | undefined) {
  return useQuery({
    queryKey: ['defensa', proyectoId],
    enabled: !!proyectoId,
    queryFn: async () => {
      const { data } = await api.get<Defensa | null>(
        `/api/projects/${proyectoId}/defensa/`,
      )
      return data
    },
  })
}

export function useProgramarDefensa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      proyectoId,
      ...payload
    }: DefensaPayload & { proyectoId: number }) => {
      const { data } = await api.post<Defensa>(
        `/api/projects/${proyectoId}/defensa/`,
        payload,
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['defensa', vars.proyectoId] })
      qc.invalidateQueries({ queryKey: ['project', vars.proyectoId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useActualizarDefensa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      proyectoId,
      ...payload
    }: DefensaPayload & { proyectoId: number }) => {
      const { data } = await api.patch<Defensa>(
        `/api/projects/${proyectoId}/defensa/`,
        payload,
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['defensa', vars.proyectoId] })
      qc.invalidateQueries({ queryKey: ['project', vars.proyectoId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export async function downloadProjectsExport(format: 'xlsx' | 'pdf') {
  const response = await api.get('/api/projects/export/', {
    params: { formato: format },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `proyectos.${format}`
  link.click()
  URL.revokeObjectURL(url)
}
