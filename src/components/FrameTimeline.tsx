/**
 * Frame Timeline Component
 * - Full horizontal filmstrip showing ALL frames
 * - Translucent range selector overlay on top of thumbnails
 */
import React, { useRef } from 'react';
import { FrameData } from '../types';
import { cn } from '../utils/cn';

interface FrameTimelineProps {
  frames: FrameData[];
  startIndex: number;
  windowSize: number;
  onStartIndexChange: (index: number) => void;
  seedFrameId: string | null;
  onSeedSelect: (id: string) => void;
  playingFrameId?: string;
}

export function FrameTimeline({ 
  frames, 
  startIndex, 
  windowSize, 
  onStartIndexChange,
  seedFrameId,
  onSeedSelect,
  playingFrameId,
}: FrameTimelineProps) {
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    onStartIndexChange(newVal);
  };

  const totalFrames = frames.length;
  const maxIndex = Math.max(0, totalFrames - windowSize);
  const endIndex = Math.min(startIndex + windowSize, totalFrames);
  const selectedFrames = frames.slice(startIndex, endIndex);

  // Calculate selector position and width as percentages
  const selectorLeft = totalFrames > 0 ? (startIndex / totalFrames) * 100 : 0;
  const selectorWidth = totalFrames > 0 ? (windowSize / totalFrames) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 w-full">
        
        {/* SECTION 1: Full Horizontal Filmstrip with Range Selector Overlay */}
        <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Timeline Navigator</span>
                <span className="text-[10px] text-slate-400 dark:text-muted-foreground/40 font-mono uppercase tracking-widest">
                    {startIndex + 1} - {endIndex} / {totalFrames}
                </span>
            </div>

            <div 
                className="relative h-12 w-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden select-none"
                ref={sliderRef}
            >
                {/* Background: Full Horizontal Filmstrip */}
                <div className="absolute inset-0 flex w-full h-full opacity-50">
                    {frames.length > 0 ? (
                        frames.map((frame) => (
                            <div 
                                key={frame.id} 
                                className="flex-1 h-full relative min-w-[1px]"
                            >
                                <img 
                                    src={frame.url} 
                                    className="w-full h-full object-cover grayscale opacity-50" 
                                    alt="" 
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600 text-[10px]">
                            Timeline Empty
                        </div>
                    )}
                </div>

                {/* Overlay: Range Selector Box */}
                <div 
                    className="absolute top-0 bottom-0 border-2 border-purple-500 dark:border-white z-20 bg-white/10 backdrop-brightness-150"
                    style={{
                        left: `${selectorLeft}%`,
                        width: `${selectorWidth}%`
                    }}
                >
                     {/* Handles */}
                     <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-500 dark:bg-white rounded-full shadow-sm" />
                     <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-500 dark:bg-white rounded-full shadow-sm" />
                </div>

                {/* Invisible Range Input for Interaction */}
                <input 
                    type="range"
                    min={0}
                    max={maxIndex}
                    value={startIndex}
                    onChange={handleRangeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0 appearance-none"
                />
            </div>
            
            <div className="flex justify-center">
                <p className="text-[10px] text-slate-400 dark:text-white/30 text-center max-w-xs leading-relaxed">
                    Drag selector to adjust window
                </p>
            </div>
        </div>

        {/* SECTION 2: Active Window (Detailed Filmstrip) */}
        <div className="space-y-1 mt-2">
            <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Active Frames</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-white/30">
                    {selectedFrames.length} Frames
                </span>
            </div>
            
            <div className="relative h-16 w-full bg-slate-100 dark:bg-[#0A0A0A] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center">
                {selectedFrames.length > 0 ? (
                    <div className="flex h-full w-full">
                        {selectedFrames.map((frame) => (
                            <button
                                key={frame.id}
                                onClick={() => onSeedSelect(frame.id)}
                                className={cn(
                                    "flex-1 h-full min-w-[1px] relative group overflow-hidden transition-all border-r border-slate-200 dark:border-white/5 last:border-0",
                                    frame.id === seedFrameId 
                                        ? "opacity-100 z-10" 
                                        : "opacity-60 hover:opacity-100",
                                )}
                                title={`Frame ${frame.index}`}
                            >
                                <img 
                                    src={frame.url} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                                
                                {/* Selected Indicator Frame */}
                                {frame.id === seedFrameId && (
                                    <div className="absolute inset-0 border-2 border-purple-500 dark:border-white z-20 pointer-events-none" />
                                )}

                                {/* Playhead Indicator */}
                                {frame.id === playingFrameId && (
                                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 z-30" />
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-400 dark:text-white/20 italic">
                        No frames loaded
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}