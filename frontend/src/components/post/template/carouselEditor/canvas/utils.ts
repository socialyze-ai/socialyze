// Utility functions for Canvas component

// Base box size in pixels (converted from mm)
// Using an approximate conversion of 1mm ≈ 3.78px for screen display
export const BOX_SIZE_MM = 50; // Base box size in mm
export const PX_PER_MM = 3.78; // Approximate conversion factor
export const BOX_SIZE_PX = BOX_SIZE_MM * PX_PER_MM; // Base box size in pixels

// Cache for text dimension calculations
const dimensionsCache = new Map<string, { width: number; height: number }>();

// Calculate aspect ratio dimensions
export const getAspectRatioStyle = (aspectRatio: string, canvasCount: number) => {
  // Calculate the base width based on box count
  const baseWidth = BOX_SIZE_PX * canvasCount;

  switch (aspectRatio) {
    case "1:1": {
      // For 1:1, height equals width for a single box
      // Width increases with box count, height remains constant at BOX_SIZE_PX
      return {
        width: `${baseWidth}px`,
        height: `${BOX_SIZE_PX}px`,
      };
    }
    case "16:9": {
      // For 16:9, height is calculated based on aspect ratio
      // Height adjusts based on the ratio, with width still determined by box count
      const height16_9 = (BOX_SIZE_PX * 9) / 16;
      return {
        width: `${baseWidth}px`,
        height: `${height16_9}px`,
      };
    }
    case "4:5": {
      // For 4:5, height is calculated based on aspect ratio
      // Height adjusts based on the ratio, with width still determined by box count
      const height4_5 = (BOX_SIZE_PX * 5) / 4;
      return {
        width: `${baseWidth}px`,
        height: `${height4_5}px`,
      };
    }
    default:
      // Default to 1:1 ratio
      return {
        width: `${baseWidth}px`,
        height: `${BOX_SIZE_PX}px`,
      };
  }
};

// Helper function to estimate text dimensions
export const estimateTextDimensions = (
  content: string,
  fontSize: number,
  fontFamily?: string,
  aspectRatio?: string,
  canvasCount?: number,
) => {
  // Create a cache key using all input parameters
  const cacheKey = `${content}-${fontSize}-${fontFamily}-${aspectRatio}-${canvasCount}`;

  // Check if we have a cached result
  if (dimensionsCache.has(cacheKey)) {
    return dimensionsCache.get(cacheKey)!;
  }

  // Split text by line breaks
  const lines = content.split("\n");

  // Find the longest line
  let maxLineLength = 0;
  for (const line of lines) {
    maxLineLength = Math.max(maxLineLength, line.length);
  }

  // Calculate estimated width based on longest line
  // Adjust width multiplier based on font family (some fonts are wider than others)
  let widthMultiplier = 0.6; // Default multiplier

  // Adjust multiplier for wider/narrower fonts
  if (fontFamily) {
    if (["Oswald", "Montserrat", "Roboto Condensed"].includes(fontFamily)) {
      widthMultiplier = 0.5; // Narrower fonts
    } else if (["Playfair Display", "Merriweather"].includes(fontFamily)) {
      widthMultiplier = 0.7; // Wider fonts
    }
  }

  const estimatedWidth = maxLineLength * fontSize * widthMultiplier;

  // Get the canvas width from the aspect ratio style if provided
  let maxWidth = 1000; // Default max width
  if (aspectRatio && canvasCount) {
    const { width } = getAspectRatioStyle(aspectRatio, canvasCount);
    const canvasWidth = parseFloat(width);
    // Limit width to canvas width minus some padding
    maxWidth = canvasWidth - 20; // 10px padding on each side
  }

  const finalWidth = Math.min(estimatedWidth, maxWidth);

  // Calculate estimated height based on number of lines
  const lineHeight = fontSize * 1.2;
  const estimatedHeight = lineHeight * Math.max(1, lines.length);

  // Cache the result before returning
  const result = { width: finalWidth, height: estimatedHeight };
  dimensionsCache.set(cacheKey, result);
  return result;
};

// Get canvas dimensions in mm for display
export const getCanvasDimensionsInMm = (aspectRatio: string, canvasCount: number) => {
  const { width, height } = getAspectRatioStyle(aspectRatio, canvasCount);
  const widthPx = parseFloat(width);
  const heightPx = parseFloat(height);

  const widthMm = Math.round(widthPx / PX_PER_MM);
  const heightMm = Math.round(heightPx / PX_PER_MM);

  return { widthMm, heightMm };
};
