import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { useResetPassword } from '#/hooks/useUsers'
import { MaterialIcon } from '#/components/ui/MaterialIcon'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: z.object({
    uid: z.string().optional(),
    token: z.string().optional(),
  }),
  component: RouteComponent,
})

const inputClass =
  'w-full h-[52px] px-md rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all text-body-md placeholder:text-outline'

function RouteComponent() {
  const { uid, token } = Route.useSearch()
  const navigate = useNavigate()
  const reset = useResetPassword()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const linkInvalido = !uid || !token
  const noCoinciden = confirm.length > 0 && password !== confirm

  const errorMessage = (() => {
    if (!reset.isError) return null
    const err = reset.error as {
      response?: { data?: { detail?: string; new_password?: string[] } }
    }
    return (
      err.response?.data?.detail ||
      err.response?.data?.new_password?.[0] ||
      'No se pudo restablecer la contraseña.'
    )
  })()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-container-margin text-on-surface">
      <div className="w-full max-w-[440px]">
        <div className="mb-xl flex items-center gap-sm">
          <MaterialIcon name="school" fill size={32} className="text-primary" />
          <span className="text-headline-md font-bold text-primary">
            AcademicFlow
          </span>
        </div>

        <header className="mb-xl">
          <h2 className="mb-xs text-headline-lg text-on-surface">
            Nueva contraseña
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Define la nueva contraseña para tu cuenta.
          </p>
        </header>

        {linkInvalido ? (
          <div className="rounded-xl bg-error-container p-lg text-body-sm text-on-error-container">
            El enlace está incompleto. Solicita uno nuevo desde{' '}
            <Link to="/auth/forgot-password" className="font-bold underline">
              recuperar contraseña
            </Link>
            .
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (password && password === confirm) {
                reset.mutate(
                  { uid, token, new_password: password },
                  {
                    onSuccess: () => {
                      setTimeout(
                        () => navigate({ to: '/auth/login' }),
                        2000,
                      )
                    },
                  },
                )
              }
            }}
            className="space-y-lg"
          >
            {errorMessage && (
              <p className="rounded-xl bg-error-container p-3 text-body-sm text-on-error-container">
                {errorMessage}
              </p>
            )}
            {reset.isSuccess && (
              <p className="rounded-xl bg-secondary-container/40 p-3 text-body-sm text-on-secondary-container">
                Contraseña restablecida. Redirigiendo al inicio de sesión…
              </p>
            )}

            <div className="flex flex-col gap-xs">
              <label
                className="text-label-md text-on-surface-variant"
                htmlFor="password"
              >
                Nueva contraseña
              </label>
              <div className="group relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={inputClass + ' pr-12'}
                />
                <button
                  type="button"
                  className="absolute right-md top-1/2 -translate-y-1/2 cursor-pointer text-outline-variant transition-colors hover:text-primary"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <MaterialIcon name={show ? 'visibility_off' : 'visibility'} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label
                className="text-label-md text-on-surface-variant"
                htmlFor="confirm"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type={show ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className={inputClass}
              />
              {noCoinciden && (
                <span className="text-label-sm text-error">
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={
                reset.isPending ||
                reset.isSuccess ||
                !password ||
                password !== confirm
              }
              className="flex h-[56px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {reset.isPending ? 'Guardando…' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <p className="mt-xl text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-xs text-label-md text-primary transition-all hover:underline"
          >
            <MaterialIcon name="arrow_back" size={16} />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
