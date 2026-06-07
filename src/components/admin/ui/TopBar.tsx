import { Search, Bell, History } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

export function TopBar() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 z-40 flex items-center justify-between px-10">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-sm w-80 focus:ring-2 focus:ring-red-900/20 focus:border-red-900 focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
          <History className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700" />
        <Avatar className="w-9 h-9 border border-gray-200 dark:border-zinc-700">
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback className="bg-red-900 text-white text-sm">
            DR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
