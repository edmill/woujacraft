/**
 * Sprite Grid Component
 * Displays frames in a grid that auto-scales to fit the viewport
 * No scrolling required - fits content perfectly
 */
import React, { useEffect } from 'react';
import { FrameData } from '../types';
import { cn } from '../utils/cn';

interface SpriteGridProps {
  selectedFrames: FrameData[];
  seedFrameId: string | null;
  onSeedSelect: (id: string) => void;
}

export function SpriteGrid({ selectedFrames, seedFrameId, onSeedSelect }: SpriteGridProps) {
  
  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!seedFrameId || selectedFrames.length === 0) return;
        
        const currentIndex = selectedFrames.findIndex(f => f.id === seedFrameId);
        if (currentIndex === -1) return;

        if (e.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % selectedFrames.length;
            onSeedSelect(selectedFrames[nextIndex].id);
        } else if (e.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + selectedFrames.length) % selectedFrames.length;
            onSeedSelect(selectedFrames[prevIndex].id);
        } else if (e.key === 'ArrowDown') {
             // Move 5 frames forward (visually down in 5-col grid)
             const nextIndex = (currentIndex + 5) % selectedFrames.length;
             onSeedSelect(selectedFrames[nextIndex].id);
        } else if (e.key === 'ArrowUp') {
             // Move 5 frames back
             const prevIndex = (currentIndex - 5 + selectedFrames.length) % selectedFrames.length;
             onSeedSelect(selectedFrames[prevIndex].id);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seedFrameId, selectedFrames, onSeedSelect]);

  if (selectedFrames.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 dark:text-muted-foreground bg-white/50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <p className="text-lg font-light">No frames selected</p>
      </div>
    );
  }

  // Calculate grid dimensions
  // For a 5x5 grid, we want to force it to fit
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(5, 1fr)',
    gap: '0.5rem', // gap-2
  };

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-md">
        <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-black/40 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/70">Source Sheet</h3>
            <span className="text-[10px] text-slate-400 dark:text-white/50 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                Navigate with Arrows
            </span>
        </div>
        
        {/* Container that forces content to fit without scrolling */}
        <div className="flex-1 p-4 w-full h-full min-h-0 overflow-hidden">
            <div className="w-full h-full" style={gridStyle}>
                {selectedFrames.map((frame, idx) => {
                    const isSelected = frame.id === seedFrameId;
                    return (
                        <div 
                            key={frame.id}
                            onClick={() => onSeedSelect(frame.id)}
                            className={cn(
                                "rounded-lg overflow-hidden relative cursor-pointer transition-all duration-150 group border border-transparent",
                                isSelected
                                    ? "ring-2 ring-cyan-500 dark:ring-primary ring-offset-2 ring-offset-white dark:ring-offset-black z-10 bg-white dark:bg-white/5 shadow-xl scale-[1.02]" 
                                    : "hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10"
                            )}
                        >
                            {/* Checkerboard bg for transparency check */}
                            <div className="absolute inset-0 opacity-10 bg-[conic-gradient(#000_90deg,transparent_90deg)] dark:bg-[conic-gradient(#fff_90deg,transparent_90deg)] bg-[length:8px_8px]" />
                            
                            {/* The Image - Scaled to fit container completely */}
                            <div className="w-full h-full p-1 flex items-center justify-center">
                                <img 
                                    src={frame.url} 
                                    alt={`Frame ${frame.index}`}
                                    className="max-w-full max-h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                            
                            {/* Index Label */}
                            <div className={cn(
                                "absolute bottom-1 right-1 text-[8px] font-mono px-1 rounded transition-opacity",
                                isSelected
                                    ? "bg-cyan-500 dark:bg-primary text-white opacity-100 font-bold" 
                                    : "bg-white/80 dark:bg-black/60 text-slate-600 dark:text-white/50 opacity-0 group-hover:opacity-100"
                            )}>
                                {idx + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}