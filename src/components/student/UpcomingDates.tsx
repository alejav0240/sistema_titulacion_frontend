import { Calendar, Clock } from 'lucide-react'

export function UpcomingDates() {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#e2e2e2] rounded-xl p-5 flex flex-col gap-4">
      <h4 className="text-xs font-bold text-[#455f87] uppercase tracking-widest">PRÓXIMAS FECHAS</h4>

      <div className="p-4 bg-[#6b1d2f]/5 border border-[#6b1d2f]/10 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-[#6b1d2f]">HITO CRÍTICO</span>
          <span className="text-[10px] bg-[#6b1d2f] text-white px-2 py-0.5 rounded-full">EN 5 DÍAS</span>
        </div>
        <p className="text-sm font-bold text-[#6b1d2f] mb-2">Entrega V2</p>
        <div className="flex items-center gap-2 text-[#455f87]">
          <Calendar className="size-3.5" />
          <span className="text-xs">15 de mayo, 2025</span>
        </div>
      </div>

      <div className="p-4 bg-[#f3f3f3] rounded-lg">
        <p className="text-xs font-semibold text-[#544244] mb-2">Reunión de Sincronización</p>
        <div className="flex items-center gap-2 text-[#455f87]">
          <Clock className="size-3.5" />
          <span className="text-xs">18 de mayo, 10:00 AM</span>
        </div>
      </div>
    </div>
  )
}
