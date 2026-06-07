import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'

export const Route = createFileRoute('/student/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['ESTUDIANTE']}>
      <div>Hello "/student/"!</div>
    </AuthGuard>
  )
}
