import { CheckCircle2, Loader2 } from 'lucide-react'

const items = [
  { title: 'Propuesta', status: 'completed', date: 'Completado - 15 Mar', desc: 'Definición de objetivos iniciales y alcance técnico.' },
  { title: 'Marco Teórico', status: 'completed', date: 'Completado - 02 Abr', desc: 'Investigación exhaustiva de arquitecturas CNN y RNN.' },
  { title: 'Metodología', status: 'active', date: 'En progreso - Actual', desc: 'Definición de dataset y protocolos de entrenamiento.' },
  { title: 'Resultados', status: 'pending', date: 'Pendiente - Jun 2025', desc: undefined },
  { title: 'Defensa', status: 'pending', date: 'Pendiente - Ago 2025', desc: undefined },
]

export function TimelineDeliveries() {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#e2e2e2] rounded-xl p-5">
      <h4 className="text-xs font-bold text-[#455f87] uppercase tracking-widest mb-5">
        Timeline de Entregas
      </h4>
      <div className="flex flex-col gap-0 relative">
        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-[#dac0c2]" />

        {items.map((item) => (
          <div key={item.title} className="relative flex gap-4 pb-5 last:pb-0">
            <div className="relative z-10 shrink-0">
              {item.status === 'completed' && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-white">
                  <CheckCircle2 className="size-3.5 text-white" />
                </div>
              )}
              {item.status === 'active' && (
                <div className="w-6 h-6 rounded-full bg-[#6b1d2f] flex items-center justify-center ring-4 ring-white">
                  <Loader2 className="size-3 text-white animate-spin" />
                </div>
              )}
              {item.status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-[#e8e8e8] border-2 border-[#dac0c2] ring-4 ring-white" />
              )}
            </div>
            <div className={item.status === 'pending' ? 'opacity-60' : ''}>
              <p className="text-sm font-semibold">
                {item.title}
              </p>
              <p className="text-xs font-semibold mt-0.5">
                {item.date}
              </p>
              {item.desc && (
                <p className="text-xs text-[#544244] mt-1 leading-relaxed">{item.desc}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
