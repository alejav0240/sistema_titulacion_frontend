import type { EventoCronograma } from '#/types/dashboard'

export const TIPO_STYLES: Record<string, { chip: string; label?: string; bar: string }> = {
  ENTREGA: { chip: 'bg-error-container text-on-error-container', label: 'Fecha límite', bar: 'bg-error' },
  REVISION: {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    label: 'Revisión',
    bar: 'bg-amber-500',
  },
  DEFENSA: { chip: 'bg-secondary-container text-on-secondary-container', label: 'Defensa', bar: 'bg-secondary' },
  ADMINISTRATIVO: { chip: 'bg-surface-container text-on-surface-variant', label: 'Administrativo', bar: 'bg-outline' },
}

const FALLBACK = { chip: 'bg-primary-container/15 text-primary', bar: 'bg-primary' }

export function tipoStyle(tipo: string) {
  const style = TIPO_STYLES[tipo] ?? FALLBACK
  return { ...style, label: style.label ?? tipo }
}

const TIPO_HEX: Record<string, string> = {
  ENTREGA: '#ba1a1a',
  REVISION: '#f59e0b',
  DEFENSA: '#455f87',
  ADMINISTRATIVO: '#877274',
}

/** Color plano por tipo, para librerías de gráficos que no aceptan clases Tailwind (ej. Gantt). */
export function tipoHex(tipo: string) {
  return TIPO_HEX[tipo] ?? '#6b1d2f'
}

export const TIPO_DOTS: Record<string, string> = {
  ENTREGA: 'bg-error',
  REVISION: 'bg-amber-500',
  DEFENSA: 'bg-secondary',
  ADMINISTRATIVO: 'bg-outline',
}

export const PUBLICO_LABELS: Record<string, string> = {
  ESTUDIANTES: 'Estudiantes',
  DOCENTES: 'Docentes',
  TUTORES: 'Tutores',
  TRIBUNALES: 'Tribunales',
}

export const PUBLICOS_OPCIONES = ['ESTUDIANTES', 'DOCENTES', 'TUTORES', 'TRIBUNALES'] as const

export function publicosLabel(evento: EventoCronograma) {
  if (!evento.publicos.length) return 'Todos'
  return evento.publicos.map((p) => PUBLICO_LABELS[p] ?? p).join(', ')
}

export function gruposLabel(evento: EventoCronograma) {
  if (!evento.grupos_nombres.length) return 'Todos los grupos'
  return evento.grupos_nombres.join(', ')
}
