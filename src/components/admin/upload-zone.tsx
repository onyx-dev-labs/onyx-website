'use client';

import * as React from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatBytes } from "@/lib/utils/format"

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  currentImage?: string | null;
  className?: string;
}

export function UploadZone({ onFileSelect, currentImage, className }: UploadZoneProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Only image files are allowed");
        return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor="image-upload" className="text-sm font-medium text-slate-400">
        Cover Image
      </label>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          dragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-slate-700 bg-navy-900/30 hover:bg-navy-900/50",
            (selectedFile || currentImage) ? "border-solid border-slate-600" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {selectedFile ? (
            <div className="flex items-center gap-4 w-full">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-cyan-500/20 text-cyan-500">
                    <FileIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-slate-200">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)}</p>
                </div>
                <button 
                    onClick={clearFile}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        ) : currentImage ? (
            <div className="flex items-center gap-4 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImage} alt="Current" className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Current Image</p>
                    <p className="text-xs text-slate-500 truncate">{currentImage}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-cyan-500">Click to replace</span>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                    <Upload className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                        SVG, PNG, JPG or GIF (max. 2MB)
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
