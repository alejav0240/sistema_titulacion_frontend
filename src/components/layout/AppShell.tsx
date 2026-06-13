import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '#/lib/utils'

export function AppShell({
  children,
  collapsed = false,
  noPadding = false,
  hideTopbar = false,
}: {
  children: React.ReactNode
  collapsed?: boolean
  noPadding?: boolean
  hideTopbar?: boolean
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      <Sidebar collapsed={collapsed} />
      <div
        className={cn(
          'flex h-screen flex-1 flex-col overflow-hidden',
          collapsed ? 'ml-20' : 'ml-[260px]',
        )}
      >
        {!hideTopbar && <Topbar />}
        <main
          className={cn(
            'thin-scrollbar flex flex-1 flex-col overflow-y-auto bg-[#FAFAFA]',
            !noPadding && 'block space-y-xl p-container-margin',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
