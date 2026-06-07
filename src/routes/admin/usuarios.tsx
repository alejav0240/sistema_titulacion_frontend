import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sidebar } from '#/components/admin/ui/Sidebar'
import { TopBar } from '#/components/admin/ui/TopBar'
import { StatsCards } from '#/components/admin/ui/StatsCards'
import { UserFilters } from '#/components/admin/users/UserFilters'
import { UserTable } from '#/components/admin/users/UserTable'
import { UserModal } from '#/components/admin/users/UserModal'
import { ImportUsersModal } from '#/components/admin/users/ImportUsersModal'
import { Button } from '#/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { useUsers, useDeactivateUser, useActivateUser } from '#/hooks/useUsers'
import type { Usuario } from '#/types/user'
import { AuthGuard } from '#/components/auth/AuthGuard'

export const Route = createFileRoute('/admin/usuarios')({
  component: UsuariosPage,
})

function UsuariosPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<{
    rol?: string
    estado?: string
    search?: string
  }>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)

  const { data, isLoading } = useUsers(page, filters)
  const deactivateMutation = useDeactivateUser()
  const activateMutation = useActivateUser()

  const handleEdit = (user: Usuario) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleToggleActive = (user: Usuario) => {
    const action = user.is_active ? 'desactivar' : 'activar'
    if (
      window.confirm(
        `¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${user.nombre}?`,
      )
    ) {
      if (user.is_active) {
        deactivateMutation.mutate(user.id)
      } else {
        activateMutation.mutate(user.id)
      }
    }
  }

  const handleModalClose = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setEditingUser(null)
    }
  }

  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DOCENTE', 'DTC', 'TRIBUNAL', 'TUTOR']}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar />
      <TopBar />

      <main className="ml-[260px] pt-16 min-h-screen px-10 pb-8">
        <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Gestion de Usuarios
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              Administra el acceso, roles y asignaciones del personal academico.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UserFilters
              onRoleChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  rol: value === 'todos' ? undefined : value,
                }))
              }
              onStatusChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  estado: value === 'todos' ? undefined : value,
                }))
              }
            />
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-red-900 text-white hover:bg-red-800 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Agregar usuario
            </Button>
          </div>
        </div>

        <StatsCards
          total={data?.count || 0}
          activos={data?.results.filter((u) => u.is_active).length || 0}
          pendientes={data?.results.filter((u) => !u.is_active).length || 0}
        />

        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Cargando usuarios...
          </div>
        ) : (
          <UserTable
            users={data?.results || []}
            page={page}
            onPageChange={setPage}
            totalCount={data?.count || 0}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        )}
      </main>

      <UserModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        user={editingUser}
      />
      <ImportUsersModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
    </AuthGuard>
  )
}
