export type Rol =
  | 'DOCENTE'
  | 'TRIBUNAL'
  | 'TUTOR'
  | 'ESTUDIANTE'
  | 'DIRECTOR'
  | 'DTC'

export interface Usuario {
  id: number
  email: string
  nombre: string
  rol: Rol
  capacidades: string[]
  roles_efectivos: string[]
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
