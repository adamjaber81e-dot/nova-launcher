import { useState, useRef, useEffect, useCallback } from 'react'

function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [h * 360, max ? d / max : 0, max]
}

function hsvToHex(h: number, s: number, v: number): string {
  h /= 360
  const i = Math.floor(h * 6), f = h * 6 - i
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  let r = 0, g = 0, b = 0
  switch (i % 6) {
    case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break
    case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break
    case 4: r=t; g=p; b=v; break; case 5: r=v; g=p; b=q; break
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h /= 360
  const i = Math.floor(h * 6), f = h * 6 - i
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  let r = 0, g = 0, b = 0
  switch (i % 6) {
    case 0: r=v; g=t; b=p; break; case 1: r=q; g=v; b=p; break
    case 2: r=p; g=v; b=t; break; case 3: r=p; g=q; b=v; break
    case 4: r=t; g=p; b=v; break; case 5: r=v; g=p; b=q; break
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
}

function SVSquare({ hue, saturation, value, onChange }: { hue: number; saturation: number; value: number; onChange: (s: number, v: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drag = useRef(false)
  const W = 150, H = 110

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = devicePixelRatio || 1
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    const imgData = ctx.createImageData(W, H)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const s = x / W, v = 1 - y / H
        const [r, g, b] = hsvToRgb(hue, s, v)
        const i = (y * W + x) * 4
        imgData.data[i] = r; imgData.data[i+1] = g; imgData.data[i+2] = b; imgData.data[i+3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)
    const cx = saturation * W, cy = (1 - value) * H
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2)
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke()
  }, [hue, saturation, value])

  const handle = useCallback((e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / W))
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / H))
    onChange(s, v)
  }, [onChange])

  return (
    <canvas ref={ref} style={{ cursor: 'crosshair', display: 'block', borderRadius: '6px' }}
      onPointerDown={e => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); handle(e) }}
      onPointerMove={e => { if (drag.current) handle(e) }}
      onPointerUp={() => { drag.current = false }}
    />
  )
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drag = useRef(false)
  const W = 150, H = 14

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = devicePixelRatio || 1
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    for (let i = 0; i <= 360; i += 30) grad.addColorStop(i / 360, `hsl(${i},100%,50%)`)
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.roundRect(0, 0, W, H, 6); ctx.fill()
    const cx = Math.max(7, Math.min(W - 7, (hue / 360) * W))
    ctx.beginPath(); ctx.arc(cx, H / 2, 7, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${hue},100%,50%)`; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
  }, [hue])

  const handle = useCallback((e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / W) * 360))
    onChange(h)
  }, [onChange])

  return (
    <canvas ref={ref} style={{ cursor: 'pointer', display: 'block', borderRadius: '6px' }}
      onPointerDown={e => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); handle(e) }}
      onPointerMove={e => { if (drag.current) handle(e) }}
      onPointerUp={() => { drag.current = false }}
    />
  )
}

interface HexColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

const PRESETS = [
  '#FF0000','#FF4400','#FF8800','#FFCC00','#FFFF00',
  '#00FF00','#00FF88','#00FFFF','#0088FF','#3B82F6',
  '#8B5CF6','#FF00FF','#FFFFFF','#888888','#000000',
]

export function HexColorPicker({ value, onChange, label, className = '' }: HexColorPickerProps) {
  const isValid = (h: string) => /^#[0-9A-Fa-f]{6}$/.test(h)
  const safe = isValid(value) ? value.toUpperCase() : '#00FF00'
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(safe))
  const [hexInput, setHexInput] = useState(safe)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) { const h = isValid(value) ? value.toUpperCase() : safe; setHsv(hexToHsv(h)); setHexInput(h) }
  }, [value, isOpen])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const [h, s, v] = hsv
  const hex = hsvToHex(h, s, v)
  const [r, g, b] = [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]

  const commit = (nh: number, ns: number, nv: number) => {
    setHsv([nh, ns, nv])
    const newHex = hsvToHex(nh, ns, nv)
    setHexInput(newHex); onChange(newHex)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.toUpperCase()
    if (!raw.startsWith('#')) raw = '#' + raw
    setHexInput(raw)
    if (isValid(raw)) { setHsv(hexToHsv(raw)); onChange(raw) }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>}
      <div className="flex items-center gap-2">
        <button onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg border-2 border-border flex-shrink-0 transition-all hover:scale-105 shadow"
          style={{ background: hex }} title={hex}
        />
        <input type="text" value={hexInput} onChange={handleHexInput} maxLength={7}
          className="flex-1 bg-input border border-border rounded-md px-2.5 py-1.5 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary tracking-widest"
          placeholder="#000000"
        />
        <span className="hidden sm:block text-xs font-mono text-muted-foreground tabular-nums">{r},{g},{b}</span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 rounded-xl border border-border shadow-2xl p-4 space-y-3"
          style={{ background: 'hsl(var(--card))', width: '182px' }}
        >
          <div className="flex justify-center">
            <SVSquare hue={h} saturation={s} value={v} onChange={(ns, nv) => commit(h, ns, nv)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hue</div>
            <HueSlider hue={h} onChange={(nh) => commit(nh, s, v)} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border border-border flex-shrink-0" style={{ background: hex }} />
            <input type="text" value={hexInput} onChange={handleHexInput} maxLength={7}
              className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary tracking-widest"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            {([['R', r], ['G', g], ['B', b]] as const).map(([ch, val]) => (
              <div key={ch} className="bg-muted rounded py-1">
                <div className="text-xs font-mono font-bold text-foreground">{val}</div>
                <div className="text-xs text-muted-foreground">{ch}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Quick Presets</div>
            <div className="grid grid-cols-5 gap-1">
              {PRESETS.map(c => (
                <button key={c} onClick={() => { const newHsv = hexToHsv(c); setHsv(newHsv); setHexInput(c); onChange(c) }}
                  className={`w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform ${hex === c ? 'border-primary' : 'border-transparent'}`}
                  style={{ background: c }} title={c}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


