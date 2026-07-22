import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  Defensa,
  MatrizInput,
  Proyecto,
  ProyectosResponse,
} from '#/types/project'

export interface ProjectFilters {
  search?: string
  estado?: string
  etapa?: string
  estado_aprobacion?: string
  include_rechazados?: string
  tutor?: string
  como?: 'tutor' | 'tribunal'
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
    mutationFn: async (matrices: MatrizInput[]) => {
      const { data } = await api.post<Proyecto>('/api/projects/', { matrices })
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
  tipo_defensa?: string
  estado?: string
  calificacion?: string
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

// Los endpoints de matriz devuelven el Proyecto completo ya actualizado: en vez de
// solo invalidar (lo que dispara un refetch async y deja la UI vieja un instante),
// se escribe ese resultado directo en cache para feedback instantáneo, y además
// se invalida lo que no se puede parchear en el mismo formato.
function applyMatrizResult(qc: ReturnType<typeof useQueryClient>, proyecto: Proyecto) {
  qc.setQueryData(['project', proyecto.id], proyecto)
  qc.setQueryData(
    ['student-active-project'],
    (old: { project: Proyecto | null } | undefined) =>
      old?.project?.id === proyecto.id ? { project: proyecto } : old,
  )
  qc.setQueriesData<ProyectosResponse>({ queryKey: ['projects'] }, (old) =>
    old
      ? { ...old, results: old.results.map((p) => (p.id === proyecto.id ? proyecto : p)) }
      : old,
  )
  qc.invalidateQueries({ queryKey: ['materia-estudiantes'] })
  qc.invalidateQueries({ queryKey: ['dashboard'] })
}

export function useAprobarMatriz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ proyectoId, matrizId }: { proyectoId: number; matrizId: number }) => {
      const { data } = await api.post<Proyecto>(
        `/api/projects/${proyectoId}/matrices/${matrizId}/aprobar/`,
      )
      return data
    },
    onSuccess: (data) => applyMatrizResult(qc, data),
  })
}

export function useRechazarMatriz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      proyectoId,
      matrizId,
      motivo,
    }: {
      proyectoId: number
      matrizId: number
      motivo: string
    }) => {
      const { data } = await api.post<Proyecto>(
        `/api/projects/${proyectoId}/matrices/${matrizId}/rechazar/`,
        { motivo },
      )
      return data
    },
    onSuccess: (data) => applyMatrizResult(qc, data),
  })
}

export function useEditarMatriz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      proyectoId,
      matrizId,
      ...payload
    }: MatrizInput & { proyectoId: number; matrizId: number }) => {
      const { data } = await api.patch<Proyecto>(
        `/api/projects/${proyectoId}/matrices/${matrizId}/`,
        payload,
      )
      return data
    },
    onSuccess: (data) => applyMatrizResult(qc, data),
  })
}

export function useSeleccionarMatriz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ proyectoId, matrizId }: { proyectoId: number; matrizId: number }) => {
      const { data } = await api.post<Proyecto>(
        `/api/projects/${proyectoId}/matrices/${matrizId}/seleccionar/`,
      )
      return data
    },
    onSuccess: (data) => applyMatrizResult(qc, data),
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
