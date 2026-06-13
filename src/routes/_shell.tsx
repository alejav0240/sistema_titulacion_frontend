import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { AppShell } from '#/components/layout/AppShell'

export const Route = createFileRoute('/_shell')({
  component: ShellLayout,
})

function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isViewer = pathname.startsWith('/revision')

  return (
    <AuthGuard>
      <AppShell collapsed={isViewer} noPadding={isViewer} hideTopbar={isViewer}>
        <Outlet />
      </AppShell>
    </AuthGuard>
  )
}
