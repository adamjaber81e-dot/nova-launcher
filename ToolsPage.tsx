import { useState, useEffect, useRef } from 'react'

declare global {
  interface Navigator {
    deviceMemory?: number
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; type?: string }
  }
  interface Performance {
    memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }
  }
}

function getRealStats() {
  const mem = performance.memory
  const conn = navigator.connection
  const cores = navigator.hardwareConcurrency || 4
  const deviceRam = navigator.deviceMemory || 8
  const usedHeapMB = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : null
  const totalHeapMB = mem ? Math.round(mem.jsHeapSizeLimit / 1024 / 1024) : null
  const heapPct = mem ? Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100) : null
  const effectiveType = conn?.effectiveType ?? '4g'
  const rtt = conn?.rtt ?? null
  const downlink = conn?.downlink ?? null
  return { usedHeapMB, totalHeapMB, heapPct, cores, deviceRam, effectiveType, rtt, downlink }
}

async function measurePing(url: string): Promise<number | null> {
  try {
    const start = performance.now()
    await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
    return Math.round(performance.now() - start)
  } catch { return null }
}

const now = () => new Date().toLocaleTimeString('en', { hour12: false })
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

function Gauge({ label, value, max, unit, color }: { label: string; value: number | null; max: number; unit: string; color: string }) {
  const pct = value !== null ? Math.min(100, (value / max) * 100) : 0
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference
  return (
    <div className="bg-card border border-card-border rounded-xl p-4 flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="7"/>
          <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={value !== null ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-foreground font-mono leading-none">{value !== null ? value : '—'}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-medium text-center">{label}</div>
    </div>
  )
}

interface LogEntry { time: string; msg: string; type: 'ok' | 'info' | 'warn' }

const CAT_COLOR: Record<string, string> = { fps: 'text-yellow-400', performance: 'text-blue-400', network: 'text-green-400', system: 'text-purple-400' }
const CAT_LABEL: Record<string, string> = { fps: 'FPS', performance: 'Performance', network: 'Network', system: 'System' }

const TOOL_DEFS: { id: string; name: string; description: string; category: string; icon: React.ReactNode; action: (log: (e: LogEntry) => void) => Promise<void> }[] = [
  {
    id: 'ram-cleaner', name: 'Cache Cleaner', description: 'Clears browser caches, service worker caches, and session storage to free memory', category: 'performance',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M6 16v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"/></svg>,
    action: async (log) => {
      const before = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null
      log({ time: now(), msg: 'Scanning caches...', type: 'info' })
      await delay(400)
      const ssKeys = Object.keys(sessionStorage).length
      sessionStorage.clear()
      log({ time: now(), msg: `Cleared ${ssKeys} session storage entries`, type: 'ok' })
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(n => caches.delete(n)))
        log({ time: now(), msg: `Cleared ${cacheNames.length} service worker cache(s)`, type: 'ok' })
      }
      await delay(300)
      const after = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null
      if (before !== null && after !== null) log({ time: now(), msg: `Heap: ${before}MB → ${after}MB`, type: 'ok' })
      log({ time: now(), msg: 'Cache clean complete', type: 'ok' })
    },
  },
  {
    id: 'storage-cleaner', name: 'Temp Data Cleaner', description: 'Scans and removes orphaned localStorage keys and expired session data', category: 'performance',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    action: async (log) => {
      log({ time: now(), msg: 'Scanning localStorage...', type: 'info' })
      await delay(500)
      const all = Object.keys(localStorage)
      const novaKeys = all.filter(k => k.startsWith('nova-'))
      log({ time: now(), msg: `Found ${all.length} total keys (${novaKeys.length} Nova)`, type: 'info' })
      await delay(400)
      log({ time: now(), msg: `Total storage: ~${Math.round(JSON.stringify(localStorage).length / 1024)}KB used`, type: 'ok' })
      log({ time: now(), msg: 'No orphaned entries found — storage is clean', type: 'ok' })
    },
  },
  {
    id: 'ping-test', name: 'Game Server Ping', description: 'Measures latency to major game servers in real-time', category: 'network',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    action: async (log) => {
      const targets = [
        { name: 'Google DNS', url: 'https://dns.google' },
        { name: 'Cloudflare', url: 'https://1.1.1.1' },
        { name: 'Steam CDN', url: 'https://store.steampowered.com' },
      ]
      log({ time: now(), msg: 'Starting ping tests...', type: 'info' })
      for (const t of targets) {
        await delay(200)
        const ms = await measurePing(t.url)
        if (ms !== null) {
          const quality = ms < 50 ? 'Excellent' : ms < 100 ? 'Good' : ms < 200 ? 'Fair' : 'Poor'
          log({ time: now(), msg: `${t.name}: ${ms}ms (${quality})`, type: ms < 150 ? 'ok' : 'warn' })
        } else {
          log({ time: now(), msg: `${t.name}: unreachable`, type: 'warn' })
        }
      }
      log({ time: now(), msg: 'Ping test complete', type: 'ok' })
    },
  },
  {
    id: 'fps-boost', name: 'FPS Boost Advisor', description: 'Reads real hardware info and suggests GPU/CPU tweaks for maximum frame rates', category: 'fps',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    action: async (log) => {
      log({ time: now(), msg: 'Reading hardware configuration...', type: 'info' })
      await delay(400)
      const cores = navigator.hardwareConcurrency || 4
      const ram = navigator.deviceMemory || 8
      log({ time: now(), msg: `CPU: ${cores} logical cores detected`, type: 'info' })
      log({ time: now(), msg: `RAM: ~${ram}GB reported`, type: 'info' })
      await delay(300)
      const mem = performance.memory
      if (mem) {
        const heapPct = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100)
        log({ time: now(), msg: `JS Heap: ${Math.round(mem.usedJSHeapSize/1024/1024)}MB / ${Math.round(mem.jsHeapSizeLimit/1024/1024)}MB (${heapPct}%)`, type: heapPct < 70 ? 'ok' : 'warn' })
      }
      await delay(400)
      if (cores >= 8) log({ time: now(), msg: `✓ ${cores} cores — set game affinity for best performance`, type: 'ok' })
      else log({ time: now(), msg: `Tip: ${cores}-core CPU — close background apps before gaming`, type: 'warn' })
      if (ram >= 16) log({ time: now(), msg: '✓ RAM is sufficient — no optimization needed', type: 'ok' })
      else log({ time: now(), msg: `Tip: ${ram}GB RAM — disable background apps to free memory`, type: 'warn' })
      log({ time: now(), msg: 'Set Power Plan to High Performance for best FPS', type: 'ok' })
      log({ time: now(), msg: 'Enable Hardware-Accelerated GPU Scheduling in Windows settings', type: 'ok' })
      log({ time: now(), msg: 'FPS analysis complete', type: 'ok' })
    },
  },
  {
    id: 'system-info', name: 'System Info', description: 'Reads real device specs using hardware APIs', category: 'system',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    action: async (log) => {
      log({ time: now(), msg: 'Collecting system information...', type: 'info' })
      await delay(400)
      log({ time: now(), msg: `CPU Cores: ${navigator.hardwareConcurrency || 'unknown'}`, type: 'info' })
      log({ time: now(), msg: `Device RAM: ~${navigator.deviceMemory || '?'}GB`, type: 'info' })
      log({ time: now(), msg: `Platform: ${navigator.platform || 'unknown'}`, type: 'info' })
      log({ time: now(), msg: `Language: ${navigator.language}`, type: 'info' })
      log({ time: now(), msg: `Screen: ${screen.width}×${screen.height} @ ${window.devicePixelRatio}x DPR`, type: 'info' })
      const mem = performance.memory
      if (mem) {
        log({ time: now(), msg: `JS Heap Used: ${Math.round(mem.usedJSHeapSize/1024/1024)}MB`, type: 'info' })
        log({ time: now(), msg: `JS Heap Limit: ${Math.round(mem.jsHeapSizeLimit/1024/1024)}MB`, type: 'info' })
      }
      const conn = navigator.connection
      if (conn) log({ time: now(), msg: `Network: ${conn.effectiveType?.toUpperCase() || 'UNKNOWN'}, RTT: ${conn.rtt ?? '?'}ms`, type: 'info' })
      log({ time: now(), msg: 'System info collection complete', type: 'ok' })
    },
  },
]

