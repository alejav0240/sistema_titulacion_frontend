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
  is_active: boolean
  is_staff: boolean
  created_at: string
  updated_at: string
}

export interface UsuarioCreate {
  email: string
  nombre: string
  rol: Rol
  sendEmail: boolean | undefined
}

export interface UsuarioUpdate {
  email?: string
  nombre?: string
  rol?: Rol
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
    password: string
  }>
  errors: Array<{
    row: number
    error: string
  }>
}
