export function TitleBar() {
  const isElectron = !!window.electronAPI

  return (
    <div className="h-9 bg-sidebar border-b border-sidebar-border flex items-center justify-between flex-shrink-0 drag-region">
      <div className="flex items-center gap-2 px-4 no-drag">
        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center nova-glow-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-foreground tracking-wider">NOVA LAUNCHER</span>
      </div>

      {isElectron && (
        <div className="flex items-center no-drag">
          <button
            onClick={() => window.electronAPI!.minimizeWindow()}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Minimize"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
              <rect x="0" y="5.5" width="12" height="1" rx="0.5"/>
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI!.maximizeWindow()}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="1" width="10" height="10" rx="0.5"/>
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI!.closeWindow()}
            className="w-9 h-9 flex items-center justify-center hover:bg-red-500/80 text-muted-foreground hover:text-white transition-colors"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11"/>
              <line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}


