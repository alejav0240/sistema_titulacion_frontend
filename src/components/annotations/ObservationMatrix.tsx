import { useNavigate } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import type { Anotacion } from '#/types/annotation'

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-[#FEF3C7] text-[#92400E]',
  SUBSANADA: 'bg-[#DBEAFE] text-[#1E40AF]',
  APROBADA: 'bg-[#D1FAE5] text-[#065F46]',
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  SUBSANADA: 'Subsanada',
  APROBADA: 'Aprobada',
}

export function ObservationMatrix({ observaciones }: { observaciones: Anotacion[] }) {
  const navigate = useNavigate()

  // Agrupar por autor_nombre
  const grupos = observaciones.reduce<Record<string, Anotacion[]>>((acc, obs) => {
    const nombre = obs.autor_nombre ?? 'Sin asignar'
    ;(acc[nombre] ??= []).push(obs)
    return acc
  }, {})

  if (observaciones.length === 0) {
    return (
      <p className="text-body-sm text-outline">
        No hay observaciones registradas todavía.
      </p>
    )
  }

  return (
    <div className="space-y-lg overflow-x-auto">
      {Object.entries(grupos).map(([autor, obs]) => (
        <div key={autor}>
          <p className="mb-sm text-label-sm font-bold uppercase tracking-wider text-primary">
            {autor}
          </p>
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                {['Código', 'Pág.', 'Observación', 'Corrección del estudiante', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="pb-sm pr-md text-[10px] font-bold uppercase tracking-wider text-outline"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obs.map((anotacion) => (
                <tr
                  key={anotacion.id}
                  className="border-b border-outline-variant/40 last:border-none"
                >
                  <td className="py-sm pr-md">
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: '/revision/$versionId',
                          params: { versionId: String(anotacion.version) },
                          search: {},
                        })
                      }
                      className="font-mono text-label-sm font-bold text-primary hover:underline"
                    >
                      {anotacion.codigo_display}
                    </button>
                    {anotacion.version_numero != null && (
                      <span className="ml-xs rounded bg-primary/10 px-xs py-[1px] text-[9px] font-bold text-primary">
                        V{anotacion.version_numero}
                      </span>
                    )}
                  </td>
                  <td className="py-sm pr-md text-label-sm text-outline">
                    {anotacion.nota_observacion ? `p. ${anotacion.nota_observacion.pagina}` : '—'}
                  </td>
                  <td className="max-w-[240px] py-sm pr-md">
                    <p className="text-body-sm text-on-surface">
                      {anotacion.nota_observacion?.comentario ?? '—'}
                    </p>
                    {anotacion.accion_a_realizar && (
                      <p className="mt-xs text-[10px] text-outline">
                        Acción: {anotacion.accion_a_realizar}
                      </p>
                    )}
                  </td>
                  <td className="max-w-[220px] py-sm pr-md">
                    {anotacion.accion_realizada && (
                      <p className="text-label-md font-medium text-on-surface">
                        {anotacion.accion_realizada}
                      </p>
                    )}
                    {anotacion.nota_correccion ? (
                      <p className="mt-xs text-body-sm text-on-surface-variant">
                        {anotacion.nota_correccion.comentario}
                      </p>
                    ) : (
                      !anotacion.accion_realizada && (
                        <span className="text-label-sm text-outline">Sin corrección</span>
                      )
                    )}
                  </td>
                  <td className="py-sm">
                    <span
                      className={cn(
                        'rounded-full px-sm py-[2px] text-[9px] font-bold uppercase',
                        ESTADO_BADGE[anotacion.estado],
                      )}
                    >
                      {ESTADO_LABEL[anotacion.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
