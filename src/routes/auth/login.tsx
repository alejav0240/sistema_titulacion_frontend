import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import useLogin from '#/hooks/auth/useAuth'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import z from 'zod'
import { Eye, EyeOff, School, ArrowRight } from 'lucide-react'
import loginBg from '&/loginBg.jpg'
import { authStore, initAuth } from '#/hooks/useAuthStore'
import { useCheckSession } from '#/hooks/auth/useSession'
import ThemeToggle from '#/components/ThemeToggle'

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
  useCheckSession()

  useEffect(() => {
    initAuth()
    if (authStore.state.isAuthenticated) {
      const rol = authStore.state.user?.rol
      window.location.href = rol === 'ESTUDIANTE' ? '/student' : '/admin'
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen overflow-hidden">
      <section className="hidden lg:flex flex-col justify-center items-center relative p-8 overflow-hidden bg-zinc-900 dark:bg-black">
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-4 flex justify-center">
            <School className="w-16 h-16 text-red-400" />
          </div>
          <h1 className="text-5xl font-bold text-red-400 mb-2 tracking-tight">
            AcademicFlow
          </h1>
          <p className="text-lg text-gray-300 font-bold px-8">
            Sistema Inteligente de Gestión y Revisión de Proyectos de Grado.
          </p>

          <div className="mt-8 bg-zinc-800/70 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 flex items-center gap-4 text-left shadow-lg">
            <div className="bg-red-400/10 p-2 rounded-lg">
              <School className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Estado del Sistema
              </p>
              <p className="text-sm text-white font-bold">
                2% Proyectos en tiempo
              </p>
            </div>
          </div>
        </div>

        <img
          className="absolute h-screen w-full object-cover opacity-40"
          src={loginBg}
        />
      </section>

      <section className="flex flex-col justify-center items-center p-10 bg-[#FAFAFA] dark:bg-zinc-950">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <School className="w-8 h-8 text-red-900 dark:text-red-400" />
            <span className="text-xl font-bold text-red-900 dark:text-red-400">
              AcademicFlow
            </span>
          </div>
          <ThemeToggle />

          <header className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
              Bienvenido de nuevo
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Ingresa tus credenciales para acceder a tu panel académico.
            </p>
          </header>

          {auth.isError && (
            <p className="bg-red-200 dark:bg-red-900/30 mb-2 p-3 rounded-2xl text-red-900 dark:text-red-300">
              {(() => {
                const data = auth.error.response?.data
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
            className="space-y-6"
          >
            <form.Field name="email">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Correo Institucional
                  </label>
                  <div className="relative group">
                    <Input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ejemplo@est.univalle.edu"
                      className="h-[52px] text-black dark:text-white px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-red-900/20 focus:border-red-900 dark:focus:border-red-400 outline-none transition-all text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Contraseña
                    </label>
                    <a
                      href="#"
                      className="text-sm font-medium text-red-900 dark:text-red-400 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative group">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className="h-[52px] px-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-red-900/20 text-black dark:text-white focus:border-red-900 dark:focus:border-red-400 outline-none transition-all text-base pr-12 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {field.state.meta.errors[0]?.message}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex items-center gap-2">
              <form.Field name="rememberMe">
                {(field) => (
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      id="remember"
                      checked={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.checked)
                      }}
                      className="w-5 h-5 rounded border-gray-300 dark:border-zinc-600 text-red-900 focus:ring-red-900 dark:focus:ring-red-400 cursor-pointer bg-white dark:bg-zinc-800"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-800 dark:text-gray-300 cursor-pointer select-none"
                    >
                      Recordar mi sesión en este dispositivo
                    </label>
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe
              selector={(state) => state.canSubmit}
              children={(canSubmit) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || auth.isPending}
                  className="w-full h-[56px] bg-red-900 text-white font-semibold rounded-xl shadow-lg hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                >
                  {auth.isPending ? 'Ingresando...' : 'Iniciar Sesión'}
                  {!auth.isPending && <ArrowRight className="w-5 h-5" />}
                </Button>
              )}
            />
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#FAFAFA] dark:bg-zinc-950 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
                Acceso Restringido
              </span>
            </div>
          </div>

          <footer className="text-center">
            <p className="text-base text-gray-500 dark:text-gray-400">
              ¿Sin cuenta?{' '}
              <a
                href="#"
                className="text-red-900 dark:text-red-400 font-bold hover:underline"
              >
                Solicitar registro
              </a>
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="#"
                className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-900 dark:hover:text-red-400 transition-colors"
              >
                Términos
              </a>
              <a
                href="#"
                className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-900 dark:hover:text-red-400 transition-colors"
              >
                Privacidad
              </a>
              <a
                href="#"
                className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-900 dark:hover:text-red-400 transition-colors"
              >
                Ayuda
              </a>
            </div>
          </footer>
        </div>
      </section>
    </div>
  )
}
