import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'
import type { Formulario, TipoFormulario } from '#/types/formulario'

export function useFormularios(proyectoId: number | undefined) {
  return useQuery({
    queryKey: ['formularios', proyectoId],
    enabled: !!proyectoId,
    queryFn: async () => {
      const { data } = await api.get<Formulario[]>('/api/formularios/', {
        params: { proyecto: proyectoId },
      })
      return data
    },
  })
}

export function useCreateFormulario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { proyecto: number; tipo: TipoFormulario }) => {
      const { data } = await api.post<Formulario>('/api/formularios/', payload)
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['formularios', vars.proyecto] })
      qc.invalidateQueries({ queryKey: ['materia-estudiantes'] })
    },
  })
}

export function useUpdateEntrega() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number
      link_url?: string
      nombre_archivo?: string
      nota?: number | null
      acta_url?: string
    }) => {
      const { data } = await api.patch(`/api/formularios/entregas/${id}/`, payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['formularios'] })
      qc.invalidateQueries({ queryKey: ['materia-estudiantes'] })
    },
  })
}

export async function downloadMatrizCorrecciones(proyectoId: number) {
  const response = await api.get(`/api/projects/${proyectoId}/matriz-correcciones/`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `matriz_correcciones_${proyectoId}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
