import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  Anotacion,
  AnotacionCreate,
  AnotacionEvento,
} from '#/types/annotation'

export function useAnnotations(versionId: number | undefined) {
  return useQuery({
    queryKey: ['annotations', versionId],
    enabled: !!versionId,
    queryFn: async () => {
      const { data } = await api.get<Anotacion[]>(
        `/api/versions/${versionId}/annotations/`,
      )
      return data
    },
  })
}

function useAnnotationMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['annotations'] })
      qc.invalidateQueries({ queryKey: ['version'] })
      qc.invalidateQueries({ queryKey: ['versions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['annotation-history'] })
    },
  })
}

export function useCreateAnnotation() {
  return useAnnotationMutation(
    async ({
      versionId,
      ...payload
    }: AnotacionCreate & { versionId: number }) => {
      const { data } = await api.post<Anotacion>(
        `/api/versions/${versionId}/annotations/`,
        payload,
      )
      return data
    },
  )
}

export function useDeleteAnnotation() {
  return useAnnotationMutation(async (id: number) => {
    await api.delete(`/api/annotations/${id}/`)
  })
}

export function useSubsanarAnnotation() {
  return useAnnotationMutation(
    async ({
      id,
      comentario,
      rect,
    }: {
      id: number
      comentario: string
      rect?: { pagina: number; x: number; y: number; ancho: number; alto: number }
    }) => {
      const { data } = await api.post<Anotacion>(
        `/api/annotations/${id}/subsanar/`,
        { comentario, ...rect },
      )
      return data
    },
  )
}

export function useAprobarAnnotation() {
  return useAnnotationMutation(
    async ({ id, feedback }: { id: number; feedback?: string }) => {
      const { data } = await api.post<Anotacion>(
        `/api/annotations/${id}/aprobar/`,
        { feedback },
      )
      return data
    },
  )
}

export function useReobservarAnnotation() {
  return useAnnotationMutation(
    async ({ id, feedback }: { id: number; feedback?: string }) => {
      const { data } = await api.post<Anotacion>(
        `/api/annotations/${id}/reobservar/`,
        { feedback },
      )
      return data
    },
  )
}

export function useAnnotationHistory(id: number | undefined) {
  return useQuery({
    queryKey: ['annotation-history', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<AnotacionEvento[]>(
        `/api/annotations/${id}/historial/`,
      )
      return data
    },
  })
}
