import { ArrowRight, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const observations = [
  {
    priority: 'ALTA',
    priorityClass: 'bg-[#ffdad6] text-[#93000a]',
    icon: AlertCircle,
    text: 'Corregir el diagrama de arquitectura en el Cap 3. No es legible el flujo de datos.',
    time: 'Hace 2 días',
  },
  {
    priority: 'MEDIA',
    priorityClass: 'bg-[#b5d0fd] text-[#3e5980]',
    icon: AlertTriangle,
    text: 'Actualizar las referencias bibliográficas según el formato IEEE solicitado.',
    time: 'Hace 4 días',
  },
  {
    priority: 'BAJA',
    priorityClass: 'bg-[#e8e8e8] text-[#544244]',
    icon: Info,
    text: 'Revisar ortografía en la introducción del Marco Metodológico.',
    time: 'Hoy',
  },
]

export function TutorObservations() {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#e2e2e2] rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-[#455f87] uppercase tracking-widest">
          Observaciones del Tutor
        </h4>
        <span className="text-xs px-2 py-1 bg-[#e8e8e8] rounded text-[#544244] font-bold">
          3 Pendientes
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {observations.map((obs) => (
          <div key={obs.text} className="group p-3 border-b border-[#dac0c2] last:border-0 hover:bg-[#f3f3f3] transition-all rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className={obs.priorityClass}>
                <obs.icon className="size-3" />
                {obs.priority} PRIORIDAD
              </span>
              <span className="text-xs text-[#877274]">{obs.time}</span>
            </div>
            <p className="text-sm font-medium text-[#1a1c1c] mb-3 leading-relaxed">
              {obs.text}
            </p>
            <div className="flex justify-end">
              <button className="text-xs font-bold text-[#6b1d2f] flex items-center gap-1 px-3 py-1.5 border border-[#6b1d2f]/20 rounded-lg hover:bg-[#6b1d2f] hover:text-white transition-all cursor-pointer">
                Subsanar
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
