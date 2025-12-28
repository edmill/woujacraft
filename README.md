# Woujacraft

A professional-grade tool for stabilizing AI animation workflows. This component helps users extract frames from video footage, select a perfect looping window, and identify a "Seed Frame" to ground generative AI models.

## Features

- **Client-Side Extraction**: Processes MP4/WebM files directly in the browser using HTML5 Canvas API.
- **Timeline Curator**: A sliding window interface to select exactly 25 frames from any video length.
- **Stabilization Grid**: 5x5 layout to visualize the sprite sheet topology.
- **Ghost/Onion Skinning**: Compare your seed frame against the animation in real-time to detect "slop" or jitter.
- **Production Preview**: 24fps playback engine with variable speed control.

## Usage

```tsx
import { Woujacraft } from '@/sd-components/4e50f23e-0241-48f9-848f-414c0119e70a';

function App() {
  return <Woujacraft />;
}
```

## Props

The component is currently self-contained and manages its own state for the file upload workflow. Future versions may accept `initialFile` or `onExport` callbacks.
