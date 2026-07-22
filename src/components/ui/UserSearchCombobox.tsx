import { useState } from 'react'
import { initials } from '#/components/layout/Topbar'
import { useDebouncedValue } from '#/hooks/useDebouncedValue'
import { useUsers } from '#/hooks/useUsers'
import type { Usuario } from '#/types/user'

/**
 * Buscador de usuarios estilo Teams: se abre al enfocar mostrando resultados
 * iniciales, filtra por texto y opcionalmente por roles (CSV: "DOCENTE,TUTOR").
 */
export function UserSearchCombobox({
  onSelect,
  roles,
  excludeIds = [],
  placeholder = 'Buscar por nombre o email…',
}: {
  onSelect: (usuario: Usuario) => void
  roles?: string
  excludeIds?: number[]
  placeholder?: string
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const [open, setOpen] = useState(false)
  const users = useUsers(1, {
    roles,
    search: debouncedSearch || undefined,
    estado: 'activo',
  })

  const results = (users.data?.results ?? []).filter(
    (u) => !excludeIds.includes(u.id),
  )

  return (
    <div className="relative">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="h-[40px] w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
      />
      {open && (
        <div className="thin-scrollbar absolute z-50 mt-xs max-h-[240px] w-full overflow-y-auto rounded-xl border border-outline-variant bg-white shadow-lg">
          {results.map((usuario) => (
            <button
              key={usuario.id}
              type="button"
              onMouseDown={() => {
                onSelect(usuario)
                setSearch('')
              }}
              className="flex w-full items-center gap-sm px-md py-sm text-left hover:bg-surface-container-low"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-[9px] font-bold text-on-secondary-container">
                {initials(usuario.nombre)}
              </span>
              <span className="min-w-0">
                <span
                  className="block truncate text-label-md text-on-surface"
                  title={usuario.nombre}
                >
                  {usuario.nombre}
                </span>
                <span
                  className="block truncate text-label-sm text-outline"
                  title={`${usuario.email} · ${usuario.rol}`}
                >
                  {usuario.email} · {usuario.rol}
                </span>
                {usuario.rol === 'DOCENTE' && (
                  <span className="block truncate text-label-sm text-outline">
                    Cupos: {usuario.tutorados_activos}/{usuario.cupos_tutor || '∞'} tutor ·{' '}
                    {usuario.tribunales_activos}/{usuario.cupos_tribunal || '∞'} tribunal
                    {usuario.nivel_tribunal && ` · ${usuario.nivel_tribunal}`}
                  </span>
                )}
              </span>
            </button>
          ))}
          {!users.isLoading && results.length === 0 && (
            <p className="px-md py-sm text-body-sm text-outline">Sin resultados.</p>
          )}
          {users.isLoading && (
            <p className="px-md py-sm text-body-sm text-outline">Buscando…</p>
          )}
        </div>
      )}
    </div>
  )
}
