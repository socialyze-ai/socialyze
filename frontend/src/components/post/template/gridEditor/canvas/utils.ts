// Utility functions for Grid Canvas component

// Base cell size in pixels (converted from mm)
// Using an approximate conversion of 1mm ≈ 3.78px for screen display
export const CELL_SIZE_MM = 50; // Base cell size in mm
export const PX_PER_MM = 3.78; // Approximate conversion factor
export const CELL_SIZE_PX = CELL_SIZE_MM * PX_PER_MM; // Base cell size in pixels

// Cache for text dimension calculations
const dimensionsCache = new Map<string, { width: number; height: number }>();

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
