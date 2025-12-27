/**
 * Utilities for client-side video frame extraction
 * Uses HTML5 Video API and Canvas to capture frames
 */
import { FrameData, VideoMetadata } from '../types';

export const VIDEO_FPS_ESTIMATE = 24; // Assume 24fps for extraction steps
export const MAX_FRAMES_TO_EXTRACT = 300; // Cap to prevent crashing browser

/**
 * Extract frames from a video file
 */
export async function extractFramesFromVideo(
  videoFile: File, 
  onProgress?: (progress: number) => void
): Promise<{ frames: FrameData[], metadata: VideoMetadata }> {
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous'; // Good practice even for local blobs sometimes
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Calculate step to get frames at roughly 10-12fps for UI selection
      // We don't need EVERY frame for the UI timeline, but let's try to get a good amount
      // If video is long, we downsample. If short (<10s), we get more fidelity.
      
      let step = 1 / 12; // Default 12fps extraction
      if (duration > 30) step = 1; // 1fps for long videos
      else if (duration < 5) step = 1 / 24; // Full fidelity for short clips
      
      const frames: FrameData[] = [];
      const canvas = document.createElement('canvas');
      canvas.width = width / 4; // Downscale for UI performance (thumbnail quality)
      canvas.height = height / 4;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      let currentTime = 0;
      let index = 0;
      
      const processFrame = async () => {
        if (currentTime >= duration || frames.length >= MAX_FRAMES_TO_EXTRACT) {
          URL.revokeObjectURL(url);
          resolve({
            frames,
            metadata: { duration, width, height, totalFramesApprox: frames.length }
          });
          return;
        }
        
        // Seek
        video.currentTime = currentTime;
      };
      
      video.onseeked = () => {
        // Draw
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        frames.push({
          id: `frame-${index}`,
          url: canvas.toDataURL('image/jpeg', 0.7),
          timestamp: currentTime,
          index: index
        });
        
        // Update progress
        if (onProgress) {
          onProgress(Math.min(currentTime / duration, 1));
        }
        
        // Next frame
        currentTime += step;
        index++;
        processFrame();
      };
      
      video.onerror = (e) => {
        reject(new Error('Video processing error'));
      };
      
      // Start processing
      processFrame();
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Extract specific frames by timestamps at full resolution
 * Used for high-quality export
 */
export async function extractSpecificFrames(
  videoFile: File,
  timestamps: number[]
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    
    video.onloadedmetadata = async () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      const canvas = document.createElement('canvas');
      canvas.width = width; // Full resolution
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const frames: string[] = [];
      let index = 0;
      
      const processNextFrame = () => {
        if (index >= timestamps.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        
        video.currentTime = timestamps[index];
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, width, height);
        frames.push(canvas.toDataURL('image/png')); // PNG for lossless quality during export processing
        index++;
        processNextFrame();
      };
      
      video.onerror = () => {
        reject(new Error('Video processing error during export'));
      };
      
      // Start
      processNextFrame();
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video for export'));
    };
  });
}
