import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { ProyectosAsignadosPage } from '#/components/docente/ProyectosAsignadosPage'

export const Route = createFileRoute('/_shell/docente/tutorados')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL']}>
      <ProyectosAsignadosPage
        como="tutor"
        titulo="Tutorados"
        descripcion="Proyectos donde eres tutor: revisiones, observaciones y matriz."
      />
    </AuthGuard>
  )
}
