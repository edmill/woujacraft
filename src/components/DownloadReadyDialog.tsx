/**
 * Download Ready Dialog
 * Displays a modal when a file is ready for download.
 * This ensures downloads work reliably by requiring a direct user click,
 * bypassing browser popup blockers that might trigger on long-running async tasks.
 */
import React from 'react';
import { Download, X, FileCheck, FileImage, FileType } from 'lucide-react';
import { cn } from '../utils/cn';

interface DownloadReadyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
  fileSize?: number; // in bytes
  type: 'png' | 'gif';
}

export function DownloadReadyDialog({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName, 
  fileSize,
  type 
}: DownloadReadyDialogProps) {
  if (!isOpen || !fileUrl) return null;

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02]">
          <h3 className="font-medium text-slate-900 dark:text-zinc-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            Export Ready
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4">
            {/* Preview Area - Replaces the icon */}
            <div className="relative group w-full aspect-video bg-slate-100 dark:bg-black/20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center">
              {/* Checkerboard background for transparency */}
              <div className="absolute inset-0 opacity-10 bg-[conic-gradient(#000_90deg,transparent_90deg)] dark:bg-[conic-gradient(#fff_90deg,transparent_90deg)] bg-[length:16px_16px]" />
              
              {fileUrl ? (
                <img 
                  src={fileUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain relative z-10"
                />
              ) : (
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center relative z-10",
                  type === 'png'
                    ? "text-cyan-400"
                    : "text-teal-400"
                )}>
                  {type === 'png' ? <FileImage className="w-8 h-8" /> : <FileType className="w-8 h-8" />}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center">
              <p className="font-medium text-slate-900 dark:text-zinc-200 truncate" title={fileName}>
                {fileName}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                {type.toUpperCase()} • {formatSize(fileSize)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => {
                if (!fileUrl) return;
                // Programmatic download to ensure it works reliably
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Close dialog after a delay
                setTimeout(onClose, 1000);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-cyan-600 dark:bg-cyan-600 hover:bg-cyan-700 dark:hover:bg-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
            
            <p className="text-[11px] text-center text-slate-500 dark:text-zinc-500 px-4 leading-relaxed">
              If the download doesn't start automatically, <span className="text-slate-700 dark:text-zinc-300 font-medium">right-click the preview image</span> above and select "Save Image As..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}