import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DIRECTOR', 'DOCENTE', 'DTC', 'TRIBUNAL', 'TUTOR']}>
      <div>Hello "/admin/"!</div>
    </AuthGuard>
  )
}
