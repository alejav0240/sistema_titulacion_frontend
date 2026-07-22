import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Search } from 'lucide-react'

interface UserFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function UserFilters({
  search,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1 rounded-lg shadow-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-56 rounded-md border-none bg-transparent py-1.5 pl-8 pr-2 text-sm text-gray-600 outline-none focus:ring-0 dark:text-gray-400"
        />
      </div>
      <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 self-center mx-2" />
      <Select onValueChange={onRoleChange} defaultValue="todos">
        <SelectTrigger className="border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 bg-transparent py-1.5 shadow-none">
          <SelectValue placeholder="Todos los Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los Roles</SelectItem>
          <SelectItem value="DOCENTE">Docente</SelectItem>
          <SelectItem value="TUTOR">Tutor</SelectItem>
          <SelectItem value="TRIBUNAL">Tribunal</SelectItem>
          <SelectItem value="DIRECTOR">Director</SelectItem>
          <SelectItem value="DTC">DTC</SelectItem>
          <SelectItem value="COMITE_EVALUACION">Comité de Evaluación</SelectItem>
        </SelectContent>
      </Select>
      <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 self-center mx-2" />
      <Select onValueChange={onStatusChange} defaultValue="todos">
        <SelectTrigger className="border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 bg-transparent py-1.5 shadow-none">
          <SelectValue placeholder="Cualquier Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Cualquier Estado</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
