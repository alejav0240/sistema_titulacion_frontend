import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  History,
  Loader2,
  PlusCircle,
  School,
  Upload,
} from 'lucide-react'
import { useState } from 'react'

import { AuthGuard } from '#/components/auth/AuthGuard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import api from '#/lib/api'
import { useCreateVersion, useVersiones } from '#/hooks/useVersions'
import type { Version } from '#/types/version'

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

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['ESTUDIANTE']}>
      <StudentProjectRegistration />
    </AuthGuard>
  )
}

function StudentProjectRegistration() {
  const queryClient = useQueryClient()
  const [titulo, setTitulo] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const activeProjectQuery = useQuery({
    queryKey: ['student-active-project'],
    queryFn: async () => {
      const { data } = await api.get<ActiveProjectResponse>(
        '/api/projects/active/',
      )
      return data
    },
  })

  const createProject = useMutation({
    mutationFn: async (projectTitle: string) => {
      const { data } = await api.post<ProyectoGrado>('/api/projects/', {
        titulo: projectTitle,
      })
      return data
    },
    onSuccess: (project) => {
      setTitulo('')
      setLocalError(null)
      queryClient.setQueryData<ActiveProjectResponse>(
        ['student-active-project'],
        { project },
      )
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
      setLocalError('El titulo del proyecto es obligatorio.')
      return
    }

    setLocalError(null)
    createProject.mutate(cleanTitle)
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8 md:px-10">
        <header className="flex flex-col gap-4 border-b border-[#dac0c2] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#6b1d2f] text-white">
              <School className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#455f87]">AcademicFlow</p>
              <h1 className="text-2xl font-semibold tracking-normal text-[#4e051a]">
                Registro de Proyecto
              </h1>
            </div>
          </div>

          <Badge className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
            HU-003
          </Badge>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="border-[#e2e2e2] bg-white/80 shadow-none backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-[#1a1c1c]">
                <FileText className="size-5 text-[#6b1d2f]" />
                Proyecto de grado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex min-h-40 items-center justify-center text-sm text-[#544244]">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Cargando proyecto...
                </div>
              ) : queryError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {queryError}
                </p>
              ) : activeProject ? (
                <>
                  <ProjectSummary project={activeProject} />
                  <VersionSection />
                </>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-[#544244]"
                      htmlFor="titulo"
                    >
                      Titulo del proyecto
                    </label>
                    <Input
                      id="titulo"
                      maxLength={255}
                      placeholder="Ej. Optimizacion de procesos academicos"
                      value={titulo}
                      onChange={(event) => setTitulo(event.target.value)}
                      aria-invalid={Boolean(errorMessage)}
                      className="h-12 rounded-lg border-[#dac0c2] bg-white text-base focus-visible:border-[#6b1d2f] focus-visible:ring-[#6b1d2f]/20"
                      disabled={createProject.isPending}
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    )}
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
              )}
            </CardContent>
          </Card>

          <aside className="rounded-xl border border-[#e2e2e2] bg-white/70 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase text-[#455f87]">
              Estado inicial
            </p>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                En revision
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#544244]">
              El sistema asociara automaticamente el proyecto a tu usuario y
              registrara la fecha de creacion.
            </p>
          </aside>
        </div>
      </section>
    </main>
  )
}

function ProjectSummary({ project }: { project: ProyectoGrado }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#dac0c2] bg-[#f9f9f9] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#544244]">
              Proyecto registrado
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#4e051a]">
              {project.titulo}
            </h2>
          </div>
          <Badge className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
            {formatStatus(project.estado)}
          </Badge>
        </div>
      </div>

      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="font-medium text-[#544244]">Estudiante</dt>
          <dd className="mt-1 text-[#1a1c1c]">{project.estudiante_nombre}</dd>
        </div>
        <div>
          <dt className="font-medium text-[#544244]">Fecha de creacion</dt>
          <dd className="mt-1 text-[#1a1c1c]">
            {formatDate(project.created_at)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getProjectErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? 'No se pudo registrar el proyecto.'
  }

  return 'No se pudo registrar el proyecto.'
}

function getVersionErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? 'No se pudo registrar la versión.'
  }

  return 'No se pudo registrar la versión.'
}

const ESTADO_VARIANT: Record<string, string> = {
  'APROBADO': 'rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700',
  'EN REVISION': 'rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-yellow-700',
  'OBSERVADO': 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700',
}

