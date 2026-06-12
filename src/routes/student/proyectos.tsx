import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import {
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
import { useCreateVersion, useVersiones } from '#/hooks/useVersions'
import { StudentLayout } from '#/components/student/StudentLayout'
import type { Version } from '#/types/version'

export const Route = createFileRoute('/student/proyectos')({
  component: RouteComponent,
})

interface ApiErrorResponse {
  detail?: string
}

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['ESTUDIANTE']}>
      <StudentLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex items-center gap-3 pb-6 border-b border-[#dac0c2]">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#6b1d2f] text-white">
              <School className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#455f87]">AcademicFlow</p>
              <h1 className="text-2xl font-semibold text-[#4e051a]">Gestión de Versiones</h1>
            </div>
          </header>

          <Card className="border-[#e2e2e2] bg-white/80 shadow-none backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-[#1a1c1c]">
                <Upload className="size-5 text-[#6b1d2f]" />
                Nueva versión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VersionForm />
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
              <VersionHistory />
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    </AuthGuard>
  )
}

function VersionForm() {
  const createVersion = useCreateVersion()
  const [versionUrl, setVersionUrl] = useState('')
  const [versionName, setVersionName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const cleanUrl = versionUrl.trim()

    if (!cleanUrl) {
      setLocalError('El enlace de Google Drive es obligatorio.')
      return
    }

    if (!/^https:\/\/drive\.google\.com\/file\/d\//.test(cleanUrl)) {
      setLocalError('Debe ingresar un enlace válido de Google Drive (https://drive.google.com/file/d/...)')
      return
    }

    setLocalError(null)
    createVersion.mutate(
      { url_pdf: cleanUrl, nombre_archivo: versionName.trim() || undefined },
      {
        onSuccess: () => { setVersionUrl(''); setVersionName('') },
      },
    )
  }

  const errorMsg = localError ?? (createVersion.error ? getVersionErrorMessage(createVersion.error) : null)

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#544244]" htmlFor="versionUrl">
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
        <label className="text-sm font-medium text-[#544244]" htmlFor="versionName">
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
      {errorMsg && <p className="text-sm text-red-700">{errorMsg}</p>}
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
        Registrar versión
      </Button>
    </form>
  )
}

function VersionHistory() {
  const { data, isLoading, error } = useVersiones()
  const versiones = data?.versiones ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-24 items-center justify-center text-sm text-[#544244]">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Cargando versiones...
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {getVersionErrorMessage(error)}
      </p>
    )
  }

  if (!versiones.length) {
    return (
      <div className="flex min-h-24 items-center justify-center text-sm text-[#544244]">
        No se tiene ninguna versión subida aún.
      </div>
    )
  }

  return <VersionTable versiones={versiones} />
}

const ESTADO_VARIANT: Record<string, string> = {
  'APROBADO': 'rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700',
  'EN REVISION': 'rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-yellow-700',
  'OBSERVADO': 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700',
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
            <th className="py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {versiones.map((v) => (
            <tr key={v.id} className="border-b border-[#dac0c2]/50 text-[#1a1c1c]">
              <td className="py-3 pr-4 font-medium">v{v.numero_version}</td>
              <td className="py-3 pr-4">{v.nombre_archivo || V.pdf}</td>
              <td className="py-3 pr-4">
                <Badge className={ESTADO_VARIANT[v.estado] ?? ''}>{v.estado_display}</Badge>
              </td>
              <td className="py-3 pr-4 text-[#544244]">
                {new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(v.created_at))}
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

function getVersionErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? 'No se pudo registrar la versión.'
  }
  return 'No se pudo registrar la versión.'
}
