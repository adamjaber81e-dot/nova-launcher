import { Game } from '../types'

export const SAMPLE_GAMES: Game[] = [
  {
    id: 'cs2', name: 'Counter-Strike 2',
    path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe',
    genre: 'FPS', source: 'steam',
    lastPlayed: new Date(Date.now() - 3600000).toISOString(), playTime: 1240, isFavorite: true,
  },
  {
    id: 'fortnite', name: 'Fortnite',
    path: 'C:\\Program Files\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe',
    genre: 'Battle Royale', source: 'epic',
    lastPlayed: new Date(Date.now() - 86400000).toISOString(), playTime: 560, isFavorite: true,
  },
  {
    id: 'valorant', name: 'VALORANT',
    path: 'C:\\Riot Games\\VALORANT\\live\\VALORANT.exe',
    genre: 'FPS', source: 'unknown',
    lastPlayed: new Date(Date.now() - 172800000).toISOString(), playTime: 380,
  },
  {
    id: 'apex', name: 'Apex Legends',
    path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Apex Legends\\r5apex.exe',
    genre: 'Battle Royale', source: 'ea',
    lastPlayed: new Date(Date.now() - 604800000).toISOString(), playTime: 240,
  },
  {
    id: 'ow2', name: 'Overwatch 2',
    path: 'C:\\Program Files (x86)\\Overwatch\\_retail_\\Overwatch.exe',
    genre: 'FPS', source: 'battlenet',
    lastPlayed: new Date(Date.now() - 1209600000).toISOString(), playTime: 120,
  },
]

export function formatPlayTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getSourceLabel(source: Game['source']): string {
  const labels: Record<Game['source'], string> = {
    steam: 'Steam', epic: 'Epic Games', battlenet: 'Battle.net',
    ubisoft: 'Ubisoft Connect', ea: 'EA App', manual: 'Manual', unknown: 'Unknown',
  }
  return labels[source]
}

export function getSourceColor(source: Game['source']): string {
  const colors: Record<Game['source'], string> = {
    steam: '#66c0f4', epic: '#a0c4ff', battlenet: '#148eff',
    ubisoft: '#0070d1', ea: '#ff6b6b', manual: '#9ca3af', unknown: '#6b7280',
  }
  return colors[source]
}


