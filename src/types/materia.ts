export interface Materia {
  id: number
  codigo: string
  nombre: string
  semestre: number
  grupo: string
  docente_a_cargo: number | null
  docente_nombre: string | null
  num_estudiantes: number
  progreso: number
}

export interface Inscripcion {
  id: number
  materia: number
  estudiante: number
  estudiante_nombre: string
  estudiante_email: string
}
