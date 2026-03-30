import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, CrosshairPreset, AppSettings, Page } from '../types'
import { CROSSHAIR_PRESETS } from '../data/crosshairs'

interface NovaStore {
  currentPage: Page
  games: Game[]
  crosshairPresets: CrosshairPreset[]
  activeCrosshair: CrosshairPreset | null
  customCrosshair: CrosshairPreset
  settings: AppSettings
  scanningGames: boolean
  isOverlayVisible: boolean
  setPage: (page: Page) => void
  addGame: (game: Game) => void
  removeGame: (id: string) => void
  toggleFavorite: (id: string) => void
  launchGame: (id: string) => void
  scanGames: () => Promise<void>
  setActiveCrosshair: (preset: CrosshairPreset) => void
  updateCustomCrosshair: (updates: Partial<CrosshairPreset>) => void
  saveCustomCrosshair: () => void
  updateSettings: (updates: Partial<AppSettings>) => void
  toggleOverlay: () => void
}

const DEFAULT_CUSTOM_CROSSHAIR: CrosshairPreset = {
  id: 'custom', name: 'Custom', player: 'Custom', game: 'cs2',
  color: '#00FF00', style: 'classic', size: 3, thickness: 1, gap: -2, opacity: 255,
  outlineEnabled: true, outlineColor: '#000000', outlineThickness: 1,
  dotEnabled: false, dotSize: 2, topEnabled: true, bottomEnabled: true,
  leftEnabled: true, rightEnabled: true, dynamicEnabled: false, tStyleEnabled: false, spread: 0,
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark', accentColor: '#3b82f6', minimizeToTray: true, launchOnStartup: false,
  autoDetectGames: true,
  gameLibraryPaths: [
    'C:\\Program Files (x86)\\Steam\\steamapps\\common',
    'C:\\Program Files\\Epic Games',
  ],
  currentVersion: '1.0.5', updateChannel: 'stable', overlayEnabled: false, overlayHotkey: 'F8',
}

export const useStore = create<NovaStore>()(
  persist(
    (set, get) => ({
      currentPage: 'library',
      games: [],
      crosshairPresets: CROSSHAIR_PRESETS,
      activeCrosshair: CROSSHAIR_PRESETS[0],
      customCrosshair: DEFAULT_CUSTOM_CROSSHAIR,
      settings: DEFAULT_SETTINGS,
      scanningGames: false,
      isOverlayVisible: false,

      setPage: (page) => set({ currentPage: page }),
      addGame: (game) => set((state) => ({ games: [...state.games, game] })),
      removeGame: (id) => set((state) => ({ games: state.games.filter((g) => g.id !== id) })),
      toggleFavorite: (id) => set((state) => ({
        games: state.games.map((g) => g.id === id ? { ...g, isFavorite: !g.isFavorite } : g),
      })),
      launchGame: (id) => {
        const game = get().games.find((g) => g.id === id)
        if (!game) return
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id ? { ...g, isRunning: true, lastPlayed: new Date().toISOString() } : g
          ),
        }))
        if (window.electronAPI) {
          window.electronAPI.launchGame(game.path).finally(() => {
            setTimeout(() => {
              set((state) => ({
                games: state.games.map((g) => g.id === id ? { ...g, isRunning: false } : g),
              }))
            }, 3000)
          })
        } else {
          setTimeout(() => {
            set((state) => ({
              games: state.games.map((g) => g.id === id ? { ...g, isRunning: false } : g),
            }))
          }, 3000)
        }
      },
      scanGames: async () => {
        set({ scanningGames: true })
        await new Promise((r) => setTimeout(r, 2000))
        set({ scanningGames: false })
      },
      setActiveCrosshair: (preset) => set({ activeCrosshair: preset }),
      updateCustomCrosshair: (updates) =>
        set((state) => ({ customCrosshair: { ...state.customCrosshair, ...updates } })),
      saveCustomCrosshair: () => {
        const { customCrosshair, crosshairPresets } = get()
        const exists = crosshairPresets.find((p) => p.id === 'custom')
        if (exists) {
          set((state) => ({
            crosshairPresets: state.crosshairPresets.map((p) => p.id === 'custom' ? customCrosshair : p),
          }))
        } else {
          set((state) => ({ crosshairPresets: [...state.crosshairPresets, customCrosshair] }))
        }
      },
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      toggleOverlay: () => set((state) => ({ isOverlayVisible: !state.isOverlayVisible })),
    }),
    {
      name: 'nova-launcher-storage',
      partialize: (state) => ({
        games: state.games,
        activeCrosshair: state.activeCrosshair,
        customCrosshair: state.customCrosshair,
        settings: state.settings,
      }),
    }
  )
)


