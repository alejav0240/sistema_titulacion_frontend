export type EstadoAnotacion = 'PENDIENTE' | 'SUBSANADA' | 'APROBADA'
export type Severidad = 'CRITICO' | 'SUGERENCIA'
export type TipoEventoAnotacion =
  | 'CREACION'
  | 'SUBSANACION'
  | 'APROBACION'
  | 'REOBSERVACION'

export interface NotaComentario {
  id: number
  pagina: number
  x: string
  y: string
  ancho: string
  alto: string
  comentario: string
}

export interface Anotacion {
  id: number
  codigo: number
  codigo_display: string
  version: number
  autor: number
  autor_nombre: string
  estado: EstadoAnotacion
  severidad: Severidad
  accion_a_realizar: string
  accion_realizada: string
  nota_observacion: NotaComentario | null
  nota_correccion: NotaComentario | null
  creado_el: string
  subsanada_el: string | null
  corregido_el: string | null
}

export interface AnotacionEvento {
  id: number
  tipo: TipoEventoAnotacion
  texto: string
  autor: number | null
  autor_nombre: string | null
  created_at: string
}

export interface RectNormalizado {
  pagina: number
  x: number
  y: number
  ancho: number
  alto: number
}

export interface AnotacionCreate extends RectNormalizado {
  comentario: string
  severidad: Severidad
  accion_a_realizar?: string
}
