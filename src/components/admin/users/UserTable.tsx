import { Link } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  Edit,
  ChevronLeft,
  ChevronRight,
  UserMinus,
  UserCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { RoleBadge } from '../ui/RoleBadge'
import { StatusDot } from '../ui/StatusDot'
import type { Usuario } from '#/types/user'

const columnHelper = createColumnHelper<Usuario>()

interface UserTableProps {
  users: Usuario[]
  page: number
  onPageChange: (page: number) => void
  totalCount: number
  onEdit?: (user: Usuario) => void
  onToggleActive?: (user: Usuario) => void
}

const createColumns = (
  onEdit?: (user: Usuario) => void,
  onToggleActive?: (user: Usuario) => void,
) => [
  columnHelper.accessor('nombre', {
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.original
      const initials = user.nombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      return (
        <Link
          to="/admin/usuarios/$usuarioId"
          params={{ usuarioId: String(user.id) }}
          className="flex items-center gap-3"
        >
          <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-red-900/20 transition-all">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-primary dark:text-white">{user.nombre}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </Link>
      )
    },
  }),
  columnHelper.accessor('rol', {
    header: 'Rol(es)',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {(row.original.roles_efectivos?.length
          ? row.original.roles_efectivos
          : [row.original.rol]
        ).map((rol) => (
          <RoleBadge key={rol} rol={rol} />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor('is_active', {
    header: 'Estado',
    cell: ({ getValue }) => <StatusDot isActive={getValue()} />,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Último Acceso',
    cell: ({ getValue }) => {
      const date = new Date(getValue())
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center justify-end gap-1 transition-opacity">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
            title="Editar"
            onClick={() => onEdit?.(user)}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title={user.is_active ? 'Desactivar' : 'Activar'}
            onClick={() => onToggleActive?.(user)}
          >
            {user.is_active ? (
              <UserMinus className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </button>
        </div>
      )
    },
  }),
]

export function UserTable({
  users,
  page,
  onPageChange,
  totalCount,
  onEdit,
  onToggleActive,
}: UserTableProps) {
  const table = useReactTable({
    data: users,
    columns: createColumns(onEdit, onToggleActive),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / 10),
  })

  const totalPages = Math.ceil(totalCount / 10) || 1

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-50/50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={createColumns(onEdit, onToggleActive).length}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Mostrar:</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 bg-red-900/10 text-red-900 dark:text-red-400 rounded text-sm font-medium">
              10
            </button>
            <button className="px-2 py-1 hover:bg-white dark:hover:bg-zinc-800 rounded text-sm text-gray-500 dark:text-gray-400 transition-colors">
              25
            </button>
            <button className="px-2 py-1 hover:bg-white dark:hover:bg-zinc-800 rounded text-sm text-gray-500 dark:text-gray-400 transition-colors">
              50
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Página {page} de {totalPages} | {totalCount} usuarios totales
          </span>
          <div className="flex gap-1">
            <button
              className="p-1.5 rounded border border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded border border-gray-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
