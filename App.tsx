import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { LibraryPage } from './pages/LibraryPage'
import { CrosshairPage } from './pages/CrosshairPage'
import { ToolsPage } from './pages/ToolsPage'
import { UpdatesPage } from './pages/UpdatesPage'
import { SettingsPage } from './pages/SettingsPage'
import { useStore } from './store/useStore'

const queryClient = new QueryClient()

function PageContent() {
  const { currentPage } = useStore()
  switch (currentPage) {
    case 'library': return <LibraryPage />
    case 'crosshair': return <CrosshairPage />
    case 'tools': return <ToolsPage />
    case 'updates': return <UpdatesPage />
    case 'settings': return <SettingsPage />
    default: return <LibraryPage />
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground select-none">
          <TitleBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <PageContent />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App


