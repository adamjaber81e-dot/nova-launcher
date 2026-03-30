import * as ToastPrimitive from '@radix-ui/react-toast'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string; title?: string; description?: string; variant?: 'default' | 'destructive'
}

let externalAdd: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null

export function toast(msg: Omit<ToastMessage, 'id'>) {
  externalAdd?.(msg)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const add = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((p) => [...p, { ...msg, id }])
  }, [])

  externalAdd = add

  const remove = (id: string) => setToasts((p) => p.filter((t) => t.id !== id))

  return (
    <ToastPrimitive.Provider>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          onOpenChange={(open) => { if (!open) remove(t.id) }}
          className={cn(
            'fixed bottom-4 right-4 z-[100] flex items-start gap-3 rounded-xl border p-4 shadow-lg w-72 animate-in slide-in-from-right-full',
            t.variant === 'destructive' ? 'bg-destructive border-destructive/30 text-white' : 'bg-card border-card-border text-foreground'
          )}
        >
          <div className="flex-1 min-w-0">
            {t.title && <ToastPrimitive.Title className="text-sm font-semibold">{t.title}</ToastPrimitive.Title>}
            {t.description && <ToastPrimitive.Description className="text-xs text-muted-foreground mt-0.5">{t.description}</ToastPrimitive.Description>}
          </div>
          <ToastPrimitive.Close className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport/>
    </ToastPrimitive.Provider>
  )
}


