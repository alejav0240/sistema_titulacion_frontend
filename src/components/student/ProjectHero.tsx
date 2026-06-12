import { useStore } from '@tanstack/react-store'
import { authStore } from '#/hooks/useAuthStore'

interface ProjectHeroProject {
  id: number
  titulo: string
  estudiante: number
  estudiante_nombre: string
  estado: string
  created_at: string
}

interface ProjectHeroProps {
  project: ProjectHeroProject | null
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const user = useStore(authStore, (s) => s.user)

  return (
    <div className="relative overflow-hidden rounded-xl p-8 h-64 bg-gradient-to-br from-[#6B1D2F] to-[#1E3A5F] text-white flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 inline-block">
            PERFIL ACADÉMICO
          </span>
          <h3 className="text-2xl font-semibold mb-1">{user?.name || 'Estudiante'}</h3>
          <p className="text-base opacity-90">Ingeniería en Ciencias de la Computación e Informática</p>
        </div>
        <div className="flex flex-col items-center">
          <svg width="100" height="70" viewBox="0 0 100 70" className="overflow-visible">
            <path d="M10 70 A40 40 0 0 1 90 70" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
            <path d="M10 70 A40 40 0 0 1 64.4 22.4" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="60.3" opacity="0.9" />
            <line x1="50" y1="70" x2="62.5" y2="28.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="70" r="4" fill="#ffffff" />
          </svg>
          <div className="text-center mt-1">
            <p className="text-xl font-bold leading-none">68%</p>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">Progreso Tesis</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 flex-1 rounded-lg">
          <p className="text-xs opacity-70 mb-1">Título del Proyecto</p>
          <p className="text-base font-semibold truncate">
            {project?.titulo || 'Sin proyecto registrado'}
          </p>
        </div>
      </div>
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
    </div>
  )
}
