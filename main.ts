import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const iconPath = join(__dirname, '../../resources/icon.png')

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    ...(existsSync(iconPath) ? { icon: iconPath } : {})
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow!.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  try {
    const icon = existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
      : nativeImage.createEmpty()

    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Nova Launcher',
        click: () => { mainWindow?.show(); mainWindow?.focus() }
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.exit(0) }
    ])

    tray.setToolTip('Nova Launcher')
    tray.setContextMenu(contextMenu)
    tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus() })
  } catch (err) {
    console.warn('Tray creation failed (icon may be missing):', err)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.novalauncher.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('window-minimize', () => mainWindow?.minimize())
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window-close', () => mainWindow?.hide())
  ipcMain.on('window-quit', () => app.exit(0))

  ipcMain.handle('launch-game', async (_event, gamePath: string) => {
    const { spawn } = await import('child_process')
    try {
      spawn(gamePath, [], { detached: true, stdio: 'ignore' }).unref()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  createWindow()
  createTray()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


