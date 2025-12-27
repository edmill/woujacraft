/**
 * Preview Player Component
 * Compact animation preview with zoom and background controls
 * Includes client-side background removal (transparency simulation)
 * Playback controls are now in FrameTimeline component
 */
import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, Grid, Wand2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { FrameData } from '../types';

interface PreviewPlayerProps {
  currentFrame?: FrameData;
}

export function PreviewPlayer({ 
  currentFrame,
}: PreviewPlayerProps) {
  
  const [zoom, setZoom] = useState<1 | 2 | 5>(1);
  const [showSolidBackground, setShowSolidBackground] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background removal effect
  useEffect(() => {
    if (!currentFrame || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentFrame.url;
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        if (removeBackground) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const r0 = data[0], g0 = data[1], b0 = data[2]; // Sample top-left pixel
            
            // Increased tolerance for better edge cleaning (was 30)
            const tolerance = 60; 

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Euclidean distance for more accurate color matching
                const distance = Math.sqrt(
                    Math.pow(r - r0, 2) + 
                    Math.pow(g - g0, 2) + 
                    Math.pow(b - b0, 2)
                );
                
                if (distance < tolerance) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
    };
  }, [currentFrame, removeBackground]);


  return (
    <div className="flex flex-col gap-4 h-full animate-fade-in p-5">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 rounded-lg p-0.5 border border-slate-200 dark:border-white/5 backdrop-blur-md">
              <button 
                onClick={() => setZoom(1)}
                className={cn("px-3 py-1 text-[10px] font-medium rounded-md transition-all", zoom === 1 ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white")}
              >
                  1x
              </button>
              <button 
                onClick={() => setZoom(2)}
                className={cn("px-3 py-1 text-[10px] font-medium rounded-md transition-all", zoom === 2 ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white")}
              >
                  2x
              </button>
              <button 
                onClick={() => setZoom(5)}
                className={cn("px-3 py-1 text-[10px] font-medium rounded-md transition-all", zoom === 5 ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white")}
              >
                  5x
              </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setRemoveBackground(!removeBackground)}
                className={cn(
                    "h-7 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-[10px] font-medium tracking-wide",
                    removeBackground 
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                )}
                title="Auto-remove background (Magic Wand)"
            >
                <Wand2 className="w-3 h-3" />
                <span>MAGIC WAND</span>
            </button>

            <button 
                onClick={() => setShowSolidBackground(!showSolidBackground)}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-lg border transition-all",
                    showSolidBackground 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white" 
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                )}
                title="Toggle Solid/Grid Background"
            >
                <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
      </div>

      {/* Main Preview Area - NO PLAYBACK CONTROLS HERE */}
      <div className="flex-1 bg-white dark:bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#050505] rounded-xl border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-center min-h-[200px] shadow-sm dark:shadow-2xl group">
        
        {/* Transparency Grid (Always visible underneath) */}
        <div className="absolute inset-0 opacity-10 bg-[conic-gradient(#000_90deg,transparent_90deg)] dark:bg-[conic-gradient(#fff_90deg,transparent_90deg)] bg-[length:16px_16px]" />
        
        {/* Solid Background Toggle */}
        {showSolidBackground && (
            <div className="absolute inset-0 bg-slate-200 dark:bg-[#1A1A1A] z-0" />
        )}

        {/* Canvas or Image Preview */}
        {currentFrame && (
          <div 
            className="relative z-10" 
            style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                imageRendering: 'pixelated',
                transition: 'transform 0.2s ease-out'
            }}
          >
              {removeBackground ? (
                  <canvas ref={canvasRef} className="max-w-full max-h-full" style={{ imageRendering: 'pixelated' }} />
              ) : (
                  <img 
                      src={currentFrame.url} 
                      alt="Current Frame"
                      className="max-w-full max-h-full"
                      style={{ imageRendering: 'pixelated' }}
                  />
              )}
          </div>
        )}
      </div>
    </div>
  );
}