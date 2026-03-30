import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { CrosshairCanvas } from '../components/CrosshairCanvas'
import { HexColorPicker } from '../components/HexColorPicker'
import { CrosshairPreset } from '../types'
import { CROSSHAIR_PRESETS } from '../data/crosshairs'

function SliderRow({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary h-1.5 cursor-pointer"
      />
      <span className="text-xs text-foreground w-9 text-right font-mono tabular-nums">{value}</span>
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted border border-border'}`}
      >
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`}/>
      </button>
    </div>
  )
}

function CrosshairEditor({ preset, onChange }: { preset: CrosshairPreset; onChange: (updates: Partial<CrosshairPreset>) => void }) {
  return (
    <div className="space-y-3">
      <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</h4>
        <div className="grid grid-cols-5 gap-1">
          {(['classic', 'dot', 'cross', 'circle', 'crossdot'] as const).map((s) => (
            <button key={s} onClick={() => onChange({ style: s })}
              className={`py-1 rounded text-xs capitalize transition-colors ${preset.style === s ? 'bg-primary/25 text-primary border border-primary/40' : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'}`}
            >{s}</button>
          ))}
        </div>
      </div>
      <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size & Shape</h4>
        <SliderRow label="Size" value={preset.size} min={1} max={20} onChange={(v) => onChange({ size: v })}/>
        <SliderRow label="Thickness" value={preset.thickness} min={1} max={8} onChange={(v) => onChange({ thickness: v })}/>
        <SliderRow label="Gap" value={preset.gap} min={-10} max={10} onChange={(v) => onChange({ gap: v })}/>
        <SliderRow label="Spread" value={preset.spread} min={0} max={20} onChange={(v) => onChange({ spread: v })}/>
      </div>
      <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</h4>
        <HexColorPicker label="Color" value={preset.color} onChange={(c) => onChange({ color: c })}/>
        <SliderRow label="Opacity" value={preset.opacity} min={0} max={255} onChange={(v) => onChange({ opacity: v })}/>
      </div>
      <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outline</h4>
        <ToggleRow label="Enable Outline" value={preset.outlineEnabled} onChange={(v) => onChange({ outlineEnabled: v })}/>
        {preset.outlineEnabled && (
          <>
            <HexColorPicker label="Outline Color" value={preset.outlineColor} onChange={(c) => onChange({ outlineColor: c })}/>
            <SliderRow label="Thickness" value={preset.outlineThickness} min={1} max={4} onChange={(v) => onChange({ outlineThickness: v })}/>
          </>
        )}
      </div>
      <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arms</h4>
        <div className="grid grid-cols-2 gap-x-6">
          <ToggleRow label="Top" value={preset.topEnabled} onChange={(v) => onChange({ topEnabled: v })}/>
          <ToggleRow label="Bottom" value={preset.bottomEnabled} onChange={(v) => onChange({ bottomEnabled: v })}/>
          <ToggleRow label="Left" value={preset.leftEnabled} onChange={(v) => onChange({ leftEnabled: v })}/>
          <ToggleRow label="Right" value={preset.rightEnabled} onChange={(v) => onChange({ rightEnabled: v })}/>
        </div>
        <ToggleRow label="T-Style (no bottom)" value={preset.tStyleEnabled} onChange={(v) => onChange({ tStyleEnabled: v })}/>
      </div>
      <div className="bg-muted/40 rounded-lg p-3 space-y-2 border border-border/50">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Center Dot</h4>
        <ToggleRow label="Enable Dot" value={preset.dotEnabled} onChange={(v) => onChange({ dotEnabled: v })}/>
        {preset.dotEnabled && <SliderRow label="Dot Size" value={preset.dotSize} min={1} max={8} onChange={(v) => onChange({ dotSize: v })}/>}
      </div>
    </div>
  )
}

const BG_PRESETS = [
  { label: 'Dark', color: '#0f1117' }, { label: 'Navy', color: '#0d1b2a' },
  { label: 'Forest', color: '#0d1f0e' }, { label: 'Gray', color: '#1a1a1a' },
  { label: 'Light', color: '#d4d4d4' },
]

