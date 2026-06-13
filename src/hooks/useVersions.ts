import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import api from '#/lib/api'
import type { Version } from '#/types/project'

export function versionPdfUrl(versionId: number) {
  return `${import.meta.env.VITE_API_URL}/api/versions/${versionId}/pdf/`
}

export function useVersions(projectId: number | undefined) {
  return useQuery({
    queryKey: ['versions', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data } = await api.get<Version[]>(
        `/api/projects/${projectId}/versions/`,
      )
      return data
    },
  })
}

export function useVersion(versionId: number | undefined) {
  return useQuery({
    queryKey: ['version', versionId],
    enabled: !!versionId,
    queryFn: async () => {
      const { data } = await api.get<Version>(`/api/versions/${versionId}/`)
      return data
    },
  })
}

export function useCreateVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      projectId,
      url_pdf,
      nombre_archivo,
    }: {
      projectId: number
      url_pdf: string
      nombre_archivo?: string
    }) => {
      const { data } = await api.post<Version>(
        `/api/projects/${projectId}/versions/`,
        { url_pdf, nombre_archivo },
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['versions', vars.projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['student-active-project'] })
    },
  })
}

export function useDeleteVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (versionId: number) => {
      await api.delete(`/api/versions/${versionId}/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['versions'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['student-active-project'] })
    },
  })
}

export function useReviewVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      versionId,
      accion,
    }: {
      versionId: number
      accion: 'APROBAR' | 'OBSERVAR'
    }) => {
      const { data } = await api.post<Version>(
        `/api/versions/${versionId}/review/`,
        { accion },
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['version', data.id] })
      qc.invalidateQueries({ queryKey: ['versions'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
