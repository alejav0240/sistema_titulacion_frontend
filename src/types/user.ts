export type Rol =
  | 'DOCENTE'
  | 'TRIBUNAL'
  | 'TUTOR'
  | 'ESTUDIANTE'
  | 'DIRECTOR'
  | 'DTC'
  | 'COMITE_EVALUACION'

export interface Usuario {
  id: number
  email: string
  nombre: string
  rol: Rol
  capacidades: string[]
  roles_efectivos: string[]
  cupos_tutor: number
  cupos_tribunal: number
  tutorados_activos: number
  tribunales_activos: number
  /** Puntaje crudo 1-5; null si el rol del que consulta no es Director/DTC/Comité. */
  fortaleza_docente: number | null
  /** "Tribunal Metodológico" (<=3) o "Tribunal de Proyecto" (>=4); null si nunca se asignó puntaje. */
  nivel_tribunal: string | null
  is_active: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
}

export interface UsuarioCreate {
  email: string
  nombre: string
  rol: Rol
  capacidades?: string[]
  sendEmail: boolean | undefined
}

/** Respuesta al crear un usuario: la contraseña generada solo viene
 *  cuando no se envió por email (se muestra una única vez). */
export interface UsuarioCreado extends Usuario {
  generated_password?: string | null
  email_enviado?: boolean
}

export interface UsuarioUpdate {
  email?: string
  nombre?: string
  rol?: Rol
  capacidades?: string[]
  cupos_tutor?: number
  cupos_tribunal?: number
  fortaleza_docente?: number | null
  is_active?: boolean
  password?: string
}

export interface UsersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Usuario[]
}

export interface ImportResult {
  created: Array<{
    email: string
    nombre: string
    rol: string
    email_enviado: boolean
    password?: string
  }>
  errors: Array<{
    row: number
    error: string
  }>
}
