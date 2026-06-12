import { Clock } from 'lucide-react'

export function CurrentStatus() {
  return (
    <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex items-center gap-4">
      <div className="size-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
        <Clock className="size-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Estado Actual</p>
        <p className="text-sm font-bold text-amber-900">Anteproyecto - En revisión por tutor</p>
      </div>
    </div>
  )
}
