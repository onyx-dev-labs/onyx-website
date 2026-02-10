'use client';

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Button } from "./button"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg border border-slate-800 bg-navy-900 p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-bold text-white font-mono">{title}</h2>}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
