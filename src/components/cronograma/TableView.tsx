import { useState } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useGrupos } from '#/hooks/useGrupos'
import {
  useCreateEvento,
  useDeleteEvento,
  useTiposActividad,
  useUpdateEvento,
} from '#/hooks/useSchedules'
import { cn } from '#/lib/utils'
import { PUBLICOS_OPCIONES, PUBLICO_LABELS, gruposLabel, publicosLabel, tipoStyle } from './shared'
import type { EventoCronograma } from '#/types/dashboard'

const cellInput =
  'w-full rounded border border-transparent bg-transparent px-xs py-[2px] text-body-sm outline-none transition-all hover:border-outline-variant focus:border-primary focus:bg-white'

/** Vista tabla notion-like: celdas editables inline (texto/tipo/fechas) y
 * fila fantasma al final para crear eventos sin abrir el modal.
 * Grupos y públicos se editan desde el modal (lápiz). */
export function TableView({
  eventos,
  canCreate,
  canEdit,
  onEdit,
}: {
  eventos: EventoCronograma[]
  canCreate: boolean
  canEdit: (evento: EventoCronograma) => boolean
  onEdit: (evento: EventoCronograma) => void
}) {
  const update = useUpdateEvento()
  const deleteEvento = useDeleteEvento()
  const ordered = [...eventos].sort(
    (a, b) => +new Date(a.fecha_inicio) - +new Date(b.fecha_inicio),
  )

  const patch = (evento: EventoCronograma, campo: string, valor: string) => {
    if (!valor.trim() || valor === (evento as unknown as Record<string, string>)[campo]) return
    update.mutate({ id: evento.id, [campo]: valor.trim() })
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {['Descripción', 'Tipo', 'Inicio', 'Fin', 'Grupos', 'Públicos', ''].map((h, i) => (
              <th
                key={i}
                className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ordered.map((evento) => {
            const editable = canEdit(evento)
            return (
              <tr key={evento.id} className="border-b border-outline-variant/40 transition-colors hover:bg-primary/5">
                <td className="px-md py-xs">
                  {editable ? (
                    <input
                      defaultValue={evento.descripcion}
                      onBlur={(e) => patch(evento, 'descripcion', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className={cn(cellInput, 'font-bold')}
                    />
                  ) : (
                    <span className="px-xs text-body-sm font-bold text-on-surface">{evento.descripcion}</span>
                  )}
                </td>
                <td className="px-md py-xs">
                  {editable ? (
                    <input
                      defaultValue={evento.tipo}
                      onBlur={(e) => patch(evento, 'tipo', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className={cellInput}
                    />
                  ) : (
                    <span className={cn('rounded px-xs py-[1px] text-[9px] font-bold uppercase', tipoStyle(evento.tipo).chip)}>
                      {evento.tipo}
                    </span>
                  )}
                </td>
                {(['fecha_inicio', 'fecha_fin'] as const).map((campo) => (
                  <td key={campo} className="px-md py-xs">
                    {editable ? (
                      <input
                        type="date"
                        defaultValue={evento[campo]}
                        onBlur={(e) => patch(evento, campo, e.target.value)}
                        className={cellInput}
                      />
                    ) : (
                      <span className="px-xs text-body-sm text-on-surface-variant">{evento[campo]}</span>
                    )}
                  </td>
                ))}
                <td className="max-w-[160px] truncate px-md py-xs text-label-sm text-outline" title={gruposLabel(evento)}>
                  {gruposLabel(evento)}
                </td>
                <td className="max-w-[160px] truncate px-md py-xs text-label-sm text-outline" title={publicosLabel(evento)}>
                  {publicosLabel(evento)}
                </td>
                <td className="px-md py-xs">
                  {editable && (
                    <div className="flex gap-xs">
                      <button
                        type="button"
                        onClick={() => onEdit(evento)}
                        title="Editar grupos y públicos"
                        className="rounded p-xs text-outline hover:text-primary"
                      >
                        <MaterialIcon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvento.mutate(evento.id)}
                        title="Eliminar"
                        className="rounded p-xs text-outline hover:text-error"
                      >
                        <MaterialIcon name="delete" size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
          {canCreate && <GhostRow />}
        </tbody>
      </table>
    </div>
  )
}

/** Fila fantasma: crea el evento al completar descripción + fecha de inicio. */
function GhostRow() {
  const create = useCreateEvento()
  const tipos = useTiposActividad()
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('')
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [publicos, setPublicos] = useState<Set<string>>(new Set())
  const [gruposSel, setGruposSel] = useState<Set<number>>(new Set())

  const crear = () => {
    if (!descripcion.trim() || !inicio) return
    create.mutate(
      {
        descripcion: descripcion.trim(),
        tipo: tipo.trim() || 'ADMINISTRATIVO',
        publicos: [...publicos],
        grupos: [...gruposSel],
        fecha_inicio: inicio,
        fecha_fin: fin || inicio,
        semestre: 1,
      },
      {
        onSuccess: () => {
          toast.success('Evento creado.')
          setDescripcion('')
          setTipo('')
          setInicio('')
          setFin('')
          setPublicos(new Set())
          setGruposSel(new Set())
        },
      },
    )
  }

  return (
    <tr className="bg-surface-container-lowest/60">
      <td className="px-md py-xs">
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="+ Nueva actividad…"
          className={cellInput}
        />
      </td>
      <td className="px-md py-xs">
        <input
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Tipo"
          list="tipos-actividad-ghost"
          className={cellInput}
        />
        <datalist id="tipos-actividad-ghost">
          {(tipos.data ?? []).map((t) => (
            <option key={t.id} value={t.nombre} />
          ))}
        </datalist>
      </td>
      <td className="px-md py-xs">
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={cellInput} />
      </td>
      <td className="px-md py-xs">
        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className={cellInput} />
      </td>
      <td colSpan={2} className="px-md py-xs">
        <GrupoPublicoPicker
          publicos={publicos}
          setPublicos={setPublicos}
          gruposSel={gruposSel}
          setGruposSel={setGruposSel}
        />
      </td>
      <td className="px-md py-xs">
        <button
          type="button"
          onClick={crear}
          disabled={!descripcion.trim() || !inicio || create.isPending}
          className="rounded bg-primary px-sm py-1 text-[10px] font-bold uppercase text-[#fff] hover:brightness-110 disabled:opacity-40"
        >
          {create.isPending ? '…' : 'Crear'}
        </button>
      </td>
    </tr>
  )
}

/** Multiselect inline tipo Notion: un botón resumen que abre un popover con
 * checkboxes de grupos y pills de públicos, sin salir de la tabla. */
function GrupoPublicoPicker({
  publicos,
  setPublicos,
  gruposSel,
  setGruposSel,
}: {
  publicos: Set<string>
  setPublicos: (updater: (prev: Set<string>) => Set<string>) => void
  gruposSel: Set<number>
  setGruposSel: (updater: (prev: Set<number>) => Set<number>) => void
}) {
  const [open, setOpen] = useState(false)
  const grupos = useGrupos()

  const togglePublico = (p: string) =>
    setPublicos((prev) => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })

  const toggleGrupo = (id: number) =>
    setGruposSel((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const resumen =
    publicos.size === 0 && gruposSel.size === 0
      ? 'Todos'
      : [
          publicos.size > 0 && `${publicos.size} público(s)`,
          gruposSel.size > 0 && `${gruposSel.size} grupo(s)`,
        ]
          .filter(Boolean)
          .join(' · ')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full truncate rounded border border-transparent px-xs py-[2px] text-left text-label-sm text-outline hover:border-outline-variant"
      >
        {resumen}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="thin-scrollbar absolute z-50 mt-xs w-64 space-y-sm rounded-xl border border-outline-variant bg-white p-sm shadow-lg">
            <div>
              <p className="mb-xs text-[9px] font-bold uppercase tracking-wider text-outline">
                Públicos (ninguno = todos)
              </p>
              <div className="flex flex-wrap gap-xs">
                {PUBLICOS_OPCIONES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePublico(p)}
                    className={cn(
                      'rounded-full border px-sm py-[2px] text-[10px] transition-all',
                      publicos.has(p)
                        ? 'border-primary bg-primary-container font-bold text-on-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary',
                    )}
                  >
                    {PUBLICO_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-xs text-[9px] font-bold uppercase tracking-wider text-outline">
                Grupos (ninguno = todos)
              </p>
              <div className="thin-scrollbar max-h-[120px] space-y-[2px] overflow-y-auto">
                {(grupos.data ?? []).map((grupo) => (
                  <label
                    key={grupo.id}
                    className="flex cursor-pointer items-center gap-sm rounded px-xs py-[2px] hover:bg-surface-container-low"
                  >
                    <input
                      type="checkbox"
                      checked={gruposSel.has(grupo.id)}
                      onChange={() => toggleGrupo(grupo.id)}
                      className="h-3.5 w-3.5 rounded border-outline-variant accent-[#6b1d2f]"
                    />
                    <span className="text-label-sm text-on-surface">{grupo.nombre}</span>
                  </label>
                ))}
                {(grupos.data ?? []).length === 0 && (
                  <p className="py-xs text-center text-label-sm text-outline">Sin grupos.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
