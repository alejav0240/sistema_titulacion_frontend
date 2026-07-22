import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useUpdateEntrega } from '#/hooks/useFormularios'
import {
  TIPO_FORMULARIO_LABELS,
  type Formulario,
  type FormularioEntrega,
} from '#/types/formulario'

const inputClass =
  'h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container'

/** Modal de 2 pasos para entregar el link propio de un formulario: paso 1 muestra
 * la carpeta que adjuntó el docente al habilitarlo, paso 2 pide el link + nombre
 * del archivo entregado. */
export function SubirFormularioModal({
  formulario,
  entrega,
  onClose,
}: {
  formulario: Formulario
  entrega: FormularioEntrega
  onClose: () => void
}) {
  const actualizar = useUpdateEntrega()
  const [paso, setPaso] = useState<1 | 2>(1)
  const [link, setLink] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-xl border-outline-variant sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            {TIPO_FORMULARIO_LABELS[formulario.tipo]}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Paso {paso} de 2
          </DialogDescription>
        </DialogHeader>

        {paso === 1 ? (
          <div className="space-y-md">
            <p className="text-label-md font-bold text-on-surface">
              Sube aquí tu formulario llenado
            </p>
            {formulario.carpeta_url ? (
              <div className="w-full flex items-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-primary">
                <MaterialIcon name="folder_open" size={18} className="" />
                <a
                  className="p-md text-body-sm hover:underline w-full"
                  href={formulario.carpeta_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formulario.carpeta_url}
                </a>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-outline-variant p-md text-body-sm text-outline">
                El docente no adjuntó un link de carpeta para esta actividad.
              </p>
            )}
            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-outline-variant px-lg py-sm text-label-md font-bold text-on-surface-variant"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setPaso(2)}
                className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-md"
            onSubmit={(e) => {
              e.preventDefault()
              actualizar.mutate(
                {
                  id: entrega.id,
                  link_url: link.trim(),
                  nombre_archivo: nombreArchivo.trim(),
                },
                {
                  onSuccess: () => {
                    toast.success('Documento entregado.')
                    onClose()
                  },
                },
              )
            }}
          >
            <div className="flex flex-col gap-xs">
              <label
                className="text-label-md text-on-surface-variant"
                htmlFor="sf-link"
              >
                Link del documento
              </label>
              <input
                id="sf-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                className={inputClass}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label
                className="text-label-md text-on-surface-variant"
                htmlFor="sf-nombre"
              >
                Nombre del archivo
              </label>
              <input
                id="sf-nombre"
                value={nombreArchivo}
                onChange={(e) => setNombreArchivo(e.target.value)}
                placeholder="Ej. Formulario_1_Juan_Perez.pdf"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="rounded-xl border border-outline-variant px-lg py-sm text-label-md font-bold text-on-surface-variant"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={actualizar.isPending || !link.trim()}
                className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
              >
                {actualizar.isPending ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
