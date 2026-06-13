import { useMutation, useQuery } from '@tanstack/react-query'
import api from '#/lib/api'

export interface AnalyticsData {
  kpis: {
    tasa_aprobacion: number
    tiempo_resolucion_dias: number
    obs_resueltas_pct: number
    total_observaciones: number
  }
  evolucion_entregas: Array<{ mes: string; total: number }>
  competencias: Array<{ eje: string; valor: number }>
  proyectos_por_materia: Array<{
    materia: string
    aprobado: number
    en_revision: number
    observado: number
  }>
  ranking_tutores: Array<{
    nombre: string
    estudiantes: number
    efectividad: number
  }>
  obs_por_materia: Array<{ materia: string; promedio: number }>
  actividad_por_hora: number[]
  nube_observaciones: Array<{ palabra: string; total: number }>
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['reports-analytics'],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsData>('/api/reports/analytics/')
      return data
    },
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ formato }: { formato: 'pdf' | 'xlsx' }) => {
      const response = await api.post(
        '/api/reports/export/',
        { formato },
        { responseType: 'blob' },
      )
      const url = URL.createObjectURL(response.data as Blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_academicflow.${formato}`
      link.click()
      URL.revokeObjectURL(url)
    },
  })
}
