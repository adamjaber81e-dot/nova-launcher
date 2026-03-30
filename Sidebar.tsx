import { Page } from '../types'
import { useStore } from '../store/useStore'

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: 'library', label: 'Game Library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="7" height="18" rx="1"/><rect x="9" y="7" width="7" height="14" rx="1"/><rect x="16" y="11" width="7" height="10" rx="1"/>
      </svg>
    ),
  },
  {
    page: 'crosshair', label: 'Crosshair',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/>
        <line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
      </svg>
    ),
  },
  {
    page: 'tools', label: 'Tools',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    page: 'updates', label: 'Updates',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
  },
  {
    page: 'settings', label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const { currentPage, setPage } = useStore()

  return (
    <aside className="w-16 lg:w-56 flex flex-col bg-sidebar border-r border-sidebar-border h-full flex-shrink-0">
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ page, label, icon }) => {
          const isActive = currentPage === page
          return (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {icon}
              </span>
              <span className="hidden lg:block text-sm font-medium">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border hidden lg:block">
        <div className="text-xs text-muted-foreground text-center">v1.0.5</div>
      </div>
    </aside>
  )
}