function PreviewPanel({ preset, scale, onScaleChange, bg, onBgChange }: {
  preset: CrosshairPreset; scale: number; onScaleChange: (v: number) => void; bg: string; onBgChange: (c: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full rounded-xl border border-border flex items-center justify-center overflow-hidden" style={{ background: bg, height: '220px' }}>
        <CrosshairCanvas preset={preset} size={220} background={bg} scale={scale}/>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <span className="text-xs font-mono text-foreground">{scale.toFixed(1)}×</span>
        </div>
        <input type="range" min={0.3} max={8} step={0.1} value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full accent-primary h-1.5 cursor-pointer"
        />
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-2">Background</div>
        <div className="flex gap-2 mb-2">
          {BG_PRESETS.map((b) => (
            <button key={b.color} onClick={() => onBgChange(b.color)} title={b.label}
              className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${bg === b.color ? 'border-primary' : 'border-border'}`}
              style={{ background: b.color }}
            />
          ))}
        </div>
        <HexColorPicker value={bg} onChange={onBgChange}/>
      </div>
      <div className="bg-muted/50 rounded-lg p-3 border border-border text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: preset.color }}/>
          <span className="font-semibold text-foreground">{preset.player}</span>
          <span className={`ml-auto font-medium ${preset.game === 'cs2' ? 'text-orange-400' : 'text-blue-400'}`}>
            {preset.game === 'cs2' ? 'CS2' : 'Fortnite'}
          </span>
        </div>
        {preset.team && <div className="text-muted-foreground">{preset.team}</div>}
        <div className="text-muted-foreground font-mono">{preset.color} · Size {preset.size} · Gap {preset.gap}</div>
      </div>
    </div>
  )
}

function PresetCard({ preset, isActive, onClick }: { preset: CrosshairPreset; isActive: boolean; onClick: () => void }) {
  const thumbScale = Math.max(1.2, 3 / Math.max(1, preset.size))
  return (
    <button onClick={onClick}
      className={`relative bg-card border rounded-xl p-3 text-left transition-all hover:border-primary/50 hover:shadow-lg ${isActive ? 'border-primary shadow-md shadow-primary/10' : 'border-card-border'}`}
    >
      {isActive && (
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
      <div className="flex justify-center mb-2.5">
        <div className="rounded-lg overflow-hidden border border-border/50">
          <CrosshairCanvas preset={preset} size={72} background="#090b10" scale={thumbScale}/>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/10" style={{ background: preset.color }}/>
        <div className="text-xs font-semibold text-foreground truncate">{preset.player}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-medium ${preset.game === 'cs2' ? 'text-orange-400' : 'text-blue-400'}`}>
          {preset.game === 'cs2' ? 'CS2' : 'FN'}
        </span>
        {preset.team && <span className="text-xs text-muted-foreground truncate">· {preset.team}</span>}
      </div>
      <div className="mt-1.5">
        <span className="text-xs text-muted-foreground/60 font-mono">s:{preset.size} g:{preset.gap} t:{preset.thickness}</span>
      </div>
    </button>
  )
}

export function CrosshairPage() {
  const { customCrosshair, updateCustomCrosshair, setActiveCrosshair, activeCrosshair } = useStore()
  const [gameFilter, setGameFilter] = useState<'all' | 'cs2' | 'fortnite'>('all')
  const [previewBg, setPreviewBg] = useState('#0f1117')
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')
  const [selectedPreset, setSelectedPreset] = useState<CrosshairPreset>(CROSSHAIR_PRESETS[0])
  const [editedPreset, setEditedPreset] = useState<CrosshairPreset>(CROSSHAIR_PRESETS[0])
  const [previewScale, setPreviewScale] = useState(2.0)
  const [isEditing, setIsEditing] = useState(false)

  const filteredPresets = CROSSHAIR_PRESETS.filter((p) => gameFilter === 'all' ? true : p.game === gameFilter)
  const cs2Count = CROSSHAIR_PRESETS.filter((p) => p.game === 'cs2').length
  const fnCount = CROSSHAIR_PRESETS.filter((p) => p.game === 'fortnite').length

  const handleSelectPreset = useCallback((preset: CrosshairPreset) => {
    setSelectedPreset(preset); setEditedPreset({ ...preset }); setIsEditing(false)
  }, [])

  const handleEdit = useCallback((updates: Partial<CrosshairPreset>) => {
    setEditedPreset((prev) => ({ ...prev, ...updates })); setIsEditing(true)
  }, [])

  const handleReset = useCallback(() => { setEditedPreset({ ...selectedPreset }); setIsEditing(false) }, [selectedPreset])
  const handleApply = useCallback(() => { setActiveCrosshair({ ...editedPreset }) }, [editedPreset, setActiveCrosshair])
  const handleSaveAsCustom = useCallback(() => {
    updateCustomCrosshair({ ...editedPreset, id: 'custom', name: 'Custom', player: 'Custom' })
    setActiveCrosshair({ ...editedPreset, id: 'custom', name: 'Custom', player: 'Custom' })
    setActiveTab('custom')
  }, [editedPreset, updateCustomCrosshair, setActiveCrosshair])

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h1 className="text-base font-semibold text-foreground">Crosshair</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{activeTab === 'presets' ? 'Select a pro preset, then edit it' : 'Build your own from scratch'}</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            {(['presets', 'custom'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
              >{t === 'presets' ? 'Pro Presets' : 'Custom'}</button>
            ))}
          </div>
        </div>

        {activeTab === 'presets' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border flex-shrink-0">
                {([{ key: 'all', label: `All (${CROSSHAIR_PRESETS.length})` }, { key: 'cs2', label: `CS2 (${cs2Count})` }, { key: 'fortnite', label: `Fortnite (${fnCount})` }] as const).map(({ key, label }) => (
                  <button key={key} onClick={() => setGameFilter(key)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${gameFilter === key ? 'bg-primary/15 text-primary border border-primary/25' : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'}`}
                  >{label}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {filteredPresets.map((preset) => (
                    <PresetCard key={preset.id} preset={preset} isActive={selectedPreset.id === preset.id} onClick={() => handleSelectPreset(preset)}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-64 flex-shrink-0 border-l border-border flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="text-xs font-semibold text-foreground">{selectedPreset.player}</div>
                  <div className="text-xs text-muted-foreground">Edit preset</div>
                </div>
                {isEditing && (
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted border border-border transition-colors">Reset</button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <CrosshairEditor preset={editedPreset} onChange={handleEdit}/>
              </div>
              <div className="p-3 border-t border-border space-y-2 flex-shrink-0">
                <button onClick={handleApply} className="w-full py-2 bg-primary hover:bg-primary/90 rounded-lg text-xs text-primary-foreground font-semibold transition-colors">
                  {isEditing ? '⚡ Apply Modified' : '⚡ Apply Preset'}
                </button>
                {isEditing && (
                  <button onClick={handleSaveAsCustom} className="w-full py-1.5 bg-muted hover:bg-accent rounded-lg text-xs text-muted-foreground hover:text-foreground font-medium transition-colors border border-border">
                    Save as Custom
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="max-w-md space-y-3">
              <CrosshairEditor preset={customCrosshair} onChange={(u) => updateCustomCrosshair(u)}/>
              <button onClick={() => setActiveCrosshair({ ...customCrosshair, id: 'custom' })}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 rounded-lg text-sm text-primary-foreground font-semibold transition-colors"
              >⚡ Apply Custom Crosshair</button>
            </div>
          </div>
        )}
      </div>

      <div className="w-64 flex-shrink-0 border-l border-border flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</h2>
          {activeCrosshair && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"/>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <PreviewPanel
            preset={activeTab === 'presets' ? editedPreset : customCrosshair}
            scale={previewScale} onScaleChange={setPreviewScale}
            bg={previewBg} onBgChange={setPreviewBg}
          />
          {activeCrosshair && (
            <div className="mt-4 p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-white/10 flex-shrink-0" style={{ background: activeCrosshair.color }}/>
                <span className="font-medium text-foreground">{activeCrosshair.player}</span>
              </div>
              <CrosshairCanvas preset={activeCrosshair} size={56} background={previewBg} scale={1.5} className="rounded-md border border-border/50"/>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