function VersionSection() {
  const versionesQuery = useVersiones()
  const createVersion = useCreateVersion()
  const [versionUrl, setVersionUrl] = useState('')
  const [versionName, setVersionName] = useState('')
  const [versionLocalError, setVersionLocalError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanUrl = versionUrl.trim()

    if (!cleanUrl) {
      setVersionLocalError('El enlace de Google Drive es obligatorio.')
      return
    }

    if (!/^https:\/\/drive\.google\.com\/file\/d\//.test(cleanUrl)) {
      setVersionLocalError(
        'Debe ingresar un enlace válido de Google Drive (https://drive.google.com/file/d/...)',
      )
      return
    }

    setVersionLocalError(null)
    createVersion.mutate(
      { url_pdf: cleanUrl, nombre_archivo: versionName.trim() || undefined },
      {
        onSuccess: () => {
          setVersionUrl('')
          setVersionName('')
        },
      },
    )
  }

  const errorMsg =
    versionLocalError ??
    (createVersion.error ? getVersionErrorMessage(createVersion.error) : null)

  return (
    <div className="space-y-6">
      <Card className="border-[#e2e2e2] bg-white/80 shadow-none backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#1a1c1c]">
            <Upload className="size-5 text-[#6b1d2f]" />
            Nueva versión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#544244]"
                htmlFor="versionUrl"
              >
                Enlace de Google Drive
              </label>
              <Input
                id="versionUrl"
                placeholder="https://drive.google.com/file/d/..."
                value={versionUrl}
                onChange={(e) => setVersionUrl(e.target.value)}
                aria-invalid={Boolean(errorMsg)}
                className="h-12 rounded-lg border-[#dac0c2] bg-white text-base focus-visible:border-[#6b1d2f] focus-visible:ring-[#6b1d2f]/20"
                disabled={createVersion.isPending}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#544244]"
                htmlFor="versionName"
              >
                Nombre del archivo <span className="text-[#455f87]">(opcional)</span>
              </label>
              <Input
                id="versionName"
                placeholder="Ej. Tesis V2 corregida"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="h-12 rounded-lg border-[#dac0c2] bg-white text-base focus-visible:border-[#6b1d2f] focus-visible:ring-[#6b1d2f]/20"
                disabled={createVersion.isPending}
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-700">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={createVersion.isPending}
              className="h-12 rounded-xl bg-[#6b1d2f] px-5 text-white hover:bg-[#4e051a]"
            >
              {createVersion.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              Registrar versión
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[#e2e2e2] bg-white/80 shadow-none backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#1a1c1c]">
            <History className="size-5 text-[#6b1d2f]" />
            Historial de versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versionesQuery.isLoading ? (
            <div className="flex min-h-24 items-center justify-center text-sm text-[#544244]">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Cargando versiones...
            </div>
          ) : versionesQuery.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getVersionErrorMessage(versionesQuery.error)}
            </p>
          ) : versionesQuery.data?.versiones?.length ? (
            <VersionTable versiones={versionesQuery.data.versiones} />
          ) : (
            <div className="flex min-h-24 items-center justify-center text-sm text-[#544244]">
              No se tiene ninguna versión subida aún.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VersionTable({ versiones }: { versiones: Version[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#dac0c2] text-left text-xs font-semibold uppercase text-[#455f87]">
            <th className="py-3 pr-4">N°</th>
            <th className="py-3 pr-4">Archivo</th>
            <th className="py-3 pr-4">Estado</th>
            <th className="py-3 pr-4">Fecha</th>
            <th className="py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {versiones.map((v) => (
            <tr
              key={v.id}
              className="border-b border-[#dac0c2]/50 text-[#1a1c1c]"
            >
              <td className="py-3 pr-4 font-medium">v{v.numero_version}</td>
              <td className="py-3 pr-4">
                {v.nombre_archivo || `V${v.numero_version}.pdf`}
              </td>
              <td className="py-3 pr-4">
                <Badge className={ESTADO_VARIANT[v.estado] ?? ''}>
                  {v.estado_display}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-[#544244]">
                {formatDate(v.created_at)}
              </td>
              <td className="py-3 text-right">
                <a
                  href={v.url_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#455f87] hover:text-[#6b1d2f]"
                >
                  Ver
                  <ExternalLink className="size-3.5" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
