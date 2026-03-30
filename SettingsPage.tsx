import { useStore } from '../store/useStore'
import { HexColorPicker } from '../components/HexColorPicker'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${value ? 'translate-x-5' : 'translate-x-0.5'}`}/>
    </button>
  )
}

export function SettingsPage() {
  const { settings, updateSettings } = useStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h1 className="text-base font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure Nova Launcher preferences</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl">
        <Section title="Appearance">
          <SettingRow label="Accent Color" description="Primary color used throughout the interface">
            <HexColorPicker value={settings.accentColor} onChange={(c) => updateSettings({ accentColor: c })} className="w-48"/>
          </SettingRow>
          <SettingRow label="Theme" description="Choose your preferred color theme">
            <div className="flex gap-1.5 bg-muted rounded-lg p-0.5">
              {(['dark', 'darker', 'midnight'] as const).map((t) => (
                <button key={t} onClick={() => updateSettings({ theme: t })}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${settings.theme === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >{t}</button>
              ))}
            </div>
          </SettingRow>
        </Section>

        <Section title="Game Library">
          <SettingRow label="Auto-detect Games" description="Automatically scan common game directories on startup">
            <Toggle value={settings.autoDetectGames} onChange={(v) => updateSettings({ autoDetectGames: v })}/>
          </SettingRow>
          <div>
            <div className="text-sm text-foreground font-medium mb-1.5">Scan Directories</div>
            <div className="text-xs text-muted-foreground mb-3">Folders to scan for installed games</div>
            <div className="space-y-2 mb-3">
              {settings.gameLibraryPaths.map((path, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 border border-border">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="text-xs font-mono text-foreground flex-1 truncate">{path}</span>
                  <button onClick={() => updateSettings({ gameLibraryPaths: settings.gameLibraryPaths.filter((_, idx) => idx !== i) })}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => { const path = prompt('Enter directory path:'); if (path) updateSettings({ gameLibraryPaths: [...settings.gameLibraryPaths, path] }) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-accent rounded-md text-xs text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Directory
            </button>
          </div>
        </Section>

        <Section title="Application">
          <SettingRow label="Minimize to System Tray" description="Keep running in background when window is closed">
            <Toggle value={settings.minimizeToTray} onChange={(v) => updateSettings({ minimizeToTray: v })}/>
          </SettingRow>
          <SettingRow label="Launch on System Startup" description="Start Nova Launcher automatically when Windows starts">
            <Toggle value={settings.launchOnStartup} onChange={(v) => updateSettings({ launchOnStartup: v })}/>
          </SettingRow>
        </Section>

        <Section title="In-Game Overlay">
          <SettingRow label="Enable Overlay" description="Show crosshair overlay on top of any game">
            <Toggle value={settings.overlayEnabled} onChange={(v) => updateSettings({ overlayEnabled: v })}/>
          </SettingRow>
          <SettingRow label="Toggle Hotkey" description="Key to show/hide the overlay">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono text-foreground">{settings.overlayHotkey}</kbd>
              <button className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-accent border border-border rounded transition-colors">Change</button>
            </div>
          </SettingRow>
        </Section>

        <Section title="Updates">
          <SettingRow label="Update Channel" description="Choose between stable releases or beta builds">
            <div className="flex gap-1.5 bg-muted rounded-lg p-0.5">
              {(['stable', 'beta'] as const).map((c) => (
                <button key={c} onClick={() => updateSettings({ updateChannel: c })}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${settings.updateChannel === c ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >{c}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Current Version" description="Installed version of Nova Launcher">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border">v{settings.currentVersion}</span>
          </SettingRow>
        </Section>

        <Section title="About">
          <div className="flex items-center gap-4 py-1">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center nova-glow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Nova Launcher</div>
              <div className="text-xs text-muted-foreground">Version {settings.currentVersion} · Gaming optimized</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">Desktop app built with Electron + React</div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <a href="https://github.com/nova-launcher/nova/releases" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-accent border border-border rounded-md text-xs text-foreground transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              GitHub Releases
            </a>
          </div>
        </Section>
      </div>
    </div>
  )
}


