import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  quitApp: () => ipcRenderer.send('window-quit'),
  launchGame: (gamePath: string) => ipcRenderer.invoke('launch-game', gamePath),
  isElectron: true
})


