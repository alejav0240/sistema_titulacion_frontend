import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import z from 'zod'
import useLogin from '#/hooks/auth/useAuth'
import { useCheckSession } from '#/hooks/auth/useSession'
import { authStore, initAuth } from '#/hooks/useAuthStore'
import { homeForRole } from '#/lib/roles'
import { MaterialIcon } from '#/components/ui/MaterialIcon'

const schema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean(),
})

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

const inputClass =
  'w-full h-[52px] px-md rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all text-body-md placeholder:text-outline'

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false)
  const auth = useLogin()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      await auth.mutateAsync(value)
    },
    validators: {
      onChange: schema,
    },
  })
  const session = useCheckSession()

  useEffect(() => {
    initAuth()
    if (authStore.state.isAuthenticated) {
      window.location.href = homeForRole(authStore.state.user?.rol)
    }
  }, [])

  useEffect(() => {
    if (session.data) {
      window.location.href = homeForRole(session.data.rol)
    }
  }, [session.data])

  return (
    <main className="grid min-h-screen grid-cols-1 overflow-hidden text-on-surface lg:grid-cols-2">
      {/* Left: Illustration / Branding */}
      <section className="relative hidden flex-col items-center justify-center overflow-hidden bg-primary p-xl lg:flex">
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            className="h-full w-full object-cover opacity-25"
            src="/login-illustration.png"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-tertiary/90" />
        </div>
        <div className="relative z-10 w-full max-w-[32rem] text-center">
          <div className="mb-md flex justify-center">
            <MaterialIcon name="school" fill size={64} className="text-white" />
          </div>
          <h1 className="mb-sm text-display-lg text-white">AcademicFlow</h1>
          <p className="px-lg text-body-lg text-white/85">
            Sistema Inteligente de Gestión y Revisión de Proyectos de Grado.
          </p>
          <div className="glass-card mx-auto mt-xl flex max-w-[24rem] items-center gap-md rounded-xl p-md text-left shadow-lg">
            <div className="rounded-lg bg-primary/10 p-sm">
              <MaterialIcon name="fact_check" className="text-primary" />
            </div>
            <div>
              <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Estado del Sistema
              </p>
              <p className="text-label-md font-bold text-on-surface">
                98% Proyectos en tiempo
              </p>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </section>

      {/* Right: Login Form */}
      <section className="flex flex-col items-center justify-center bg-[#FAFAFA] p-container-margin">
        <div className="w-full max-w-[440px]">
          {/* Mobile branding */}
          <div className="mb-xl flex items-center gap-sm lg:hidden">
            <MaterialIcon name="school" size={32} className="text-primary" />
            <span className="text-headline-md font-bold text-primary">
              AcademicFlow
            </span>
          </div>

          <header className="mb-xl">
            <h2 className="mb-xs text-headline-lg text-on-surface">
              Bienvenido de nuevo
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Ingresa tus credenciales para acceder a tu panel académico.
            </p>
          </header>

          {auth.isError && (
            <p className="mb-md rounded-xl bg-error-container p-3 text-body-sm text-on-error-container">
              {(() => {
                const err = auth.error as {
                  response?: {
                    data?: { detail?: string; non_field_errors?: string[] }
                  }
                }
                const data = err.response?.data
                return (
                  data?.detail ||
                  data?.non_field_errors?.[0] ||
                  'Credenciales inválidas'
                )
              })()}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-lg"
          >
            <form.Field name="email">
              {(field) => (
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
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ejemplo@universidad.edu"
                      className={inputClass}
                    />
                    <MaterialIcon
                      name="alternate_email"
                      className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant transition-colors group-focus-within:text-primary"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-label-sm text-error">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-label-md text-on-surface-variant"
                      htmlFor="password"
                    >
                      Contraseña
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-label-md text-primary transition-all hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="group relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass + ' pr-12'}
                    />
                    <button
                      type="button"
                      className="absolute right-md top-1/2 -translate-y-1/2 cursor-pointer text-outline-variant transition-colors hover:text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      <MaterialIcon
                        name={showPassword ? 'visibility_off' : 'visibility'}
                      />
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-label-sm text-error">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="rememberMe">
              {(field) => (
                <div className="flex items-center gap-sm">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded border-outline-variant accent-primary focus:ring-primary-container"
                  />
                  <label
                    htmlFor="remember"
                    className="cursor-pointer select-none text-body-sm text-on-surface-variant"
                  >
                    Recordar mi sesión en este dispositivo
                  </label>
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => state.canSubmit}
              children={(canSubmit) => (
                <button
                  type="submit"
                  disabled={!canSubmit || auth.isPending}
                  className="group flex h-[56px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container text-label-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  {auth.isPending ? 'Ingresando...' : 'Iniciar Sesión'}
                  {!auth.isPending && (
                    <MaterialIcon
                      name="arrow_forward"
                      size={20}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              )}
            />
          </form>

          <div className="relative my-xl">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAFAFA] px-md text-label-sm uppercase text-outline">
                Acceso Restringido
              </span>
            </div>
          </div>

          <footer className="text-center">
            <p className="text-body-md text-on-surface-variant">
              ¿Sin cuenta? Las cuentas son creadas por la Dirección de Carrera.
            </p>
            <p className="mt-xl text-label-sm text-outline">
              AcademicFlow · Sistema de Gestión de Proyectos de Grado
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
