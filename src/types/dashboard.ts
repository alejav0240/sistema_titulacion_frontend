import type { Anotacion } from './annotation'
import type { Proyecto, Version } from './project'

export interface EventoCronograma {
  id: number
  /** Subset de ESTUDIANTES|DOCENTES|TUTORES|TRIBUNALES; vacío = todos */
  publicos: string[]
  tipo: string
  carpeta_url: string
  fecha_inicio: string
  fecha_fin: string
  dias_duracion: number | null
  descripcion: string
  semestre: number
  /** IDs de grupos objetivo; vacío = todos los grupos */
  grupos: number[]
  grupos_nombres: string[]
  /** IDs de usuarios puntuales objetivo; si no está vacío, manda sobre publicos/grupos */
  usuarios: number[]
  creado_por_id: number | null
  created_at: string
}

export interface StudentDashboard {
  proyecto: Proyecto | null
  progreso: number
  tutor: string | null
  tribunal: string[]
  materias: string[]
  versiones: Version[]
  observaciones: Anotacion[]
  proximos_eventos: EventoCronograma[]
  actividad: ActividadItem[]
}

export interface PendienteMateria {
  version_id: number
  estudiante: string
  proyecto: string
  materia: string
  numero_version: number
  created_at: string
}

export interface ActividadItem {
  tipo: string
  autor: string | null
  proyecto: string
  version_id?: number
  created_at: string
}

export interface TeacherDashboard {
  tutorias: Proyecto[]
  tribunales: Proyecto[]
  pendientes_materia: PendienteMateria[]
  revisiones_por_dia: Array<{ dia: string; total: number }>
  actividad: ActividadItem[]
  proximos_eventos: EventoCronograma[]
}

export interface DirectorDashboard {
  kpis: {
    total_proyectos: number
    aprobados: number
    pendientes: number
    observaciones_activas: number
    tutores_activos: number
    dias_promedio_revision: number
  }
  estado_proyectos: Record<string, number>
  actividad_mensual: Array<{ mes: string; total: number }>
  distribucion_materia: Array<{ nombre: string; proyectos: number }>
  carga_docente: Array<{ docente: string; semanas: number[] }>
  alertas: { proyectos_en_riesgo: number }
  vencimientos: EventoCronograma[]
  actividad_reciente: ActividadItem[]
}
