/**
 * Control Panel Component
 * Configuration settings for export and grid
 */
import React from 'react';
import { Download, FileVideo, Image as ImageIcon, Settings2, Film } from 'lucide-react';
import { cn } from '../utils/cn';

interface ControlPanelProps {
  isPlaying: boolean;
  fps: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onFpsChange: (fps: number) => void;
  onExportPng: () => void;
  onExportGif: () => void;
  onExportWebm: () => void;
  isExporting: boolean;
}

export function ControlPanel({
  fps,
  onFpsChange,
  onExportPng,
  onExportGif,
  onExportWebm,
  isExporting
}: ControlPanelProps) {
  return (
    <div className="space-y-4">
      
      {/* Settings Group */}
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-2">
            <Settings2 className="w-3 h-3" />
            Animation Settings
        </div>

        {/* Frame Rate Control */}
        <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-white/80 font-medium">Playback Speed</span>
                <span className="text-purple-600 dark:text-purple-300 font-mono bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-1.5 py-0.5 rounded text-[10px]">{fps} FPS</span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className="absolute inset-x-0 h-1 bg-slate-200 dark:bg-white/10 rounded-full" />
                <input 
                  type="range" 
                  className="w-full h-1 bg-transparent appearance-none cursor-pointer relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:dark:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125" 
                  value={fps}
                  onChange={(e) => onFpsChange(Number(e.target.value))}
                  min={1}
                  max={60}
                />
            </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-2">
        <button 
            onClick={onExportPng}
            disabled={isExporting}
            className="w-full group relative overflow-hidden py-3 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide shadow-lg dark:shadow-none"
        >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sprite Sheet</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onExportGif}
                disabled={isExporting}
                className="col-span-1 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide"
            >
                <ImageIcon className="w-3 h-3" />
                <span>Export GIF</span>
            </button>
            
            <button 
                onClick={onExportWebm}
                disabled={isExporting}
                className="col-span-1 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wide"
            >
                <Film className="w-3 h-3" />
                <span>Export WebM</span>
            </button>
        </div>
      </div>
    </div>
  );
}