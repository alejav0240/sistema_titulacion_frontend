export type TipoFormulario = 'F1' | 'F2' | 'F3' | 'F4'
export type RolEntregaFormulario = 'ESTUDIANTE' | 'TUTOR' | 'TRIBUNAL1' | 'TRIBUNAL2'
export type EstadoEntregaFormulario = 'PENDIENTE' | 'ENTREGADO'

export interface FormularioEntrega {
  id: number
  formulario: number
  rol: RolEntregaFormulario
  usuario: number | null
  usuario_nombre: string | null
  link_url: string
  nombre_archivo: string
  estado: EstadoEntregaFormulario
  nota: string | null
  acta_url: string
  entregado_el: string | null
}

export interface Formulario {
  id: number
  proyecto: number
  proyecto_titulo: string
  estudiante_nombre: string
  tipo: TipoFormulario
  /** Link de carpeta (OneDrive/Teams) adjuntado por el docente al habilitar el formulario. */
  carpeta_url: string
  /** false si la actividad de Cronograma que lo habilitó fue eliminada. */
  activo: boolean
  entregas: FormularioEntrega[]
  completo: boolean
  created_at: string
}

export const TIPO_FORMULARIO_LABELS: Record<TipoFormulario, string> = {
  F1: 'F1',
  F2: 'F2',
  F3: 'F3 (defensa interna)',
  F4: 'F4 (documento final)',
}

export const ROL_ENTREGA_LABELS: Record<RolEntregaFormulario, string> = {
  ESTUDIANTE: 'Estudiante',
  TUTOR: 'Tutor',
  TRIBUNAL1: 'Tribunal 1',
  TRIBUNAL2: 'Tribunal 2',
}
