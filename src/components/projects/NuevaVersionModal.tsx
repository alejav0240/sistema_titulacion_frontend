import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useCreateVersion } from '#/hooks/useVersions'

/** Modal "Subir nueva versión", reusado en el dashboard del estudiante y en
 * el visor de documento (subsanación que requiere una versión nueva). */
export function NuevaVersionModal({
  open,
  onClose,
  projectId,
  nextVersion,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  projectId?: number
  nextVersion: number
  onCreated?: (versionId: number) => void
}) {
  const [url, setUrl] = useState('')
  const [nombre, setNombre] = useState('')
  const createVersion = useCreateVersion()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            Nueva Entrega (V{nextVersion})
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Pega el link de Google Drive de tu documento PDF. El archivo debe
            estar compartido como «Cualquier persona con el enlace».
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!projectId || !url.trim()) return
            createVersion.mutate(
              {
                projectId,
                url_pdf: url.trim(),
                nombre_archivo: nombre.trim(),
              },
              {
                onSuccess: (version) => {
                  setUrl('')
                  setNombre('')
                  onClose()
                  onCreated?.(version.id)
                },
              },
            )
          }}
        >
          <div className="flex flex-col gap-xs">
            <label
              className="text-label-md text-on-surface-variant"
              htmlFor="drive-url"
            >
              Link de Google Drive
            </label>
            <input
              id="drive-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
              className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label
              className="text-label-md text-on-surface-variant"
              htmlFor="file-name"
            >
              Nombre del archivo (opcional)
            </label>
            <input
              id="file-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`tesis_v${nextVersion}.pdf`}
              className="h-[48px] rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-container"
            />
          </div>
          {createVersion.isError && (
            <p className="rounded-lg bg-error-container p-sm text-body-sm text-on-error-container">
              {(() => {
                const err = createVersion.error as {
                  response?: { data?: { url_pdf?: string[]; detail?: string } }
                }
                return (
                  err.response?.data?.url_pdf?.[0] ??
                  err.response?.data?.detail ??
                  'No se pudo registrar la entrega.'
                )
              })()}
            </p>
          )}
          <button
            type="submit"
            disabled={createVersion.isPending || !url.trim()}
            className="flex h-[48px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            <MaterialIcon name="upload_file" size={20} />
            {createVersion.isPending ? 'Registrando…' : 'Registrar entrega'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
