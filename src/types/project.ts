export type EstadoProyecto = 'EN CURSO' | 'EN REVISION' | 'CONCLUIDO'
export type EstadoVersion = 'APROBADO' | 'EN REVISION' | 'OBSERVADO'
export type EstadoRevision = EstadoVersion | 'BORRADOR'
export type Etapa =
  | 'PROPUESTA'
  | 'ANTEPROYECTO'
  | 'DESARROLLO'
  | 'REVISION'
  | 'DEFENSA'

export interface VersionResumen {
  id: number
  numero_version: number
  estado: EstadoVersion
  nombre_archivo: string
  created_at: string
}

export type EstadoDefensa = 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA'
export type ResultadoDefensa =
  | 'APROBADO'
  | 'APROBADO_CON_OBSERVACIONES'
  | 'REPROBADO'
  | ''

export interface DefensaResumen {
  id: number
  fecha_hora: string
  lugar: string
  estado: EstadoDefensa
  calificacion: string | null
  resultado: ResultadoDefensa
}

export interface Defensa extends DefensaResumen {
  proyecto: number
  proyecto_titulo: string
  acta_url: string
  observaciones: string
  tribunal: Array<{ id: number; nombre: string }>
  creado_por_nombre: string | null
  created_at: string
  updated_at: string
}

export interface Proyecto {
  id: number
  codigo: string
  titulo: string
  descripcion: string
  estudiante: number
  estudiante_nombre: string
  estudiante_email: string
  estado: EstadoProyecto
  etapa: Etapa
  estado_revision: EstadoRevision
  ultima_version: VersionResumen | null
  observaciones_pendientes: number
  tutor_nombre: string | null
  defensa: DefensaResumen | null
  created_at: string
  updated_at: string
}

export interface Version {
  id: number
  proyecto: number
  proyecto_titulo: string
  estudiante_nombre: string
  numero_version: number
  url_pdf: string
  nombre_archivo: string
  estado: EstadoVersion
  revisada_por_nombre: string | null
  revisada_el: string | null
  anotaciones_pendientes: number
  anotaciones_total: number
  created_at: string
}

export interface ProyectosResponse {
  count: number
  next: string | null
  previous: string | null
  results: Proyecto[]
}

export const ETAPAS: Etapa[] = [
  'PROPUESTA',
  'ANTEPROYECTO',
  'DESARROLLO',
  'REVISION',
  'DEFENSA',
]

export const ETAPA_LABELS: Record<Etapa, string> = {
  PROPUESTA: 'Propuesta',
  ANTEPROYECTO: 'Anteproyecto',
  DESARROLLO: 'Desarrollo',
  REVISION: 'Revisión',
  DEFENSA: 'Defensa',
}

export const ESTADO_REVISION_LABELS: Record<EstadoRevision, string> = {
  BORRADOR: 'Borrador',
  'EN REVISION': 'En revisión',
  OBSERVADO: 'Observado',
  APROBADO: 'Aprobado',
}

export const RESULTADO_DEFENSA_LABELS: Record<string, string> = {
  APROBADO: 'Aprobado',
  APROBADO_CON_OBSERVACIONES: 'Aprobado con observaciones',
  REPROBADO: 'Reprobado',
}

export const ESTADO_DEFENSA_LABELS: Record<EstadoDefensa, string> = {
  PROGRAMADA: 'Programada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
}
