import { useQuery } from '@tanstack/react-query'
import api from '#/lib/api'
import type {
  DirectorDashboard,
  StudentDashboard,
  TeacherDashboard,
} from '#/types/dashboard'

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => {
      const { data } = await api.get<StudentDashboard>('/api/dashboard/student/')
      return data
    },
  })
}

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'teacher'],
    queryFn: async () => {
      const { data } = await api.get<TeacherDashboard>('/api/dashboard/teacher/')
      return data
    },
  })
}

export function useDirectorDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'director'],
    queryFn: async () => {
      const { data } = await api.get<DirectorDashboard>(
        '/api/dashboard/director/',
      )
      return data
    },
  })
}
