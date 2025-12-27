/**
 * Woujasnap Main Component
 * Fully responsive, linear progressive web app
 * Layout: Sheet View (Left) | Tools & Preview (Right)
 */
import React, { useState, useRef, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { SpriteGrid } from './components/SpriteGrid';
import { FrameTimeline } from './components/FrameTimeline';
import { PlaybackControls } from './components/PlaybackControls';
import { ControlPanel } from './components/ControlPanel';
import { PreviewPlayer } from './components/PreviewPlayer';
import { DownloadReadyDialog } from './components/DownloadReadyDialog';
import { FrameData } from './types';
import { extractFramesFromVideo, extractSpecificFrames } from './utils/videoUtils';
import { generateSpriteSheet, generateGif, generateWebM, downloadBlob } from './utils/exportUtils';
import { cn } from './utils/cn';
import { Camera, Sparkles, ChevronRight, Zap, LayoutGrid, Sliders, Moon, Sun, GripHorizontal } from 'lucide-react';

export function SpriteStabilizer() {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // State
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Selection State
  const [startIndex, setStartIndex] = useState(0);
  const WINDOW_SIZE = 25;
  
  // Refinement State
  const [seedFrameId, setSeedFrameId] = useState<string | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [downloadDialogState, setDownloadDialogState] = useState<{
    isOpen: boolean;
    url: string | null;
    fileName: string;
    fileSize: number;
    type: 'png' | 'gif';
  }>({
    isOpen: false,
    url: null,
    fileName: '',
    fileSize: 0,
    type: 'png'
  });
  
  // Resize State
  const [previewHeight, setPreviewHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  // Refs
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(0);

  // Derived State
  const safeFrames = Array.isArray(frames) ? frames : [];
  const selectedFrames = safeFrames.slice(startIndex, startIndex + WINDOW_SIZE);
  const hasContent = safeFrames.length > 0;
  
  // Get current frame for preview
  const currentPreviewFrame = selectedFrames[previewFrameIndex] || safeFrames[0];
  const currentTime = currentPreviewFrame?.timestamp || 0;
  const totalDuration = safeFrames[safeFrames.length - 1]?.timestamp || 0;

  // Handlers
  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await extractFramesFromVideo(file);
      // @ts-ignore
      const extractedFrames = Array.isArray(result) ? result : result.frames;
      
      if (Array.isArray(extractedFrames)) {
        setFrames(extractedFrames);
        setVideoFile(file);
        setStartIndex(0);
        if (extractedFrames.length > 0) {
          setSeedFrameId(extractedFrames[0].id);
        }
      } else {
        setFrames([]);
      }
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartIndexChange = (index: number) => {
    setStartIndex(index);
    setPreviewFrameIndex(0);
  };

  const handleSeedSelect = (id: string) => {
    setSeedFrameId(id);
    const indexInWindow = selectedFrames.findIndex(f => f.id === id);
    if (indexInWindow !== -1) {
        setPreviewFrameIndex(indexInWindow);
    }
  };

  const handleReset = () => {
    setFrames([]);
    setStartIndex(0);
    setSeedFrameId(null);
    setIsPlaying(false);
  };

  const handleExportPng = async () => {
    if (selectedFrames.length === 0) return;
    setIsExporting(true);
    try {
        let exportFrames: FrameData[] | string[] = selectedFrames;
        
        // If we have the original video file, re-extract high-quality frames
        if (videoFile) {
            try {
                // Extract frames at full resolution
                const timestamps = selectedFrames.map(f => f.timestamp);
                const highResUrls = await extractSpecificFrames(videoFile, timestamps);
                exportFrames = highResUrls;
                console.log(`[Export] Extracted ${highResUrls.length} high-res frames for export`);
            } catch (err) {
                console.warn("[Export] Failed to extract high-res frames, falling back to thumbnails", err);
            }
        }

        const blob = await generateSpriteSheet(exportFrames);
        const url = URL.createObjectURL(blob);
        setDownloadDialogState({
            isOpen: true,
            url,
            fileName: 'sprite-sheet.png',
            fileSize: blob.size,
            type: 'png'
        });
    } catch (error) {
        console.error("Export PNG failed", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleExportGif = async () => {
    if (selectedFrames.length === 0) return;
    setIsExporting(true);
    try {
        const blob = await generateGif(selectedFrames, fps);
        // Direct download for GIF as before, or we could use dialog too.
        // The user specifically mentioned "download sprite sheet dialog", so I'll keep GIF as direct download for now unless requested.
        // Actually, let's use the dialog for consistency if it supports GIF (it does).
        const url = URL.createObjectURL(blob);
        setDownloadDialogState({
            isOpen: true,
            url,
            fileName: 'animation.gif',
            fileSize: blob.size,
            type: 'gif'
        });
    } catch (error) {
        console.error("Export GIF failed", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleExportWebM = async () => {
    if (selectedFrames.length === 0) return;
    setIsExporting(true);
    try {
        const blob = await generateWebM(selectedFrames, fps);
        downloadBlob(blob, 'animation.webm');
    } catch (error) {
        console.error("Export WebM failed", error);
    } finally {
        setIsExporting(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Resize Handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = previewHeight;
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const deltaY = e.clientY - resizeStartY.current;
    const newHeight = Math.max(200, Math.min(800, resizeStartHeight.current + deltaY));
    setPreviewHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Resize Effect
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Playback Logic
  useEffect(() => {
    if (isPlaying && selectedFrames.length > 0) {
      playbackIntervalRef.current = setInterval(() => {
        setPreviewFrameIndex(prev => (prev + 1) % selectedFrames.length);
      }, 1000 / fps);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, fps, selectedFrames.length]);

  return (
    <div className={cn("h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300", theme === 'dark' ? 'dark' : '')}>
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white selection:bg-purple-500/30">
      
      {/* View: Upload State */}
      {!hasContent ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-screen mix-blend-multiply" />
                <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-screen mix-blend-multiply" />
            </div>

            <header className="relative z-50 p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                        <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-lg font-medium tracking-tight text-slate-900 dark:text-white/90">Woujasnap</span>
                </div>
                
                <div className="flex items-center gap-4">
                     <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-white/40 cursor-pointer relative z-50"
                     >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                     </button>
                     <span className="text-xs text-slate-400 dark:text-white/40 font-mono">v1.0.0-beta</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 -mt-20">
              <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center">
                 
                 {/* Title Section */}
                 <div className="mb-12 space-y-6 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-purple-600 dark:text-purple-300 mb-2 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Sparkles className="w-3 h-3" />
                        <span>AI-Powered Sprite Extraction</span>
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Pixel Perfect <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-300 dark:to-white">Animation</span>
                    </h2>
                    
                    <p className="text-slate-500 dark:text-white/50 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
                        Transform video footage into production-ready sprite sheets. Extract, refine, and export in seconds.
                    </p>
                 </div>
                 
                 {/* Upload Card */}
                 <div className="w-full relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                 </div>
                 
                 {/* Footer Info */}
                 <div className="mt-12 flex items-center gap-8 text-xs text-slate-400 dark:text-white/20 font-mono">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-3 h-3" />
                        <span>AUTO-GRID</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span>BG REMOVAL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sliders className="w-3 h-3" />
                        <span>FINE TUNING</span>
                    </div>
                 </div>
              </div>
            </main>
          </div>
      ) : (
        /* View: Workspace */
        <div className="flex flex-col h-full">
            {/* Top Bar */}
            <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-md shrink-0 z-50">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-500/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-600/30 transition-colors">
                        <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-display font-medium text-sm hidden sm:inline text-slate-900 dark:text-white/90">Woujasnap</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-mono text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        {frames.length} FRAMES
                    </div>
                    
                    <button 
                        onClick={toggleTheme}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-400 dark:text-white/40"
                    >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>

                    <button 
                        onClick={handleReset}
                        className="text-xs font-medium text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        New Project
                    </button>
                </div>
            </div>

            {/* Main Content Area - Split Pane */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                
                {/* LEFT: Sprite Sheet Grid (Fixed Grid View) */}
                <div className="lg:w-7/12 xl:w-8/12 p-4 lg:p-6 bg-slate-100 dark:bg-[#050505] flex flex-col h-[50vh] lg:h-full relative overflow-hidden order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/5 dark:from-purple-900/10 via-transparent to-transparent pointer-events-none" />
                    <SpriteGrid 
                        selectedFrames={selectedFrames}
                        seedFrameId={seedFrameId}
                        onSeedSelect={handleSeedSelect}
                    />
                </div>

                {/* RIGHT: Tools & Preview (Sidebar) */}
                <div className="lg:w-5/12 xl:w-4/12 bg-white dark:bg-[#0F0F0F] flex flex-col h-[50vh] lg:h-full overflow-y-auto z-10 order-1 lg:order-2 shadow-xl lg:shadow-none">
                    
                    {/* 1. Animation Preview (Dominant, Top) */}
                    <div
                        className="shrink-0 flex flex-col border-b border-slate-200 dark:border-white/5 relative bg-slate-50 dark:bg-[#0A0A0A]"
                        style={{ height: `${previewHeight}px` }}
                    >
                        <PreviewPlayer
                            currentFrame={currentPreviewFrame}
                        />
                    </div>

                    {/* Horizontal Resize Handle */}
                    <div
                        className="shrink-0 h-2 bg-slate-200 dark:bg-white/5 hover:bg-purple-500/30 dark:hover:bg-purple-500/30 transition-colors cursor-ns-resize relative group flex items-center justify-center"
                        onMouseDown={handleResizeStart}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <GripHorizontal className="w-4 h-4 text-slate-400 dark:text-white/40 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                        </div>
                    </div>

                    {/* 2. Controls & Timeline (Bottom, Auto Height) */}
                    <div className="shrink-0 p-5 bg-white dark:bg-[#0F0F0F] space-y-6 border-t border-slate-100 dark:border-white/5 relative z-20">
                        
                        {/* Playback Controls (NEW POSITION: Directly below preview) */}
                        <PlaybackControls 
                             isPlaying={isPlaying}
                             onTogglePlay={() => setIsPlaying(!isPlaying)}
                             onStepForward={() => setPreviewFrameIndex(p => (p + 1) % selectedFrames.length)}
                             onStepBack={() => setPreviewFrameIndex(p => (p - 1 + selectedFrames.length) % selectedFrames.length)}
                             currentTime={currentTime}
                             totalDuration={totalDuration}
                        />

                        {/* Timeline with Filmstrip */}
                        <FrameTimeline 
                            frames={safeFrames}
                            startIndex={startIndex}
                            windowSize={WINDOW_SIZE}
                            onStartIndexChange={handleStartIndexChange}
                            seedFrameId={seedFrameId}
                            onSeedSelect={handleSeedSelect}
                            playingFrameId={currentPreviewFrame?.id}
                        />

                        {/* Export & Settings */}
                        <ControlPanel 
                            isPlaying={isPlaying}
                            fps={fps}
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                            onStepForward={() => setPreviewFrameIndex(p => (p + 1) % selectedFrames.length)}
                            onStepBack={() => setPreviewFrameIndex(p => (p - 1 + selectedFrames.length) % selectedFrames.length)}
                            onFpsChange={setFps}
                            onExportPng={handleExportPng}
                            onExportGif={handleExportGif}
                            onExportWebm={handleExportWebM}
                            isExporting={isExporting}
                        />
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Dialogs */}
      <DownloadReadyDialog
        isOpen={downloadDialogState.isOpen}
        onClose={() => setDownloadDialogState(prev => ({ ...prev, isOpen: false }))}
        fileUrl={downloadDialogState.url}
        fileName={downloadDialogState.fileName}
        fileSize={downloadDialogState.fileSize}
        type={downloadDialogState.type}
      />
      
      </div>
    </div>
  );
}