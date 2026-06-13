import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForgotPassword } from '#/hooks/useUsers'
import { MaterialIcon } from '#/components/ui/MaterialIcon'

export const Route = createFileRoute('/auth/forgot-password')({
  component: RouteComponent,
})

const inputClass =
  'w-full h-[52px] px-md rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all text-body-md placeholder:text-outline'

function RouteComponent() {
  const [email, setEmail] = useState('')
  const forgot = useForgotPassword()

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
            Recuperar contraseña
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Ingresa tu correo institucional y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </header>

        {forgot.isSuccess ? (
          <div className="rounded-xl border border-outline-variant bg-secondary-container/30 p-lg">
            <div className="mb-sm flex items-center gap-sm text-primary">
              <MaterialIcon name="mark_email_read" size={24} />
              <p className="text-label-md font-bold">Revisa tu correo</p>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Si el correo está registrado, recibirás un enlace para
              restablecer tu contraseña. El enlace expira en 1 hora.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim()) forgot.mutate(email.trim())
            }}
            className="space-y-lg"
          >
            <div className="flex flex-col gap-xs">
              <label
                className="text-label-md text-on-surface-variant"
                htmlFor="email"
              >
                Correo Institucional
              </label>
              <div className="group relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@universidad.edu"
                  className={inputClass}
                />
                <MaterialIcon
                  name="alternate_email"
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant transition-colors group-focus-within:text-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={forgot.isPending || !email.trim()}
              className="flex h-[56px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {forgot.isPending ? 'Enviando…' : 'Enviar enlace'}
              {!forgot.isPending && <MaterialIcon name="send" size={20} />}
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
