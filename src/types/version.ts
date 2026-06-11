export type EstadoVersion = 'APROBADO' | 'EN REVISION' | 'OBSERVADO'

export interface Version {
  id: number
  proyecto: number
  numero_version: number
  url_pdf: string
  nombre_archivo: string
  estado: EstadoVersion
  estado_display: string
  created_at: string
}

export interface VersionCreate {
  url_pdf: string
  nombre_archivo?: string
}

export interface VersionesResponse {
  versiones: Version[]
}
