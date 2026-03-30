export interface Game {
  id: string
  name: string
  path: string
  icon?: string
  coverImage?: string
  genre?: string
  lastPlayed?: string
  playTime?: number
  source: 'steam' | 'epic' | 'battlenet' | 'ubisoft' | 'ea' | 'manual' | 'unknown'
  isFavorite?: boolean
  isRunning?: boolean
}

export interface CrosshairPreset {
  id: string
  name: string
  player: string
  game: 'cs2' | 'fortnite'
  team?: string
  country?: string
  color: string
  style: 'classic' | 'dot' | 'cross' | 'circle' | 'crossdot'
  size: number
  thickness: number
  gap: number
  opacity: number
  outlineEnabled: boolean
  outlineColor: string
  outlineThickness: number
  dotEnabled: boolean
  dotSize: number
  topEnabled: boolean
  bottomEnabled: boolean
  leftEnabled: boolean
  rightEnabled: boolean
  dynamicEnabled: boolean
  tStyleEnabled: boolean
  spread: number
}

export interface AppSettings {
  theme: 'dark' | 'darker' | 'midnight'
  accentColor: string
  minimizeToTray: boolean
  launchOnStartup: boolean
  autoDetectGames: boolean
  gameLibraryPaths: string[]
  currentVersion: string
  updateChannel: 'stable' | 'beta'
  lastUpdateCheck?: string
  overlayEnabled: boolean
  overlayHotkey: string
}

export type Page = 'library' | 'crosshair' | 'tools' | 'settings' | 'updates'

declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      quitApp: () => void
      launchGame: (path: string) => Promise<{ success: boolean; error?: string }>
      isElectron: boolean
    }
  }
}


