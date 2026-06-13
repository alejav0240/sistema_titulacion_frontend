export type CategoriaNotificacion =
  | 'ENTREGA'
  | 'OBSERVACION'
  | 'SISTEMA'
  | 'RECORDATORIO'

export type PrioridadNotificacion = 'BAJA' | 'MEDIA' | 'ALTA'

export interface Notificacion {
  id: number
  titulo: string
  mensaje: string
  categoria: CategoriaNotificacion
  prioridad: PrioridadNotificacion
  leido: boolean
  link: string
  emisor_nombre: string | null
  created_at: string
}

export interface NotificacionesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notificacion[]
}
