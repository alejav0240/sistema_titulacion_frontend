export interface Materia {
  id: number
  codigo: string
  nombre: string
  nombre_completo: string
  semestre: number
  grupo: string
  gestion_semestre: 'I' | 'II'
  gestion_anio: number
  docente_a_cargo: number | null
  docente_nombre: string | null
  num_estudiantes: number
  progreso: number
}

export interface Grupo {
  id: number
  nombre: string
  descripcion: string
  materias: number[]
  materias_nombres: { id: number; nombre: string }[]
}

export interface Inscripcion {
  id: number
  materia: number
  estudiante: number
  estudiante_nombre: string
  estudiante_email: string
  proyecto: {
    id: number
    titulo: string
    estado_aprobacion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
    motivo_rechazo: string
  } | null
}
