/**
 * Export Utilities
 * Handles generation of Sprite Sheets (PNG), Animated GIFs, and WebM video
 */
import { FrameData } from '../types';
import { encode } from 'modern-gif';

/**
 * Helper to load an image from a URL
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin if not a data URL to avoid tainting issues unnecessarily
    if (!url.startsWith('data:')) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = url;
  });
};

/**
 * Generate a Sprite Sheet PNG from frames
 * Arranges frames in a grid (default 5x5 for 25 frames)
 * Auto-scales down if dimensions exceed safety limits (8192px)
 */
export async function generateSpriteSheet(
  frames: FrameData[] | string[], 
  columns: number = 5
): Promise<Blob> {
  if (frames.length === 0) throw new Error("No frames to export");
  
  console.log(`[Export] Generating sprite sheet for ${frames.length} frames`);

  try {
    // Helper to get URL from frame item
    const getUrl = (item: FrameData | string) => typeof item === 'string' ? item : item.url;

    // Load first frame to get dimensions
    const firstImage = await loadImage(getUrl(frames[0]));
    let width = firstImage.width;
    let height = firstImage.height;
    
    // Calculate total dimensions
    const rows = Math.ceil(frames.length / columns);
    const totalWidth = width * columns;
    const totalHeight = height * rows;
    
    // Safety check for texture limits (common max is 8192 or 16384)
    // We limit to 8192 to ensure compatibility and prevent browser crashes
    const MAX_DIMENSION = 8192;
    // Target dimension for high-quality export (requested 2800x2800 for 5x5)
    const TARGET_MIN_DIMENSION = 2800;
    
    let scale = 1;
    
    // Scale Logic:
    // 1. If too big (> MAX), scale down
    // 2. If too small (< TARGET) and we have room, scale up (for high-res export)
    
    if (totalWidth > MAX_DIMENSION || totalHeight > MAX_DIMENSION) {
      const scaleW = MAX_DIMENSION / totalWidth;
      const scaleH = MAX_DIMENSION / totalHeight;
      scale = Math.min(scaleW, scaleH);
      console.warn(`[Export] Sprite sheet too large, scaling down by ${scale.toFixed(2)}`);
    } else if (totalWidth < TARGET_MIN_DIMENSION && totalHeight < TARGET_MIN_DIMENSION) {
      // Check if we should scale up to match target resolution
      // Only scale up if it doesn't exceed MAX_DIMENSION
      const scaleW = TARGET_MIN_DIMENSION / totalWidth;
      const scaleH = TARGET_MIN_DIMENSION / totalHeight;
      // Use the smaller scale to ensure we fit within target (or larger to fill?) 
      // User asked for "resolution to be 2800x2800", so let's try to hit that width at least
      const potentialScale = Math.min(scaleW, scaleH);
      
      // Ensure scaling up doesn't exceed MAX
      if (totalWidth * potentialScale <= MAX_DIMENSION && totalHeight * potentialScale <= MAX_DIMENSION) {
         scale = potentialScale;
         console.log(`[Export] Upscaling sprite sheet to target resolution (x${scale.toFixed(2)})`);
      }
    }
    
    // Update dimensions with scale
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
    
    const canvas = document.createElement('canvas');
    canvas.width = width * columns;
    canvas.height = height * rows;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Could not create canvas context - browser might be out of memory");
    
    // CRITICAL: Disable smoothing for pixel art upscaling
    ctx.imageSmoothingEnabled = false;
    
    // Draw all frames
    for (let i = 0; i < frames.length; i++) {
      const img = await loadImage(getUrl(frames[i]));
      const x = (i % columns) * width;
      const y = Math.floor(i / columns) * height;
      
      if (scale < 1) {
        // Draw scaled
        ctx.drawImage(img, x, y, width, height);
      } else {
        // Draw exact
        ctx.drawImage(img, x, y);
      }
    }
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`[Export] Sprite sheet generated successfully: ${canvas.width}x${canvas.height}`);
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error("[Export] Sprite sheet generation failed:", err);
    throw err;
  }
}

