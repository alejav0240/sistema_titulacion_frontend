import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface UserFiltersProps {
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function UserFilters({
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1 rounded-lg shadow-sm">
      <Select onValueChange={onRoleChange} defaultValue="todos">
        <SelectTrigger className="border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 bg-transparent py-1.5 shadow-none">
          <SelectValue placeholder="Todos los Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los Roles</SelectItem>
          <SelectItem value="DOCENTE">Docente</SelectItem>
          <SelectItem value="TUTOR">Tutor</SelectItem>
          <SelectItem value="TRIBUNAL">Tribunal</SelectItem>
          <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
          <SelectItem value="DIRECTOR">Director</SelectItem>
          <SelectItem value="DTC">DTC</SelectItem>
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
