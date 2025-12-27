/**
 * Upload Zone Component - Woujasnap Edition
 * Handles drag and drop for MP4 files with a polished, delightful UI
 */
import React, { useState, useRef } from 'react';
import { Upload, Film, Cpu, Zap, ArrowUp } from 'lucide-react';
import { cn } from '../utils/cn';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-[320px] transition-all cursor-pointer rounded-2xl overflow-hidden group bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-purple-400 dark:hover:border-purple-500/30 shadow-lg dark:shadow-none",
        isDragging 
          ? "border-purple-500 bg-purple-50 dark:bg-purple-500/5 ring-4 ring-purple-500/10" 
          : "hover:bg-white dark:hover:bg-[#151515]",
        isProcessing && "pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept="video/mp4,video/webm,video/mov" 
        className="hidden" 
      />
      
      {/* Grid Overlay inside card */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center w-full h-full relative z-10 animate-fade-in space-y-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-white/5" />
            <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
            <Cpu className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>

          <div className="text-center space-y-1 z-10">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">Processing Media</h3>
            <p className="text-xs text-slate-400 dark:text-white/40 font-mono">ANALYZING FRAMES...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 z-10 p-6 transition-transform duration-300 group-hover:scale-[1.02]">
          <div className="relative group/icon">
              <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-md dark:shadow-2xl relative z-10 group-hover/icon:border-purple-500/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-600 dark:text-white/80 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors" />
              </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
              Upload Video
            </h3>
            <p className="text-sm text-slate-500 dark:text-white/40 max-w-[200px] mx-auto leading-relaxed">
              Drag & drop or click to browse
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
             <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] text-slate-400 dark:text-white/30 font-mono">MP4</span>
             <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] text-slate-400 dark:text-white/30 font-mono">MOV</span>
             <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] text-slate-400 dark:text-white/30 font-mono">WEBM</span>
          </div>
        </div>
      )}
    </div>
  );
}