/**
 * Generate an Animated GIF from frames
 * Uses modern-gif for client-side encoding
 */
export const generateGif = async (
  frames: FrameData[],
  fps: number = 24
): Promise<Blob> => {
  if (frames.length === 0) throw new Error("No frames to export");

  console.log(`[Export] Generating GIF for ${frames.length} frames at ${fps} fps`);

  try {
    // Load first frame for dimensions
    const firstImage = await loadImage(frames[0].url);
    const width = firstImage.width;
    const height = firstImage.height;
    const delay = Math.round(1000 / fps); // Delay in ms, rounded for GIF format

    console.log(`[Export] GIF dimensions: ${width}x${height}, delay: ${delay}ms`);

    // Load all images first
    const images = await Promise.all(frames.map(f => loadImage(f.url)));
    console.log(`[Export] Loaded ${images.length} images for GIF encoding`);

    // Create a reusable canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error("Could not get canvas context");

    // Prepare frames for modern-gif
    console.log(`[Export] Preparing frames for GIF encoding...`);
    const gifFrames = images.map((img, index) => {
      // Clear and draw frame
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Get ImageData
      const imageData = ctx.getImageData(0, 0, width, height);

      if (index === 0) {
        console.log(`[Export] First frame data size: ${imageData.data.length} bytes`);
      }

      return {
        imageData: imageData,
        delay: delay
      };
    });

    // Encode GIF
    console.log(`[Export] Encoding GIF with ${gifFrames.length} frames...`);
    const blob = await encode({
      width,
      height,
      frames: gifFrames
    });

    console.log(`[Export] GIF generated successfully: ${blob.size} bytes`);
    return blob;
  } catch (err) {
    console.error("[Export] GIF encoding error:", err);
    throw new Error(`Failed to encode GIF: ${err instanceof Error ? err.message : String(err)}`);
  }
};

/**
 * Generate a WebM video from frames
 * Uses MediaRecorder with proper timing to ensure all frames are captured
 */
export const generateWebM = async (
  frames: FrameData[],
  fps: number = 24
): Promise<Blob> => {
  if (frames.length === 0) throw new Error("No frames to export");

  console.log(`[Export] Generating WebM for ${frames.length} frames at ${fps} fps`);

  const firstImage = await loadImage(frames[0].url);
  const width = firstImage.width;
  const height = firstImage.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  // Load all images first
  const images = await Promise.all(frames.map(f => loadImage(f.url)));
  console.log(`[Export] Loaded ${images.length} images for WebM encoding`);

  // Determine supported codec
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }
  console.log(`[Export] Using codec: ${mimeType}`);

  // Capture stream at desired framerate
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5000000 // 5 Mbps for good quality
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      recorder.stop();
      reject(new Error("WebM recording timeout"));
    }, (frames.length / fps) * 1000 + 5000); // Add 5s buffer

    recorder.onerror = (e) => {
      clearTimeout(timeout);
      console.error("[Export] MediaRecorder error:", e);
      reject(new Error("MediaRecorder failed"));
    };

    recorder.onstop = () => {
      clearTimeout(timeout);
      const blob = new Blob(chunks, { type: 'video/webm' });
      console.log(`[Export] WebM generated: ${blob.size} bytes`);
      resolve(blob);
    };

    // Start recording
    recorder.start();

    let frameIndex = 0;
    const frameDuration = 1000 / fps;

    // Draw frames with proper timing
    const drawNextFrame = () => {
      if (frameIndex >= images.length) {
        // Wait a bit before stopping to ensure last frame is captured
        setTimeout(() => {
          recorder.stop();
        }, frameDuration * 2);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(images[frameIndex], 0, 0, width, height);
      frameIndex++;

      setTimeout(drawNextFrame, frameDuration);
    };

    // Start drawing frames
    drawNextFrame();
  });
};

/**
 * Trigger a browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}