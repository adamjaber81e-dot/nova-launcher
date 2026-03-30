import { useState } from 'react'

interface Release {
  version: string; date: string; isCurrent?: boolean; isLatest?: boolean; type: 'stable' | 'beta'; size: string
  notes: { type: 'add' | 'fix' | 'improve' | 'remove'; text: string }[]; downloadUrl: string
}

const RELEASES: Release[] = [
  {
    version: '1.1.0', date: 'March 25, 2026', isLatest: true, type: 'stable', size: '42 MB',
    downloadUrl: 'https://github.com/nova-launcher/nova/releases/download/v1.1.0/nova-setup.exe',
    notes: [
      { type: 'add', text: 'Added Fortnite crosshair presets for top 7 players' },
      { type: 'add', text: 'New GPU Optimizer tool for maximum FPS' },
      { type: 'improve', text: 'Crosshair canvas preview now renders in real-time' },
      { type: 'improve', text: 'Game library now shows last played time' },
      { type: 'fix', text: 'Fixed Epic Games detection on Windows 11' },
      { type: 'fix', text: 'Fixed crosshair color picker not saving HEX values' },
    ],
  },
  {
    version: '1.0.5', date: 'March 10, 2026', isCurrent: true, type: 'stable', size: '40 MB',
    downloadUrl: 'https://github.com/nova-launcher/nova/releases/download/v1.0.5/nova-setup.exe',
    notes: [
      { type: 'fix', text: 'Fixed crash when scanning games on SSD with network drives' },
      { type: 'fix', text: 'Resolved memory leak in crosshair overlay' },
      { type: 'improve', text: 'Faster game scan performance (50% faster)' },
    ],
  },
  {
    version: '1.0.0', date: 'February 28, 2026', type: 'stable', size: '38 MB',
    downloadUrl: 'https://github.com/nova-launcher/nova/releases/download/v1.0.0/nova-setup.exe',
    notes: [
      { type: 'add', text: 'Initial release of Nova Launcher' },
      { type: 'add', text: 'Game library with auto-detection for Steam, Epic, Battle.net' },
      { type: 'add', text: 'CS2 crosshair presets: s1mple, ZywOo, NiKo, device, electronic, ropz, twistzz, broky' },
      { type: 'add', text: 'Custom crosshair editor with full HEX color support' },
      { type: 'add', text: 'System optimization tools: RAM Cleaner, FPS Boost, Network Optimizer' },
    ],
  },
  {
    version: '1.1.1-beta', date: 'March 28, 2026', type: 'beta', size: '43 MB',
    downloadUrl: 'https://github.com/nova-launcher/nova/releases/download/v1.1.1-beta/nova-setup-beta.exe',
    notes: [
      { type: 'add', text: '[BETA] In-game overlay with crosshair display' },
      { type: 'add', text: '[BETA] Discord Rich Presence integration' },
      { type: 'improve', text: '[BETA] Redesigned settings panel' },
    ],
  },
]

const NOTE_STYLES = {
  add: { icon: '+', color: 'text-green-400', bg: 'bg-green-400/10' },
  fix: { icon: '✓', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  improve: { icon: '↑', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  remove: { icon: '−', color: 'text-red-400', bg: 'bg-red-400/10' },
}

export function UpdatesPage() {
  const [checking, setChecking] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showBeta, setShowBeta] = useState(false)

  const checkForUpdates = async () => {
    setChecking(true)
    await new Promise((r) => setTimeout(r, 2000))
    setChecking(false)
  }

  const downloadUpdate = async (version: string) => {
    setDownloading(version); setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress((p) => {
        if (p >= 100) { clearInterval(interval); setDownloading(null); return 100 }
        return p + Math.random() * 15
      })
    }, 300)
  }

  const visibleReleases = RELEASES.filter((r) => showBeta || r.type !== 'beta')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Updates</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Nova Launcher update manager via GitHub Releases</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-muted-foreground">Show Beta</span>
              <button onClick={() => setShowBeta(!showBeta)}
                className={`w-8 h-4 rounded-full transition-colors relative ${showBeta ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showBeta ? 'translate-x-4' : 'translate-x-0.5'}`}/>
              </button>
            </label>
            <button onClick={checkForUpdates} disabled={checking}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 rounded-md text-xs text-primary-foreground font-medium transition-colors nova-glow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={checking ? 'animate-spin' : ''}>
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {checking ? 'Checking...' : 'Check for Updates'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Nova Launcher v1.0.5</div>
              <div className="text-xs text-muted-foreground">Currently installed · Update available</div>
            </div>
          </div>
          <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-full font-medium">v1.1.0 available</span>
        </div>
        {visibleReleases.map((release) => (
          <div key={release.version} className={`bg-card border rounded-xl overflow-hidden ${release.isCurrent ? 'border-primary/30' : 'border-card-border'}`}>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">v{release.version}</span>
                  {release.isLatest && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-medium">Latest</span>}
                  {release.isCurrent && <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-medium">Installed</span>}
                  {release.type === 'beta' && <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-medium">Beta</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{release.date} · {release.size}</div>
              </div>
              <div className="flex items-center gap-2">
                {!release.isCurrent && (
                  downloading === release.version ? (
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(downloadProgress, 100)}%` }}/>
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(Math.min(downloadProgress, 100))}%</span>
                    </div>
                  ) : (
                    <button onClick={() => downloadUpdate(release.version)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${release.isLatest ? 'bg-primary hover:bg-primary/90 text-primary-foreground nova-glow-sm' : 'bg-muted hover:bg-accent text-foreground border border-border'}`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {release.isLatest ? 'Update Now' : 'Download'}
                    </button>
                  )
                )}
                <a href={release.downloadUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div className="px-5 pb-4 border-t border-border pt-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Release Notes</div>
              <ul className="space-y-1.5">
                {release.notes.map((note, i) => {
                  const style = NOTE_STYLES[note.type]
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs font-bold ${style.color} ${style.bg} mt-0.5`}>{style.icon}</span>
                      <span className="text-xs text-muted-foreground">{note.text}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


