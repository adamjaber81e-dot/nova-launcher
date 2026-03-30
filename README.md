# Nova Launcher

A gaming optimization desktop application built with Electron + React + Vite + Tailwind CSS v4.

## Features

- **Game Library** – Manage and launch games from Steam, Epic Games, Battle.net, and more
- **Crosshair Editor** – 15 pro player presets (CS2 + Fortnite), real-time canvas preview, full custom editor with HEX color picker
- **Tools & Optimization** – RAM cleaner, FPS advisor, ping test, system info — all using real hardware APIs
- **Updates** – GitHub Releases integration, per-release changelogs, one-click download
- **Settings** – Theme, game library paths, overlay hotkey, update channel, tray preferences

## Tech Stack

| Layer | Tech |
|---|---|
| App Shell | Electron 33 |
| UI Framework | React 18 + TypeScript |
| Build Tool | electron-vite |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist |
| Components | Radix UI primitives |

## Development

```bash
npm install
npm run dev
```

## Build Distributable

```bash
# Windows installer (.exe)
npm run dist:win

# macOS disk image (.dmg)
npm run dist:mac

# Linux AppImage + .deb
npm run dist:linux
```

Output goes to `release/`.

## Project Structure

```
nova-launcher-desktop/
├── electron/
│   ├── main.ts          # Main process: window, tray, IPC
│   └── preload.ts       # Context bridge (window.electronAPI)
├── src/
│   ├── components/
│   │   ├── TitleBar.tsx       # Frameless window controls
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── CrosshairCanvas.tsx # Canvas-based crosshair renderer
│   │   ├── HexColorPicker.tsx  # Full HSV color picker
│   │   └── ui/                # Radix UI components
│   ├── data/
│   │   ├── crosshairs.ts      # 15 pro player presets
│   │   └── games.ts           # Sample game data + helpers
│   ├── pages/
│   │   ├── LibraryPage.tsx
│   │   ├── CrosshairPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── UpdatesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── store/
│   │   └── useStore.ts        # Zustand state + persistence
│   └── types/
│       └── index.ts
├── resources/
│   └── icon.png               # App icon (replace with your icon)
├── electron.vite.config.ts
└── package.json
```

## GitHub Actions

Automated builds are configured in `.github/workflows/build.yml`. On every push to `main` and on tagged releases, it builds for Windows, macOS, and Linux and uploads artifacts.


