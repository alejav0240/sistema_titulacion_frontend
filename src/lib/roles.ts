import type { Rol } from '#/types/user'

export const DOCENTE_ROLES: Rol[] = ['DOCENTE', 'TUTOR', 'TRIBUNAL']
export const ADMIN_ROLES: Rol[] = ['DIRECTOR', 'DTC', 'COMITE_EVALUACION']

/** Candidatos a formar/asignar una tupla de evaluación: todos los roles excepto DIRECTOR y ESTUDIANTE. */
export const TUPLA_CANDIDATO_ROLES = 'DOCENTE,TUTOR,TRIBUNAL,DTC,COMITE_EVALUACION'

export function homeForRole(rol?: string | null): string {
  if (rol === 'ESTUDIANTE') return '/student'
  if (ADMIN_ROLES.includes(rol as Rol)) return '/admin'
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
  COMITE_EVALUACION: 'Comité de Evaluación',
}
