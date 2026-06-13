import type { Rol } from '#/types/user'

export const DOCENTE_ROLES: Rol[] = ['DOCENTE', 'TUTOR', 'TRIBUNAL']
export const ADMIN_ROLES: Rol[] = ['DIRECTOR', 'DTC']

export function homeForRole(rol?: string | null): string {
  if (rol === 'ESTUDIANTE') return '/student'
  if (rol === 'DIRECTOR' || rol === 'DTC') return '/admin'
  if (rol === 'DOCENTE' || rol === 'TUTOR' || rol === 'TRIBUNAL')
    return '/docente'
  return '/auth/login'
}

export const ROL_LABELS: Record<string, string> = {
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
  TUTOR: 'Tutor',
  TRIBUNAL: 'Tribunal',
  DIRECTOR: 'Director',
  DTC: 'DTC',
}
