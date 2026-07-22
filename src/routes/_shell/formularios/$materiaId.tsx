import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { MaterialIcon } from '#/components/ui/MaterialIcon'
import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'
import { useMateria, useMateriaEstudiantes } from '#/hooks/useMaterias'
import { useUpdateEntrega, downloadMatrizCorrecciones } from '#/hooks/useFormularios'
import { NuevoEventoModal } from '#/components/cronograma/NuevoEventoModal'
import { cn } from '#/lib/utils'
import type { Inscripcion } from '#/types/materia'
import {
  ROL_ENTREGA_LABELS,
  TIPO_FORMULARIO_LABELS,
  type Formulario,
  type TipoFormulario,
} from '#/types/formulario'

const TIPO_A_NUMERO: Record<TipoFormulario, number> = { F1: 1, F2: 2, F3: 3, F4: 4 }

const TIPOS: TipoFormulario[] = ['F1', 'F2', 'F3', 'F4']

export const Route = createFileRoute('/_shell/formularios/$materiaId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthGuard allowedRoles={['DOCENTE', 'TUTOR', 'TRIBUNAL', 'DIRECTOR', 'DTC', 'COMITE_EVALUACION']}>
      <FormulariosMateriaPage />
    </AuthGuard>
  )
}

function FormulariosMateriaPage() {
  const { materiaId } = Route.useParams()
  const navigate = useNavigate()
  const id = Number(materiaId)
  const user = useStore(authStore, (s) => s.user)

  const materia = useMateria(id)
  const inscripciones = useMateriaEstudiantes(id)
  const [search, setSearch] = useState('')
  const [panelDe, setPanelDe] = useState<Inscripcion | null>(null)

  const puedeGestionar = ['DOCENTE', 'DIRECTOR', 'DTC', 'COMITE_EVALUACION'].includes(user?.rol ?? '')

  const lista = (inscripciones.data ?? []).filter((i) =>
    i.estudiante_nombre.toLowerCase().includes(search.trim().toLowerCase())
    || (i.proyecto?.titulo ?? '').toLowerCase().includes(search.trim().toLowerCase()),
  )

  if (materia.isLoading) {
    return <p className="py-xl text-center text-body-sm text-outline">Cargando…</p>
  }

  return (
    <div className="space-y-lg">
      <section className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={() => navigate({ to: '/formularios' })}
            className="rounded-lg border border-outline-variant p-sm text-on-surface-variant transition-colors hover:text-primary"
            aria-label="Volver"
          >
            <MaterialIcon name="arrow_back" size={18} />
          </button>
          <div>
            <h2 className="text-headline-lg text-primary">{materia.data?.nombre}</h2>
            <p className="text-body-md text-on-surface-variant">
              {materia.data?.grupo} · {materia.data?.gestion_semestre} - {materia.data?.gestion_anio}
            </p>
          </div>
        </div>
        <div className="relative">
          <MaterialIcon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto o estudiante…"
            className="w-64 rounded-lg border border-outline-variant bg-white py-sm pl-10 pr-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-container"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-left">
              <th className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline">
                Proyecto
              </th>
              {TIPOS.map((tipo) => (
                <th key={tipo} className="px-md py-sm text-center text-[10px] font-bold uppercase tracking-wider text-outline">
                  {tipo}
                </th>
              ))}
              <th className="px-md py-sm text-[10px] font-bold uppercase tracking-wider text-outline">
                Ver
              </th>
            </tr>
          </thead>
          <tbody>
            {lista.map((inscripcion) => {
              const proyecto = inscripcion.proyecto
              return (
                <tr key={inscripcion.id} className="border-b border-outline-variant/50 last:border-none">
                  <td className="px-md py-md">
                    <p className="text-label-md font-bold text-on-surface">
                      {proyecto?.titulo || 'Tema pendiente'}
                    </p>
                    <p className="text-label-sm text-outline">{inscripcion.estudiante_nombre}</p>
                  </td>
                  {TIPOS.map((tipo) => {
                    const formulario = proyecto?.formularios.find((f) => f.tipo === tipo)
                    return (
                      <td key={tipo} className="px-md py-md text-center">
                        <EstadoFormularioBadge formulario={formulario} />
                      </td>
                    )
                  })}
                  <td className="px-md py-md">
                    {proyecto && (
                      <button
                        type="button"
                        onClick={() => setPanelDe(inscripcion)}
                        className="rounded-lg p-xs text-primary hover:bg-surface-container-low"
                        title="Ver detalle de formularios"
                      >
                        <MaterialIcon name="visibility" size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {lista.length === 0 && (
              <tr>
                <td colSpan={TIPOS.length + 2} className="py-xl text-center text-body-sm text-outline">
                  No hay proyectos que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {panelDe && (
        <FormulariosSidePanel
          inscripcion={panelDe}
          puedeGestionar={puedeGestionar}
          onClose={() => setPanelDe(null)}
        />
      )}
    </div>
  )
}

function EstadoFormularioBadge({ formulario }: { formulario: Formulario | undefined }) {
  if (!formulario) {
    return <span className="text-label-sm text-outline">—</span>
  }
  if (!formulario.activo) {
    return (
      <span className="rounded-full bg-error-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-error-container">
        Deshabilitado
      </span>
    )
  }
  return (
    <span
      className={cn(
        'rounded-full px-sm py-[2px] text-[10px] font-bold uppercase',
        formulario.completo
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      )}
    >
      {formulario.completo ? 'Completo' : 'Pendiente'}
    </span>
  )
}

function FormulariosSidePanel({
  inscripcion,
  puedeGestionar,
  onClose,
}: {
  inscripcion: Inscripcion
  puedeGestionar: boolean
  onClose: () => void
}) {
  const proyecto = inscripcion.proyecto!
  const actualizar = useUpdateEntrega()
  const [editandoEntregaId, setEditandoEntregaId] = useState<number | null>(null)
  const [link, setLink] = useState('')
  const [habilitarTipo, setHabilitarTipo] = useState<TipoFormulario | null>(null)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="thin-scrollbar relative h-full w-full max-w-[28rem] overflow-y-auto bg-white p-lg shadow-2xl">
        <div className="mb-md flex items-center justify-between">
          <h3 className="text-headline-md text-primary">{proyecto.titulo || 'Tema pendiente'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-xs text-outline hover:text-primary">
            <MaterialIcon name="close" size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => downloadMatrizCorrecciones(proyecto.id)}
          className="mb-lg flex items-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-label-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialIcon name="picture_as_pdf" size={16} />
          Descargar matriz de correcciones (PDF)
        </button>

        <div className="space-y-lg">
          {TIPOS.map((tipo) => {
            const formulario = proyecto.formularios.find((f) => f.tipo === tipo)
            return (
              <section key={tipo} className="rounded-xl border border-outline-variant p-md">
                <div className="mb-sm flex items-center justify-between">
                  <h4 className="text-label-md font-bold text-on-surface">
                    {TIPO_FORMULARIO_LABELS[tipo]}
                  </h4>
                  {formulario ? (
                    <EstadoFormularioBadge formulario={formulario} />
                  ) : (
                    puedeGestionar && (
                      <button
                        type="button"
                        onClick={() => setHabilitarTipo(tipo)}
                        className="rounded-lg bg-primary-container px-sm py-xs text-label-sm font-bold text-on-primary hover:brightness-110"
                      >
                        Habilitar
                      </button>
                    )
                  )}
                </div>
                {!formulario && (
                  <p className="text-label-sm text-outline">Aún no habilitado.</p>
                )}
                {formulario && !formulario.activo && (
                  <p className="mb-sm rounded-lg bg-error-container p-sm text-label-sm text-on-error-container">
                    La actividad de Cronograma que habilitó este formulario fue
                    eliminada. Lo ya entregado sigue disponible; para nuevas
                    entregas, vuelve a habilitarlo.
                  </p>
                )}
                {formulario && (
                  <div className="divide-y divide-outline-variant/50">
                    {formulario.entregas.map((entrega) => (
                      <div key={entrega.id} className="flex items-center justify-between gap-sm py-sm">
                        <div className="min-w-0">
                          <p className="text-label-sm font-bold text-on-surface">
                            {ROL_ENTREGA_LABELS[entrega.rol]}
                          </p>
                          <p className="truncate text-label-sm text-outline">
                            {entrega.usuario_nombre ?? 'Sin asignar'}
                          </p>
                        </div>
                        {editandoEntregaId === entrega.id ? (
                          <div className="flex items-center gap-xs">
                            <input
                              value={link}
                              onChange={(e) => setLink(e.target.value)}
                              placeholder="Link del archivo…"
                              className="h-8 w-40 rounded-lg border border-outline-variant px-xs text-label-sm outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              disabled={actualizar.isPending}
                              onClick={() =>
                                actualizar.mutate(
                                  { id: entrega.id, link_url: link.trim() },
                                  {
                                    onSuccess: () => {
                                      toast.success('Link guardado.')
                                      setEditandoEntregaId(null)
                                    },
                                  },
                                )
                              }
                              className="rounded-lg bg-primary-container p-xs text-on-primary hover:brightness-110"
                            >
                              <MaterialIcon name="check" size={16} />
                            </button>
                          </div>
                        ) : entrega.estado === 'ENTREGADO' ? (
                          <a
                            href={entrega.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-xs text-label-sm font-bold text-primary hover:underline"
                          >
                            <MaterialIcon name="link" size={14} />
                            Ver entrega
                          </a>
                        ) : formulario.activo ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoEntregaId(entrega.id)
                              setLink('')
                            }}
                            className="rounded-full bg-amber-100 px-sm py-[2px] text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          >
                            Pendiente
                          </button>
                        ) : (
                          <span className="rounded-full bg-error-container px-sm py-[2px] text-[10px] font-bold uppercase text-on-error-container">
                            No disponible
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>

      {habilitarTipo && (
        <NuevoEventoModal
          open
          onClose={() => setHabilitarTipo(null)}
          initialDescripcion={`SUBIDA DE FORMULARIO ${TIPO_A_NUMERO[habilitarTipo]}`}
        />
      )}
    </div>
  )
}
