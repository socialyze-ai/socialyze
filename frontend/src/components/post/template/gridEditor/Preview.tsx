import {
  useState,
  CSSProperties,
  forwardRef,
  useRef,
  useImperativeHandle,
  RefObject,
  useEffect,
} from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

// Extend the TextStyle interface to include optional properties
interface ExtendedTextStyle extends Record<string, any> {
  fontSize: number;
  color: string;
  textAlign?: CSSProperties["textAlign"];
  fontWeight?: CSSProperties["fontWeight"];
  fontStyle?: CSSProperties["fontStyle"];
  lineHeight?: CSSProperties["lineHeight"];
  fontFamily?: string;
}

// Add PreviewRef interface for external access to preview functions
export interface PreviewRef {
  getPreviewElement: () => HTMLDivElement | null;
  getCellContentElement: (index: number) => HTMLDivElement | null;
  getSelectedCell: () => number;
  getTotalCells: () => number;
  selectCell: (index: number) => void;
}

const Preview = forwardRef<PreviewRef, {}>((props, ref) => {
  const { canvasCount, aspectRatio, backgroundColor, images, texts, gridSize } = useSelector(
    (state: RootState) => state.template,
  );

  const [selectedCell, setSelectedCell] = useState(0);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Calculate grid dimensions
  const columns = gridSize?.columns || 3; // Default to 3 columns
  const rows = gridSize?.rows || Math.ceil(canvasCount / columns); // Calculate rows based on canvas count

  // Load Google Fonts for all text items
  useEffect(() => {
    // Create a set to avoid duplicate font loading
    const fontsToLoad = new Set<string>();

    // Collect all unique font family and weight combinations
    texts.forEach((text) => {
      if (text.style.fontFamily && text.style.fontWeight) {
        fontsToLoad.add(`${text.style.fontFamily}:wght@${text.style.fontWeight}`);
      } else if (text.style.fontFamily) {
        fontsToLoad.add(`${text.style.fontFamily}:wght@400`);
      }
    });

    // Load each font
    const fontLinks: HTMLLinkElement[] = [];
    fontsToLoad.forEach((fontString) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontString.replace(
        / /g,
        "+",
      )}&display=swap`;
      document.head.appendChild(link);
      fontLinks.push(link);
    });

    // Clean up function to remove all font links
    return () => {
      fontLinks.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [texts]);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    getPreviewElement: () => previewBoxRef.current,
    getCellContentElement: (index: number) => cellRefs.current[index] || null,
    getSelectedCell: () => selectedCell,
    getTotalCells: () => canvasCount,
    selectCell: (index: number) => setSelectedCell(index),
  }));

  // Each cell size in mm (50mm x 50mm per cell) - MUST match Canvas component
  const CELL_SIZE_MM = 50;
  const PX_PER_MM = 3.78; // Approximate conversion factor
  const CELL_SIZE_PX = CELL_SIZE_MM * PX_PER_MM; // Cell size in pixels

  // Handle cell selection
  const handleCellClick = (index: number) => {
    setSelectedCell(index);
  };

  // Calculate grid aspect ratio for the preview
  const getGridPreviewStyle = () => {
    // Using a fixed preview width for better display
    const previewWidth = 350; // Base width for preview

    // Calculate cell dimensions based on aspect ratio
    let cellWidth, cellHeight;
    switch (aspectRatio) {
      case "16:9":
        cellWidth = CELL_SIZE_PX * (16 / 9);
        cellHeight = CELL_SIZE_PX;
        break;
      case "1:1":
        cellWidth = CELL_SIZE_PX;
        cellHeight = CELL_SIZE_PX;
        break;
      case "4:5":
        cellWidth = CELL_SIZE_PX * (4 / 5);
        cellHeight = CELL_SIZE_PX;
        break;
      default:
        cellWidth = CELL_SIZE_PX;
        cellHeight = CELL_SIZE_PX;
    }

    // Calculate total canvas dimensions
    const totalCanvasWidth = cellWidth * columns;
    const totalCanvasHeight = cellHeight * rows;

    // Calculate scale factor to fit preview width
    const scaleFactor = previewWidth / totalCanvasWidth;

    // Calculate preview height based on scaled canvas height
    const previewHeight = totalCanvasHeight * scaleFactor;

    return {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };
  };

  // Get the scale factor for rendering items
  const getScaleFactor = () => {
    const previewStyle = getGridPreviewStyle();
    const previewWidth = parseInt(previewStyle.width);

    // Calculate cell dimensions based on aspect ratio
    let cellWidth;
    switch (aspectRatio) {
      case "16:9":
        cellWidth = CELL_SIZE_PX * (16 / 9);
        break;
      case "1:1":
        cellWidth = CELL_SIZE_PX;
        break;
      case "4:5":
        cellWidth = CELL_SIZE_PX * (4 / 5);
        break;
      default:
        cellWidth = CELL_SIZE_PX;
    }

    // Calculate total canvas width
    const totalCanvasWidth = cellWidth * columns;

    // Calculate scale based on the preview width divided by total canvas width
    return previewWidth / totalCanvasWidth;
  };

  // Generate a preview cell
  const renderCell = (cellIndex: number) => {
    if (cellIndex >= canvasCount) return null;

    const scaleFactor = getScaleFactor();

    // Calculate row and column for this cell
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;

    // Calculate cell dimensions for the base canvas
    let cellWidth, cellHeight;
    switch (aspectRatio) {
      case "16:9":
        cellWidth = CELL_SIZE_PX * (16 / 9);
        cellHeight = CELL_SIZE_PX;
        break;
      case "1:1":
        cellWidth = CELL_SIZE_PX;
        cellHeight = CELL_SIZE_PX;
        break;
      case "4:5":
        cellWidth = CELL_SIZE_PX * (4 / 5);
        cellHeight = CELL_SIZE_PX;
        break;
      default:
        cellWidth = CELL_SIZE_PX;
        cellHeight = CELL_SIZE_PX;
    }

    // Calculate cell boundaries in the base canvas
    const cellStartX = col * cellWidth;
    const cellEndX = cellStartX + cellWidth;
    const cellStartY = row * cellHeight;
    const cellEndY = cellStartY + cellHeight;

    // Get adjusted position within the cell
    const getAdjustedPosition = (position: { x: number; y: number }) => {
      // Calculate position relative to the cell
      const relX = position.x - cellStartX;
      const relY = position.y - cellStartY;

      // Apply scaling
      const scaledX = relX * scaleFactor;
      const scaledY = relY * scaleFactor;

      return {
        left: `${scaledX}px`,
        top: `${scaledY}px`,
      };
    };

    return (
      <div
        key={`cell-${cellIndex}`}
        ref={(element) => (cellRefs.current[cellIndex] = element)}
        className="relative"
        style={{
          backgroundColor,
          overflow: "hidden",
        }}
        onClick={() => handleCellClick(cellIndex)}
      >
        {/* Render images that are at least partially visible in this cell */}
        {images.map((img) => {
          // Check if image is at least partially visible in current cell
          const imgLeft = img.position.x;
          const imgRight = img.position.x + img.size.width;
          const imgTop = img.position.y;
          const imgBottom = img.position.y + img.size.height;

          // If the image is completely outside the cell, don't render it
          if (
            imgRight < cellStartX ||
            imgLeft > cellEndX ||
            imgBottom < cellStartY ||
            imgTop > cellEndY
          ) {
            return null;
          }

          const positionStyle = getAdjustedPosition(img.position);

          // Calculate the scaled dimensions
          const scaledWidth = img.size.width * scaleFactor;
          const scaledHeight = img.size.height * scaleFactor;

          return (
            <div
              key={`preview-img-${cellIndex}-${img.id}`}
              className="absolute"
              style={{
                ...positionStyle,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
              }}
            >
              <img src={img.src} alt="Preview" className="w-full h-full object-cover" />
            </div>
          );
        })}

        {/* Render texts that are at least partially visible in this cell */}
        {texts.map((txt) => {
          // Check if text is at least partially visible in current cell
          const txtLeft = txt.position.x;
          const txtTop = txt.position.y;

          // Estimate text dimensions
          const estimatedWidth = txt.content.length * txt.style.fontSize * 0.6; // Approximate width
          const estimatedHeight = txt.style.fontSize * 1.2; // Approximate height

          const txtRight =
            txtLeft + (typeof txt.size?.width === "number" ? txt.size.width : estimatedWidth);
          const txtBottom =
            txtTop + (typeof txt.size?.height === "number" ? txt.size.height : estimatedHeight);

          // If text is completely outside the cell, don't render it
          if (
            txtRight < cellStartX ||
            txtLeft > cellEndX ||
            txtBottom < cellStartY ||
            txtTop > cellEndY
          ) {
            return null;
          }

          const positionStyle = getAdjustedPosition(txt.position);

          // Scale the font size
          const scaledFontSize = txt.style.fontSize * scaleFactor;

          // Treat txt.style as an extended style object
          const style = txt.style as ExtendedTextStyle;

          // Get text size if defined, otherwise calculate based on content
          const textSize = txt.size || {
            width: txt.content.length * scaledFontSize * 0.6, // Approximate width
            height: scaledFontSize * 1.2, // Approximate height
          };

          // Scale the text size
          const scaledWidth =
            typeof textSize.width === "number" ? textSize.width * scaleFactor : textSize.width;
          const scaledHeight =
            typeof textSize.height === "number" ? textSize.height * scaleFactor : textSize.height;

          return (
            <div
              key={`preview-txt-${cellIndex}-${txt.id}`}
              className="absolute"
              style={{
                ...positionStyle,
                width: typeof scaledWidth === "number" ? `${scaledWidth}px` : scaledWidth,
                height: typeof scaledHeight === "number" ? `${scaledHeight}px` : scaledHeight,
              }}
            >
              <div
                style={{
                  fontSize: `${scaledFontSize}px`,
                  color: style.color,
                  fontFamily: style.fontFamily || "inherit",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  textAlign: style.textAlign || "left",
                  fontWeight: style.fontWeight || "normal",
                  fontStyle: style.fontStyle || "normal",
                  lineHeight: style.lineHeight || "normal",
                  width: "100%",
                  height: "100%",
                  overflowWrap: "break-word",
                }}
              >
                {txt.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Get dimensions in mm for display
  const getGridDimensionsInMm = () => {
    // Calculate total dimensions based on cell size and grid dimensions
    const widthMm = CELL_SIZE_MM * columns;
    const heightMm = CELL_SIZE_MM * rows;

    // Adjust for aspect ratio
    let adjustedWidthMm = widthMm;

    switch (aspectRatio) {
      case "16:9":
        adjustedWidthMm = ((CELL_SIZE_MM * 16) / 9) * columns;
        break;
      case "4:5":
        adjustedWidthMm = ((CELL_SIZE_MM * 4) / 5) * columns;
        break;
    }

    return {
      cellWidthMm: Math.round((adjustedWidthMm / columns) * 10) / 10,
      cellHeightMm: CELL_SIZE_MM,
      totalWidthMm: Math.round(adjustedWidthMm),
      totalHeightMm: heightMm,
    };
  };

  const dimensions = getGridDimensionsInMm();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-sm font-medium mb-2">
        Preview - Cell {selectedCell + 1} of {canvasCount} selected
      </h3>

      <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
        {/* Grid dimensions display */}
        <div className="text-xs text-gray-600 mb-2">
          Grid Size: {dimensions.totalWidthMm}mm × {dimensions.totalHeightMm}mm ({aspectRatio}) -
          Cell Size: {dimensions.cellWidthMm}mm × {dimensions.cellHeightMm}mm
        </div>

        {/* Grid preview */}
        <div
          ref={previewBoxRef}
          className="border-2 border-gray-300 overflow-hidden grid gap-0.5 bg-gray-300"
          style={{
            ...getGridPreviewStyle(),
            maxWidth: "100%",
          }}
        >
          {/* Render all valid cells */}
          {Array.from({ length: canvasCount }).map((_, i) => renderCell(i))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1 text-center">
        {`${columns}×${rows} grid - Click a cell to select it`}
      </p>
    </div>
  );
});

Preview.displayName = "Preview";

export default Preview;