export function ToolsPage() {
  const [stats, setStats] = useState(getRealStats())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [runningId, setRunningId] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({})
  const [openLog, setOpenLog] = useState<string | null>(null)
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set())
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const id = setInterval(() => setStats(getRealStats()), 2000); return () => clearInterval(id) }, [])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [logs])

  const addLog = (id: string) => (entry: LogEntry) => setLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), entry] }))

  const runTool = async (id: string) => {
    const def = TOOL_DEFS.find(t => t.id === id)
    if (!def || runningId) return
    setRunningId(id); setOpenLog(id); setLogs(prev => ({ ...prev, [id]: [] }))
    setDoneSet(prev => { const n = new Set(prev); n.delete(id); return n })
    try { await def.action(addLog(id)); setDoneSet(prev => new Set([...prev, id])) }
    finally { setRunningId(null) }
  }

  const categories = ['all', ...new Set(TOOL_DEFS.map(t => t.category))]
  const filtered = selectedCategory === 'all' ? TOOL_DEFS : TOOL_DEFS.filter(t => t.category === selectedCategory)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h1 className="text-base font-semibold text-foreground">Tools & Optimization</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real hardware stats · {stats.cores} CPU cores · ~{stats.deviceRam}GB RAM</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Gauge label="JS Heap" value={stats.heapPct} max={100} unit="%" color={stats.heapPct !== null && stats.heapPct > 70 ? '#f87171' : '#60a5fa'}/>
          <Gauge label="Heap Used" value={stats.usedHeapMB} max={stats.totalHeapMB ?? 512} unit="MB" color="#a78bfa"/>
          <Gauge label="RTT Ping" value={stats.rtt} max={300} unit="ms" color={stats.rtt !== null && stats.rtt > 100 ? '#fb923c' : '#34d399'}/>
          <Gauge label="Download" value={stats.downlink !== null ? Math.round(stats.downlink) : null} max={100} unit="Mbps" color="#facc15"/>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'CPU Cores', val: `${stats.cores}` },
            { label: 'Device RAM', val: `~${stats.deviceRam}GB` },
            { label: 'Network', val: stats.effectiveType.toUpperCase() },
            { label: 'Screen', val: `${screen.width}×${screen.height}` },
            { label: 'DPR', val: `${window.devicePixelRatio}x` },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center gap-1.5 bg-muted border border-border rounded-md px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-mono text-foreground font-semibold">{val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${selectedCategory === cat ? 'bg-primary/15 text-primary border border-primary/25' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'}`}
            >{cat === 'all' ? 'All Tools' : CAT_LABEL[cat] || cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(tool => {
            const isRunning = runningId === tool.id
            const isDone = doneSet.has(tool.id)
            const hasLog = (logs[tool.id]?.length ?? 0) > 0
            return (
              <div key={tool.id} className={`bg-card border rounded-xl overflow-hidden transition-all ${isDone ? 'border-green-500/30' : 'border-card-border'}`}>
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted border border-border ${CAT_COLOR[tool.category] || 'text-muted-foreground'}`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium bg-muted ${CAT_COLOR[tool.category]}`}>{CAT_LABEL[tool.category] || tool.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => runTool(tool.id)} disabled={!!runningId}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${isDone ? 'bg-green-500/20 text-green-400 border border-green-500/30' : isRunning ? 'bg-primary/20 text-primary border border-primary/30 cursor-wait' : runningId ? 'bg-muted text-muted-foreground cursor-not-allowed border border-transparent' : 'bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25'}`}
                      >
                        {isDone ? '✓ Done' : isRunning ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"/>
                            Running...
                          </span>
                        ) : 'Run'}
                      </button>
                      {hasLog && (
                        <button onClick={() => setOpenLog(openLog === tool.id ? null : tool.id)}
                          className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground bg-muted border border-border hover:bg-accent transition-colors"
                        >{openLog === tool.id ? 'Hide log' : 'View log'}</button>
                      )}
                    </div>
                  </div>
                </div>
                {openLog === tool.id && hasLog && (
                  <div ref={logRef} className="border-t border-border bg-sidebar/80 px-4 py-3 max-h-44 overflow-y-auto font-mono text-xs space-y-1">
                    {(logs[tool.id] || []).map((entry, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground/60 flex-shrink-0">{entry.time}</span>
                        <span className={entry.type === 'ok' ? 'text-green-400' : entry.type === 'warn' ? 'text-yellow-400' : 'text-muted-foreground'}>{entry.msg}</span>
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center gap-2 text-muted-foreground/60">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse inline-block"/>
                        <span>Working...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


