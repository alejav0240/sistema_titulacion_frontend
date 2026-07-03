import { createFileRoute } from '@tanstack/react-router'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { ProyectosAsignadosPage } from '#/components/docente/ProyectosAsignadosPage'

export const Route = createFileRoute('/_shell/docente/tribunados')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL']}>
      <ProyectosAsignadosPage
        como="tribunal"
        titulo="Tribunados"
        descripcion="Proyectos donde eres tribunal: verificación final de correcciones."
      />
    </AuthGuard>
  )
}
