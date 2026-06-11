import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  Version,
  VersionCreate,
  VersionesResponse,
} from '#/types/version'

export function useVersiones() {
  return useQuery({
    queryKey: ['project-versions'],
    queryFn: async () => {
      const { data } = await api.get<VersionesResponse>(
        '/api/projects/versions/',
      )
      return data
    },
  })
}

export function useCreateVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (versionData: VersionCreate) => {
      const { data } = await api.post<Version>(
        '/api/projects/versions/',
        versionData,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-versions'] })
    },
  })
}
