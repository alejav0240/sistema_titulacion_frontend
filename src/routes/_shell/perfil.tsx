import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { initials } from '#/components/layout/Topbar'
import { useChangePassword, useMe, useUpdateMe } from '#/hooks/useUsers'
import { ROL_LABELS } from '#/lib/roles'

export const Route = createFileRoute('/_shell/perfil')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard>
      <PerfilPage />
    </AuthGuard>
  )
}

const inputClass =
  'w-full rounded-lg border border-outline-variant px-md py-sm text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container disabled:bg-surface-container disabled:text-outline'

const CAPACIDAD_LABELS: Record<string, string> = {
  TUTOR_TESIS: 'Tutor de Tesis',
  TRIBUNAL: 'Tribunal',
  TIEMPO_COMPLETO: 'Docente a Tiempo Completo',
  DOCENTE_MATERIA: 'Docente de Materia',
}

function PerfilPage() {
  const me = useMe()
  const updateMe = useUpdateMe()
  const changePassword = useChangePassword()

  const [nombre, setNombre] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    if (me.data) setNombre(me.data.nombre)
  }, [me.data])

  if (me.isLoading) {
    return (
      <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
    )
  }

  const user = me.data
  const rolesChips = Array.from(
    new Set([...(user?.roles_efectivos ?? []), ...(user ? [user.rol] : [])]),
  )

  return (
    <div className="mx-auto max-w-4xl space-y-lg">
      <header>
        <h2 className="text-headline-lg text-primary">Mi Perfil</h2>
        <p className="text-body-md text-on-surface-variant">
          Gestiona tu información personal y tu contraseña.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        {/* Datos personales */}
        <div className="rounded-xl border border-outline-variant bg-white p-lg">
          <div className="mb-lg flex items-center gap-md">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary">
              {initials(user?.nombre)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-label-md font-bold text-on-surface">
                {user?.nombre}
              </p>
              <p className="truncate text-body-sm text-outline">{user?.email}</p>
              <div className="mt-xs flex flex-wrap gap-xs">
                {rolesChips.map((rol) => (
                  <span
                    key={rol}
                    className="rounded-full bg-secondary-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-secondary-container"
                  >
                    {ROL_LABELS[rol] ?? rol}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!nombre.trim()) return
              updateMe.mutate(
                { nombre: nombre.trim() },
                {
                  onSuccess: () => toast.success('Perfil actualizado.'),
                },
              )
            }}
            className="space-y-md"
          >
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="nombre">
                Nombre completo
              </label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="email">
                Email institucional
              </label>
              <input id="email" value={user?.email ?? ''} disabled className={inputClass} />
              <p className="text-label-sm text-outline">
                El email solo puede cambiarlo la Dirección.
              </p>
            </div>

            {(user?.capacidades?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-xs">
                <span className="text-label-md text-on-surface-variant">
                  Capacidades
                </span>
                <div className="flex flex-wrap gap-xs">
                  {user?.capacidades.map((capacidad) => (
                    <span
                      key={capacidad}
                      className="rounded-lg border border-outline-variant px-sm py-xs text-label-sm text-on-surface-variant"
                    >
                      {CAPACIDAD_LABELS[capacidad] ?? capacidad}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={updateMe.isPending || !nombre.trim() || nombre.trim() === user?.nombre}
              className="flex items-center gap-xs rounded-lg bg-primary-container px-lg py-sm text-label-md font-bold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              <MaterialIcon name="save" size={18} />
              {updateMe.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="h-fit rounded-xl border border-outline-variant bg-white p-lg">
          <h3 className="mb-md flex items-center gap-sm text-label-md font-bold text-on-surface">
            <MaterialIcon name="lock_reset" size={20} className="text-primary" />
            Cambiar contraseña
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!oldPassword || !newPassword || newPassword !== confirm) return
              changePassword.mutate(
                { old_password: oldPassword, new_password: newPassword },
                {
                  onSuccess: () => {
                    toast.success('Contraseña actualizada correctamente.')
                    setOldPassword('')
                    setNewPassword('')
                    setConfirm('')
                  },
                },
              )
            }}
            className="space-y-md"
          >
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="old">
                Contraseña actual
              </label>
              <input
                id="old"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="new">
                Nueva contraseña
              </label>
              <input
                id="new"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="confirm">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
              {confirm.length > 0 && newPassword !== confirm && (
                <span className="text-label-sm text-error">
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={
                changePassword.isPending ||
                !oldPassword ||
                !newPassword ||
                newPassword !== confirm
              }
              className="flex items-center gap-xs rounded-lg border border-primary px-lg py-sm text-label-md font-bold text-primary transition-all hover:bg-primary-container hover:text-on-primary disabled:opacity-50"
            >
              <MaterialIcon name="key" size={18} />
              {changePassword.isPending ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
