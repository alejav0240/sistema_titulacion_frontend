import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from 'sonner'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { initAuth } from '#/hooks/useAuthStore'
import { MaterialIcon } from '#/components/ui/MaterialIcon'

initAuth()

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AcademicFlow - Sistema de Titulación' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
})

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-md bg-[#FAFAFA] p-xl text-center text-on-surface">
      <MaterialIcon name="travel_explore" size={64} className="text-primary" />
      <h1 className="text-display-lg font-bold text-primary">404</h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-md flex items-center gap-sm rounded-xl bg-primary-container px-lg py-md text-label-md font-bold text-on-primary transition-all hover:brightness-110"
      >
        <MaterialIcon name="home" size={20} />
        Volver al inicio
      </Link>
    </main>
  )
}

function ErrorPage({ error }: { error: Error }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-md bg-[#FAFAFA] p-xl text-center text-on-surface">
      <MaterialIcon name="error" size={64} className="text-error" />
      <h1 className="text-headline-lg font-bold text-primary">
        Algo salió mal
      </h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        {error.message || 'Ocurrió un error inesperado.'}
      </p>
      <div className="mt-md flex gap-md">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-sm rounded-xl border border-primary px-lg py-md text-label-md font-bold text-primary transition-all hover:bg-primary-container hover:text-on-primary"
        >
          <MaterialIcon name="refresh" size={20} />
          Reintentar
        </button>
        <Link
          to="/"
          className="flex items-center gap-sm rounded-xl bg-primary-container px-lg py-md text-label-md font-bold text-on-primary transition-all hover:brightness-110"
        >
          <MaterialIcon name="home" size={20} />
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        {children}
        <Toaster richColors position="top-right" closeButton />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
