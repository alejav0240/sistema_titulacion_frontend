import type { Anotacion } from './annotation'
import type { Proyecto, Version } from './project'

export interface EventoCronograma {
  id: number
  publico_objetivo: 'ESTUDIANTES' | 'DOCENTES' | 'TODOS'
  tipo: 'ENTREGA' | 'REVISION' | 'DEFENSA' | 'ADMINISTRATIVO'
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
  semestre: number
  created_at: string
}

export interface StudentDashboard {
  proyecto: Proyecto | null
  progreso: number
  tutor: string | null
  tribunal: string[]
  versiones: Version[]
  observaciones: Anotacion[]
  proximos_eventos: EventoCronograma[]
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
