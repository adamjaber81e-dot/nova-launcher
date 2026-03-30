import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Game } from '../types'
import { formatPlayTime, getSourceLabel } from '../data/games'

function GameCard({ game, onLaunch, onToggleFavorite, onRemove }: {
  game: Game; onLaunch: (id: string) => void; onToggleFavorite: (id: string) => void; onRemove: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const sourceColors: Record<string, string> = {
    steam: '#66c0f4', epic: '#a0c4ff', battlenet: '#148eff', ubisoft: '#0070d1',
    ea: '#ff6b6b', manual: '#9ca3af', unknown: '#6b7280',
  }

  const lastPlayedText = game.lastPlayed ? (() => {
    const diff = Date.now() - new Date(game.lastPlayed).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(game.lastPlayed).toLocaleDateString()
  })() : 'Never'

  return (
    <div className="relative group bg-card border border-card-border rounded-lg overflow-hidden game-card-hover">
      <div className="h-36 bg-gradient-to-br from-muted to-card flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-30" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center mb-2 border border-border">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="M12 17v4"/>
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground px-2 line-clamp-1">{game.name}</div>
        </div>
        {game.isFavorite && (
          <div className="absolute top-2 left-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        )}
        {game.isRunning && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/20 border border-green-500/40 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-xs text-green-400 font-medium">Running</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{game.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: sourceColors[game.source] || '#9ca3af' }}>{getSourceLabel(game.source)}</span>
              {game.genre && (<><span className="text-muted-foreground/40">·</span><span className="text-xs text-muted-foreground">{game.genre}</span></>)}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-popover-border rounded-lg shadow-xl z-20 min-w-36 py-1">
                <button onClick={() => { onToggleFavorite(game.id); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={game.isFavorite ? '#facc15' : 'none'} stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {game.isFavorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button onClick={() => { onRemove(game.id); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                  </svg>
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {game.playTime !== undefined && <span>{formatPlayTime(game.playTime)}</span>}
          <span className="text-muted-foreground/40">·</span>
          <span>{lastPlayedText}</span>
        </div>
        <button onClick={() => onLaunch(game.id)} disabled={game.isRunning}
          className={`w-full py-1.5 rounded-md text-xs font-semibold transition-all ${game.isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground nova-glow-sm'}`}
        >
          {game.isRunning ? 'Running...' : 'Launch'}
        </button>
      </div>
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}/>}
    </div>
  )
}

function AddGameModal({ onClose, onAdd }: { onClose: () => void; onAdd: (game: Game) => void }) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [genre, setGenre] = useState('')
  const [source, setSource] = useState<Game['source']>('manual')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !path) return
    onAdd({ id: Date.now().toString(), name, path, genre: genre || undefined, source, isFavorite: false })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Add Game</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Game Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              placeholder="Counter-Strike 2" required
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Executable Path *</label>
            <input value={path} onChange={(e) => setPath(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono"
              placeholder="C:\Games\game.exe" required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Genre</label>
              <input value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                placeholder="FPS"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Platform</label>
              <select value={source} onChange={(e) => setSource(e.target.value as Game['source'])}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="steam">Steam</option>
                <option value="epic">Epic Games</option>
                <option value="battlenet">Battle.net</option>
                <option value="ubisoft">Ubisoft</option>
                <option value="ea">EA App</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-muted hover:bg-accent rounded-md text-sm text-foreground transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-primary hover:bg-primary/90 rounded-md text-sm text-primary-foreground font-semibold transition-colors">Add Game</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function LibraryPage() {
  const { games, launchGame, toggleFavorite, removeGame, addGame, scanGames, scanningGames } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = games.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    if (filter === 'favorites') return matchSearch && g.isFavorite
    if (filter === 'recent') return matchSearch && g.lastPlayed
    return matchSearch
  }).sort((a, b) => {
    if (filter === 'recent' && a.lastPlayed && b.lastPlayed) {
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">Game Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{games.length} games</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={scanGames} disabled={scanningGames}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-accent rounded-md text-xs text-foreground transition-colors border border-border"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={scanningGames ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {scanningGames ? 'Scanning...' : 'Scan'}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 rounded-md text-xs text-primary-foreground font-medium transition-colors nova-glow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Game
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games..."
            className="w-full bg-input border border-border rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          {(['all', 'favorites', 'recent'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-3 border border-border">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No games found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try scanning or add games manually</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} onLaunch={launchGame} onToggleFavorite={toggleFavorite} onRemove={removeGame}/>
            ))}
          </div>
        )}
      </div>
      {showAddModal && <AddGameModal onClose={() => setShowAddModal(false)} onAdd={addGame}/>}
    </div>
  )
}


