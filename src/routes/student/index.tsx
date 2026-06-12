import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  CheckCircle2,
  FileText,
  Loader2,
  PlusCircle,
  School,
} from 'lucide-react'
import { useState } from 'react'

import { AuthGuard } from '#/components/auth/AuthGuard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import api from '#/lib/api'

import { StudentLayout } from '#/components/student/StudentLayout'
import { ProjectHero } from '#/components/student/ProjectHero'
import { ProcessStepper } from '#/components/student/ProcessStepper'
import { CurrentStatus } from '#/components/student/CurrentStatus'
import { UpcomingDates } from '#/components/student/UpcomingDates'
import { TimelineDeliveries } from '#/components/student/TimelineDeliveries'
import { TutorObservations } from '#/components/student/TutorObservations'
import { VersionHistoryCard } from '#/components/student/VersionHistoryCard'

export const Route = createFileRoute('/student/')({
  component: RouteComponent,
})

interface ProyectoGrado {
  id: number
  titulo: string
  estudiante: number
  estudiante_nombre: string
  estado: string
  created_at: string
}

interface ActiveProjectResponse {
  project: ProyectoGrado | null
}

interface ApiErrorResponse {
  detail?: string
}

export type { ProyectoGrado }

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['ESTUDIANTE']}>
      <StudentLayout>
        <StudentDashboard />
      </StudentLayout>
    </AuthGuard>
  )
}

function StudentDashboard() {
  const queryClient = useQueryClient()
  const [titulo, setTitulo] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const activeProjectQuery = useQuery({
    queryKey: ['student-active-project'],
    queryFn: async () => {
      const { data } = await api.get<ActiveProjectResponse>('/api/projects/active/')
      return data
    },
  })

  const createProject = useMutation({
    mutationFn: async (projectTitle: string) => {
      const { data } = await api.post<ProyectoGrado>('/api/projects/', { titulo: projectTitle })
      return data
    },
    onSuccess: (project) => {
      setTitulo('')
      setLocalError(null)
      queryClient.setQueryData<ActiveProjectResponse>(['student-active-project'], { project })
    },
  })

  const activeProject = activeProjectQuery.data?.project ?? null
  const isLoading = activeProjectQuery.isLoading
  const queryError = activeProjectQuery.error
    ? getProjectErrorMessage(activeProjectQuery.error)
    : null
  const errorMessage =
    localError ??
    (createProject.error ? getProjectErrorMessage(createProject.error) : null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanTitle = titulo.trim()

    if (!cleanTitle) {
      setLocalError('El título del proyecto es obligatorio.')
      return
    }

    setLocalError(null)
    createProject.mutate(cleanTitle)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-[#544244]">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando proyecto...
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="border-[#e2e2e2] bg-white/80 shadow-none backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-[#1a1c1c]">
              <School className="size-5 text-[#6b1d2f]" />
              Bienvenido a AcademicFlow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#544244] mb-6">
              Para comenzar, registra el título de tu proyecto de grado.
            </p>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#544244]" htmlFor="titulo">
                  Título del proyecto
                </label>
                <Input
                  id="titulo"
                  maxLength={255}
                  placeholder="Ej. Optimización de procesos académicos"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  aria-invalid={Boolean(errorMessage)}
                  className="h-12 rounded-lg border-[#dac0c2] bg-white text-base focus-visible:border-[#6b1d2f] focus-visible:ring-[#6b1d2f]/20"
                  disabled={createProject.isPending}
                />
                {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
              </div>
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="h-12 rounded-xl bg-[#6b1d2f] px-5 text-white hover:bg-[#4e051a]"
              >
                {createProject.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusCircle className="size-4" />
                )}
                Registrar proyecto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <ProjectHero project={activeProject} />
        <ProcessStepper />
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <CurrentStatus />
        <UpcomingDates />
      </div>

      <div className="col-span-12 lg:col-span-4">
        <TimelineDeliveries />
      </div>

      <div className="col-span-12 lg:col-span-5">
        <TutorObservations />
      </div>

      <div className="col-span-12 lg:col-span-3">
        <VersionHistoryCard />
      </div>
    </div>
  )
}

function getProjectErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? 'No se pudo registrar el proyecto.'
  }
  return 'No se pudo registrar el proyecto.'
}
