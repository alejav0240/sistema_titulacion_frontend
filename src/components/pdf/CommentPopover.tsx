import { useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'
import { initials } from '#/components/layout/Topbar'
import { cn } from '#/lib/utils'
import type { Severidad } from '#/types/annotation'

export function CommentPopover({
  position,
  onSubmit,
  onCancel,
  pending = false,
}: {
  position: { left: number; top: number }
  onSubmit: (payload: { comentario: string; severidad: Severidad; accion_a_realizar: string }) => void
  onCancel: () => void
  pending?: boolean
}) {
  const user = useStore(authStore, (s) => s.user)
  const [comentario, setComentario] = useState('')
  const [accion, setAccion] = useState('')
  const [severidad, setSeveridad] = useState<Severidad>('CRITICO')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const id = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(id)
  }, [])

  const canSubmit = comentario.trim() && accion.trim() && !pending

  return (
    <div
      className="absolute z-50 w-[300px] rounded-xl border border-outline-variant bg-white p-md shadow-2xl"
      style={{ left: position.left, top: position.top }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-md flex items-center gap-sm">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-primary">
          {initials(user?.nombre)}
        </div>
        <span className="text-label-md font-bold">{user?.nombre}</span>
      </div>

      {/* Campo 1: Observación */}
      <div className="mb-sm">
        <label className="mb-xs block text-[10px] font-bold uppercase tracking-wider text-outline">
          Observación <span className="text-error">*</span>
        </label>
        <textarea
          ref={textareaRef}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Describe el problema encontrado..."
          rows={2}
          className="w-full resize-none border-none p-0 text-body-sm outline-none placeholder:text-outline focus:ring-0"
        />
      </div>

      {/* Campo 2: Acción a realizar */}
      <div className="mb-sm border-t border-outline-variant/50 pt-sm">
        <label className="mb-xs block text-[10px] font-bold uppercase tracking-wider text-outline">
          Acción a realizar <span className="text-error">*</span>
        </label>
        <textarea
          value={accion}
          onChange={(e) => setAccion(e.target.value)}
          placeholder="Indica qué debe corregir el estudiante..."
          rows={2}
          className="w-full resize-none border-none p-0 text-body-sm outline-none placeholder:text-outline focus:ring-0"
        />
      </div>

      {/* Severidad */}
      <div className="flex gap-sm">
        {(
          [
            ['CRITICO', 'Crítico'],
            ['SUGERENCIA', 'Sugerencia'],
          ] as Array<[Severidad, string]>
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSeveridad(value)}
            className={cn(
              'rounded px-xs py-[2px] text-[10px] font-bold uppercase tracking-wider transition-all',
              value === 'CRITICO'
                ? 'border-b-2 border-[#FFD700] bg-[rgba(255,222,0,0.3)]'
                : 'border-b-2 border-[#22c55e] bg-[rgba(34,197,94,0.3)]',
              severidad === value
                ? 'opacity-100 ring-1 ring-primary'
                : 'opacity-50 hover:opacity-80',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-md flex justify-end gap-sm">
        <button
          type="button"
          onClick={onCancel}
          className="px-md py-sm text-label-sm text-secondary"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              comentario: comentario.trim(),
              severidad,
              accion_a_realizar: accion.trim(),
            })
          }
          className="rounded-lg bg-primary px-md py-sm text-label-sm font-bold text-[#fff] disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Comentar'}
        </button>
      </div>
    </div>
  )
}
