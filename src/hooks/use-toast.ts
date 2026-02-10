import * as React from "react"

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
