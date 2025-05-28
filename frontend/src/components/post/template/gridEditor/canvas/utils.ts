// Utility functions for Grid Canvas component

// Base cell size in pixels (converted from mm)
// Using an approximate conversion of 1mm ≈ 3.78px for screen display
export const CELL_SIZE_MM = 50; // Base cell size in mm
export const PX_PER_MM = 3.78; // Approximate conversion factor
export const CELL_SIZE_PX = CELL_SIZE_MM * PX_PER_MM; // Base cell size in pixels

// Cache for text dimension calculations
const dimensionsCache = new Map<string, { width: number; height: number }>();

// Cache for optimal font size calculations
const fontSizeCache = new Map<string, number>();

// Calculate grid dimensions and styles
export const getGridStyle = (columns: number, rows: number) => {
  // Calculate the total width and height based on cell counts
  const totalWidth = CELL_SIZE_PX * columns;
  const totalHeight = CELL_SIZE_PX * rows;

  return {
    width: `${totalWidth}px`,
    height: `${totalHeight}px`,
  };
};

// Helper function to estimate text dimensions
export const estimateTextDimensions = (
  content: string,
  fontSize: number,
  fontFamily?: string,
  columns?: number,
  rows?: number,
) => {
  // Create a cache key using all input parameters
  const cacheKey = `${content}-${fontSize}-${fontFamily}-${columns}-${rows}`;

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

  // Get the cell width for potential constraints
  let maxWidth = 1000; // Default max width
  if (columns) {
    // Limit width to cell width minus some padding
    maxWidth = CELL_SIZE_PX - 20; // 10px padding on each side
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

// Calculate optimal font size based on container dimensions
export const calculateOptimalFontSize = (
  content: string,
  containerWidth: number,
  containerHeight: number,
  fontFamily: string = "Arial",
  minFontSize: number = 4,
  maxFontSize: number = 1000,
) => {
  // Handle edge cases
  if (!content || containerWidth <= 0 || containerHeight <= 0) {
    return minFontSize;
  }

  // Create a cache key
  const cacheKey = `font-${content.substr(0, 50)}-${containerWidth.toFixed(
    0,
  )}-${containerHeight.toFixed(0)}-${fontFamily}`;

  // Check cache first
  if (fontSizeCache.has(cacheKey)) {
    return fontSizeCache.get(cacheKey)!;
  }

  // Add padding factor to ensure text doesn't touch the edges
  const paddingFactor = 0.9;
  const adjustedWidth = containerWidth * paddingFactor;
  const adjustedHeight = containerHeight * paddingFactor;

  // Use binary search to find optimal font size
  let low = minFontSize;
  let high = maxFontSize;
  let optimalFontSize = minFontSize;
  let bestFit = 0; // How well the text fills the container (closer to 1 is better)

  // Calculate text ratio to prefer landscape or portrait filling based on content
  const contentLines = content.split("\n");
  const avgLineLength = content.length / Math.max(1, contentLines.length);
  const isMultiLine = contentLines.length > 1;
  const isSingleShortLine = contentLines.length === 1 && content.length < 15;

  // Binary search for optimal font size
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const { width, height } = measureTextDimensions(content, mid, fontFamily, adjustedWidth);

    // Calculate how much of the container is filled
    const widthRatio = width / adjustedWidth;
    const heightRatio = height / adjustedHeight;

    // Prioritize different dimensions based on content type
    let fillRatio;
    if (isMultiLine) {
      // For multi-line text, prioritize height utilization
      fillRatio = Math.max(heightRatio, widthRatio * 0.7);
    } else if (isSingleShortLine) {
      // For short single lines, prioritize width utilization
      fillRatio = Math.max(widthRatio, heightRatio * 0.7);
    } else {
      // For general cases, consider both dimensions equally
      fillRatio = Math.max(widthRatio, heightRatio);
    }

    // Check if text fits within container
    if (widthRatio <= 1 && heightRatio <= 1) {
      // Text fits, try to find the largest size that fits well
      if (fillRatio > bestFit) {
        bestFit = fillRatio;
        optimalFontSize = mid;
      }
      low = mid + 1;
    } else {
      // Text too large, try smaller
      high = mid - 1;
    }
  }

  // Additional check for very small containers
  if (containerWidth < 50 || containerHeight < 20) {
    optimalFontSize = Math.min(
      optimalFontSize,
      Math.max(minFontSize, Math.floor(Math.min(containerWidth / 5, containerHeight / 2))),
    );
  }

  // Cache result
  fontSizeCache.set(cacheKey, optimalFontSize);
  return optimalFontSize;
};

// Measure text dimensions more accurately using canvas
export const measureTextDimensions = (
  text: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number,
) => {
  // Use canvas for accurate text measurement
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    // Fallback if canvas not available
    return {
      width: text.length * fontSize * 0.6,
      height: fontSize * 1.2,
    };
  }

  // Set font properties
  ctx.font = `${fontSize}px ${fontFamily}`;

  // Handle direct text measurement for very short texts
  if (text.length < 10 && !text.includes("\n")) {
    const metrics = ctx.measureText(text);
    return {
      width: metrics.width,
      height: fontSize * 1.2,
    };
  }

  // Split text into lines accounting for both manual line breaks and word wrapping
  const manualLines = text.split("\n");
  const wrappedLines: string[] = [];

  // Process each manual line for word wrapping
  for (const line of manualLines) {
    if (line.trim().length === 0) {
      wrappedLines.push("");
      continue;
    }

    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const { width } = ctx.measureText(testLine);

      if (width > maxWidth && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  // Calculate dimensions
  const lineHeight = fontSize * 1.2;
  const height = Math.max(fontSize, wrappedLines.length * lineHeight);

  // Find the widest line
  let maxLineWidth = 0;
  wrappedLines.forEach((line) => {
    const { width } = ctx.measureText(line || " "); // Use space for empty lines
    maxLineWidth = Math.max(maxLineWidth, width);
  });

  return {
    width: maxLineWidth,
    height,
  };
};

// Get grid dimensions in mm for display
export const getGridDimensionsInMm = (columns: number, rows: number) => {
  const { width, height } = getGridStyle(columns, rows);
  const widthPx = parseFloat(width);
  const heightPx = parseFloat(height);

  const widthMm = Math.round(widthPx / PX_PER_MM);
  const heightMm = Math.round(heightPx / PX_PER_MM);

  return { widthMm, heightMm };
};

// Calculate cell coordinates from index
export const getCellCoordinates = (index: number, columns: number) => {
  const row = Math.floor(index / columns);
  const column = index % columns;
  return { row, column };
};

// Calculate cell index from coordinates
export const getCellIndex = (row: number, column: number, columns: number) => {
  return row * columns + column;
};

// Calculate if an item is visible in a specific cell
export const isItemVisibleInCell = (
  itemPosition: { x: number; y: number },
  itemSize: { width: number; height: number },
  cellIndex: number,
  columns: number,
  rows: number,
) => {
  // Get the cell coordinates
  const { row, column } = getCellCoordinates(cellIndex, columns);

  // Calculate cell boundaries
  const cellLeft = column * CELL_SIZE_PX;
  const cellTop = row * CELL_SIZE_PX;
  const cellRight = cellLeft + CELL_SIZE_PX;
  const cellBottom = cellTop + CELL_SIZE_PX;

  // Calculate item boundaries
  const itemLeft = itemPosition.x;
  const itemTop = itemPosition.y;
  const itemRight = itemLeft + itemSize.width;
  const itemBottom = itemTop + itemSize.height;

  // Check if the item overlaps with the cell
  return (
    itemLeft < cellRight && itemRight > cellLeft && itemTop < cellBottom && itemBottom > cellTop
  );
};
