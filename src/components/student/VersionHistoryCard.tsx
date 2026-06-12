import { useVersiones } from '#/hooks/useVersions'
import { ExternalLink, Loader2, FileText } from 'lucide-react'

const ESTADO_VARIANT: Record<string, string> = {
  'APROBADO': 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700',
  'EN REVISION': 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700',
  'OBSERVADO': 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700',
}

export function VersionHistoryCard() {
  const { data, isLoading, error } = useVersiones()
  const versiones = data?.versiones ?? []

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#e2e2e2] rounded-xl p-5">
      <h4 className="text-xs font-bold text-[#455f87] uppercase tracking-widest mb-4">
        Historial de Versiones
      </h4>

      {isLoading ? (
        <div className="flex min-h-20 items-center justify-center text-sm text-[#544244]">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="text-sm text-red-700">Error al cargar versiones.</p>
      ) : versiones.length === 0 ? (
        <p className="text-sm text-[#544244]">No se tiene ninguna versión subida aún.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {versiones.slice(0, 3).map((v) => (
            <div key={v.id} className="p-3 bg-[#f3f3f3] rounded-lg border border-transparent hover:border-[#dac0c2] transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#1a1c1c]">Versión {v.numero_version}</span>
                <span className={ESTADO_VARIANT[v.estado] ?? ''}>
                  {v.estado_display}
                </span>
              </div>
              <p className="text-xs text-[#877274] mb-2">
                {new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(v.created_at))}
              </p>
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-[#6b1d2f]" />
                <span className="text-xs font-medium text-[#455f87] truncate flex-1">
                  {v.nombre_archivo || V.pdf}
                </span>
                <a
                  href={v.url_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#455f87] hover:text-[#6b1d2f] transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
