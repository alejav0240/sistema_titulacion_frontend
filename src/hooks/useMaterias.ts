import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type { Inscripcion, Materia } from '#/types/materia'

export function useMaterias(filters?: { search?: string; semestre?: string }) {
  return useQuery({
    queryKey: ['materias', filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.semestre) params.semestre = filters.semestre
      const { data } = await api.get<Materia[]>('/api/materias/', { params })
      return data
    },
  })
}

export function useMateria(id: number | undefined) {
  return useQuery({
    queryKey: ['materia', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Materia>(`/api/materias/${id}/`)
      return data
    },
  })
}

export function useMateriaEstudiantes(id: number | undefined) {
  return useQuery({
    queryKey: ['materia-estudiantes', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Inscripcion[]>(
        `/api/materias/${id}/estudiantes/`,
      )
      return data
    },
  })
}

function useMateriaMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materias'] })
      qc.invalidateQueries({ queryKey: ['materia'] })
      qc.invalidateQueries({ queryKey: ['materia-estudiantes'] })
    },
  })
}

export interface MateriaPayload {
  nombre: string
  semestre: number
  grupo: string
  docente_a_cargo?: number | null
}

export function useCreateMateria() {
  return useMateriaMutation(async (payload: MateriaPayload) => {
    const { data } = await api.post<Materia>('/api/materias/', payload)
    return data
  })
}

export function useUpdateMateria() {
  return useMateriaMutation(
    async ({ id, ...payload }: Partial<MateriaPayload> & { id: number }) => {
      const { data } = await api.patch<Materia>(`/api/materias/${id}/`, payload)
      return data
    },
  )
}

export function useDeleteMateria() {
  return useMateriaMutation(async (id: number) => {
    await api.delete(`/api/materias/${id}/`)
  })
}

export function useEnrollStudent() {
  return useMateriaMutation(
    async ({ materiaId, estudiante }: { materiaId: number; estudiante: number }) => {
      const { data } = await api.post(`/api/materias/${materiaId}/estudiantes/`, {
        estudiante,
      })
      return data
    },
  )
}

export function useEnrollCsv() {
  return useMateriaMutation(
    async ({ materiaId, file }: { materiaId: number; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(
        `/api/materias/${materiaId}/estudiantes/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data as { inscritos: string[]; errors: Array<{ row: number; error: string }> }
    },
  )
}

export function useUnenrollStudent() {
  return useMateriaMutation(
    async ({
      materiaId,
      inscripcionId,
    }: {
      materiaId: number
      inscripcionId: number
    }) => {
      await api.delete(`/api/materias/${materiaId}/estudiantes/${inscripcionId}/`)
    },
  )
}
