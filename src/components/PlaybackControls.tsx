/**
 * Playback Controls Component
 * - Time display
 * - Transport controls (Play/Pause, Step)
 * - Placed directly below preview
 */
import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '../utils/cn';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  currentTime: number;
  totalDuration: number;
}

export function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBack,
  currentTime,
  totalDuration
}: PlaybackControlsProps) {
  
  // Format time as MM:SS:MS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2 w-full border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        {/* Time Display - Above Controls */}
        <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-medium text-slate-700 dark:text-white tabular-nums tracking-tight">
                {formatTime(currentTime)}
            </span>
            <span className="text-slate-400 dark:text-white/20 text-sm font-medium">/</span>
            <span className="font-mono text-sm text-slate-400 dark:text-white/40 tabular-nums">
                {formatTime(totalDuration)}
            </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-6">
            <button 
                onClick={onStepBack} 
                className="group p-2 rounded-full text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                title="Previous Frame"
            >
                <SkipBack className="w-5 h-5 fill-current group-active:scale-95 transition-transform" />
            </button>
            
            <button 
                onClick={onTogglePlay}
                className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg hover:scale-105 active:scale-95",
                    isPlaying
                        ? "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200"
                        : "bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-cyan-500/25"
                )}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
            </button>
            
            <button 
                onClick={onStepForward} 
                className="group p-2 rounded-full text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                title="Next Frame"
            >
                <SkipForward className="w-5 h-5 fill-current group-active:scale-95 transition-transform" />
            </button>
        </div>
    </div>
  );
}