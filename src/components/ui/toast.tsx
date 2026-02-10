'use client';

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { ToastContext, type Toast, type ToastType } from "@/hooks/use-toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2 rounded-md border p-4 shadow-lg min-w-[300px] animate-in slide-in-from-right duration-300",
              toast.type === 'success' && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
              toast.type === 'error' && "border-red-500/30 bg-red-500/10 text-red-400",
              toast.type === 'info' && "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
              toast.type === 'warning' && "border-amber-500/30 bg-amber-500/10 text-amber-400"
            )}
          >
            {toast.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {toast.type === 'info' && <Info className="h-4 w-4" />}
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-current opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
