import { useEffect, useState } from 'react'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useGrupos } from '#/hooks/useGrupos'
import {
  useCreateEvento,
  useCreatePlantilla,
  usePlantillasActividad,
  useTiposActividad,
  useUpdateEvento,
} from '#/hooks/useSchedules'
import { cn } from '#/lib/utils'
import { PUBLICOS_OPCIONES, PUBLICO_LABELS } from './shared'
import type { EventoCronograma } from '#/types/dashboard'

const inputClass =
  'h-[44px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container'

export function NuevoEventoModal({
  open,
  onClose,
  evento,
}: {
  open: boolean
  onClose: () => void
  evento?: EventoCronograma
}) {
  const isEditing = !!evento

  const [descripcion, setDescripcion] = useState('')
  const [plantillaSearch, setPlantillaSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [tipo, setTipo] = useState('')
  const [publicos, setPublicos] = useState<Set<string>>(new Set())
  const [gruposSel, setGruposSel] = useState<Set<number>>(new Set())
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const grupos = useGrupos()
  const tipos = useTiposActividad()
  const plantillas = usePlantillasActividad()
  const crearPlantilla = useCreatePlantilla()
  const create = useCreateEvento()
  const update = useUpdateEvento()

  useEffect(() => {
    if (!open) return
    setDescripcion(evento?.descripcion ?? '')
    setPlantillaSearch(evento?.descripcion ?? '')
    setTipo(evento?.tipo ?? '')
    setPublicos(new Set(evento?.publicos ?? []))
    setGruposSel(new Set(evento?.grupos ?? []))
    setFechaInicio(evento?.fecha_inicio ?? '')
    setFechaFin(evento?.fecha_fin ?? '')
  }, [open, evento])

  const filteredPlantillas = (plantillas.data ?? []).filter((p) =>
    p.nombre.toLowerCase().includes(plantillaSearch.toLowerCase()),
  )
  const showAddOption =
    plantillaSearch.trim() &&
    !filteredPlantillas.some(
      (p) => p.nombre.toLowerCase() === plantillaSearch.toLowerCase(),
    )

  const selectPlantilla = (nombre: string) => {
    setDescripcion(nombre)
    setPlantillaSearch(nombre)
    setShowDropdown(false)
  }

  const addAndSelect = () => {
    const nombre = plantillaSearch.trim()
    if (!nombre) return
    crearPlantilla.mutate(nombre, { onSuccess: (p) => selectPlantilla(p.nombre) })
  }

  const togglePublico = (publico: string) => {
    setPublicos((prev) => {
      const next = new Set(prev)
      if (next.has(publico)) next.delete(publico)
      else next.add(publico)
      return next
    })
  }

  const toggleGrupo = (grupoId: number) => {
    setGruposSel((prev) => {
      const next = new Set(prev)
      if (next.has(grupoId)) next.delete(grupoId)
      else next.add(grupoId)
      return next
    })
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="thin-scrollbar max-h-[90vh] overflow-y-auto rounded-xl border-outline-variant sm:max-w-[30rem]">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-primary">
            {isEditing ? 'Editar evento' : 'Nuevo evento del cronograma'}
          </DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            Sin selección de grupos o públicos, el evento es visible para todos.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-md"
          onSubmit={(e) => {
            e.preventDefault()
            if (!descripcion.trim() || !tipo.trim() || !fechaInicio) return
            const payload = {
              descripcion: descripcion.trim(),
              tipo: tipo.trim(),
              publicos: [...publicos],
              grupos: [...gruposSel],
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin || fechaInicio,
              semestre: 1,
            }
            if (isEditing && evento) {
              update.mutate({ id: evento.id, ...payload }, { onSuccess: onClose })
            } else {
              create.mutate(payload, { onSuccess: onClose })
            }
          }}
        >
          {/* Descripción con combobox de plantillas */}
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="e-desc">
              Descripción
            </label>
            <div className="relative">
              <input
                id="e-desc"
                value={plantillaSearch}
                onChange={(e) => {
                  setPlantillaSearch(e.target.value)
                  setDescripcion(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Ej. Entrega Propuesta Tesis"
                className={inputClass}
                autoComplete="off"
              />
              {showDropdown && (filteredPlantillas.length > 0 || showAddOption) && (
                <div className="thin-scrollbar absolute z-50 mt-xs max-h-[180px] w-full overflow-y-auto rounded-xl border border-outline-variant bg-white shadow-lg">
                  {filteredPlantillas.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => selectPlantilla(p.nombre)}
                      className="flex w-full items-center px-md py-sm text-left text-body-sm hover:bg-surface-container-low"
                    >
                      {p.nombre}
                    </button>
                  ))}
                  {showAddOption && (
                    <button
                      type="button"
                      onMouseDown={addAndSelect}
                      disabled={crearPlantilla.isPending}
                      className="flex w-full items-center gap-xs border-t border-outline-variant px-md py-sm text-left text-body-sm text-primary hover:bg-surface-container-low disabled:opacity-50"
                    >
                      {crearPlantilla.isPending
                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        : <MaterialIcon name="add" size={16} />}
                      {crearPlantilla.isPending ? 'Guardando…' : `Agregar "${plantillaSearch.trim()}"`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tipo con datalist get_or_create */}
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="e-tipo">
              Tipo de actividad
            </label>
            <input
              id="e-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              list="tipos-actividad-modal"
              placeholder="Ej. ENTREGA (escribe uno nuevo para crearlo)"
              className={inputClass}
              autoComplete="off"
            />
            <datalist id="tipos-actividad-modal">
              {(tipos.data ?? []).map((t) => (
                <option key={t.id} value={t.nombre} />
              ))}
            </datalist>
          </div>

          {/* Públicos objetivo (multi) */}
          <div className="flex flex-col gap-xs">
            <span className="text-label-md text-on-surface-variant">
              Público objetivo{' '}
              <span className="text-label-sm text-outline">(ninguno = todos)</span>
            </span>
            <div className="flex flex-wrap gap-sm">
              {PUBLICOS_OPCIONES.map((publico) => (
                <button
                  key={publico}
                  type="button"
                  onClick={() => togglePublico(publico)}
                  className={cn(
                    'rounded-full border px-md py-xs text-label-sm transition-all',
                    publicos.has(publico)
                      ? 'border-primary bg-primary-container font-bold text-on-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary',
                  )}
                >
                  {PUBLICO_LABELS[publico]}
                </button>
              ))}
            </div>
          </div>

          {/* Grupos objetivo (siempre visible) */}
          <div className="flex flex-col gap-xs">
            <span className="text-label-md text-on-surface-variant">
              Grupos objetivo{' '}
              <span className="text-label-sm text-outline">(ninguno = todos los grupos)</span>
            </span>
            <div className="thin-scrollbar max-h-[130px] space-y-xs overflow-y-auto rounded-xl border border-outline-variant p-sm">
              {(grupos.data ?? []).map((grupo) => (
                <label
                  key={grupo.id}
                  className="flex cursor-pointer items-center gap-sm rounded px-xs py-[2px] hover:bg-surface-container-low"
                >
                  <input
                    type="checkbox"
                    checked={gruposSel.has(grupo.id)}
                    onChange={() => toggleGrupo(grupo.id)}
                    className="h-4 w-4 rounded border-outline-variant accent-[#6b1d2f]"
                  />
                  <span className="text-body-sm text-on-surface">{grupo.nombre}</span>
                </label>
              ))}
              {(grupos.data ?? []).length === 0 && (
                <p className="py-xs text-center text-label-sm text-outline">
                  No hay grupos creados.
                </p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-inicio">
                Fecha inicio
              </label>
              <input
                id="e-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="e-fin">
                Fecha fin (opcional)
              </label>
              <input
                id="e-fin"
                type="date"
                value={fechaFin}
                min={fechaInicio || undefined}
                onChange={(e) => setFechaFin(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-lg py-sm text-label-md text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending || !descripcion.trim() || !tipo.trim() || !fechaInicio}
              className="rounded-xl bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {pending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
