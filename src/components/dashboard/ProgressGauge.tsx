/** Gauge semicircular SVG como el del hero del dashboard estudiante. */
export function ProgressGauge({
  value,
  label = 'PROGRESO TESIS',
}: {
  value: number
  label?: string
}) {
  const radius = 54
  const circumference = Math.PI * radius
  const progress = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path
          d="M 16 76 A 54 54 0 0 1 124 76"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 16 76 A 54 54 0 0 1 124 76"
          fill="none"
          stroke="#ffd9dd"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="70"
          y="62"
          textAnchor="middle"
          className="fill-white"
          fontSize="24"
          fontWeight="700"
        >
          {progress}%
        </text>
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
        {label}
      </span>
    </div>
  )
}
