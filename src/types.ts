/**
 * Shared types for the Sprite Stabilizer application
 */

export interface FrameData {
  id: string;
  url: string; // Data URL of the image
  timestamp: number; // Time in seconds in the video
  index: number; // Original index in the extracted sequence
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  totalFramesApprox: number;
}

export type SelectionState = {
  startFrameIndex: number; // Index in the full extracted list
  length: number; // 25
};

export type ViewMode = 'upload' | 'editor';
