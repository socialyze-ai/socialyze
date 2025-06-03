import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X, Plus } from "lucide-react";
import { CanvasImageItem } from "./types";

interface CanvasImageProps {
  img: CanvasImageItem;
  isSelected: boolean;
  isHovered: boolean;
  localImageResizeState?: { itemId: string | null; size: { width: number; height: number } };
  onSelectItem: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent, position: { x: number; y: number }) => void;
  onResizeStart: (e: React.MouseEvent, size: { width: number; height: number }) => void;
  onEditImage: (id: string, e: React.MouseEvent) => void;
  onReplaceImage: (id: string, e: React.MouseEvent) => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

// Main component rendered during drag & resize operations
const CanvasImageContent = React.memo<{ src: string }>(({ src }) => {
  return (
    <img
      src={src}
      alt="User uploaded"
      className="w-full h-full object-cover"
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    />
  );
});

CanvasImageContent.displayName = "CanvasImageContent";

const CanvasImage: React.FC<CanvasImageProps> = ({
  img,
  isSelected,
  isHovered,
  localImageResizeState,
  onSelectItem,
  onDragStart,
  onResizeStart,
  onEditImage,
  onReplaceImage,
  onRemoveItem,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Use local resize state if available and this image is being resized
  const imageSize =
    localImageResizeState && localImageResizeState.itemId === img.id
      ? localImageResizeState.size
      : img.size;

  // Separate the main content rendering for better memoization
  // Precomputed styles for performance
  const containerStyle = React.useMemo(
    () => ({
      left: `${img.position.x}px`,
      top: `${img.position.y}px`,
      width: `${imageSize.width}px`,
      height: `${imageSize.height}px`,
      zIndex: isSelected ? 100 : img.zIndex,
      willChange: "transform, width, height, left, top",
      transform: "translateZ(0)" as const /* Force GPU acceleration */,
      backfaceVisibility: "hidden" as const /* Prevent flickering */,
      transformStyle: "preserve-3d" as const /* Further optimize rendering */,
      transition: isSelected
        ? "none"
        : "width 0.05s, height 0.05s" /* Only animate non-selected items */,
    }),
    [img.position.x, img.position.y, imageSize.width, imageSize.height, isSelected, img.zIndex],
  );

  // Controls are only rendered when needed (selected/hovered)
  const renderControls = () => {
    if (!isSelected && !isHovered) return null;

    return (
      <>
        {/* Control buttons */}
        {isSelected && (
          <div className="absolute -top-3 -right-2 flex">
            {/* Edit button */}
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full mr-1 z-10"
              onClick={(e) => onEditImage(img.id, e)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* X button for quick removal */}
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full z-10"
              onClick={(e) => onRemoveItem(img.id, e)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Replace image button - only visible when hovered */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-90 hover:opacity-100"
              onClick={(e) => onReplaceImage(img.id, e)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Replace Image
            </Button>
          </div>
        )}

        {/* Resize handle - only visible when selected */}
        {isSelected && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center"
            onMouseDown={(e) => onResizeStart(e, img.size)}
          >
            <div className="w-2 h-2 bg-white"></div>
          </div>
        )}
      </>
    );
  };

  // Optimize pointer events - disable on image but enable on container
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during drag
    onDragStart(e, img.position);
  };

  return (
    <div
      key={img.id}
      className={`absolute cursor-move canvas-item ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={containerStyle}
      onClick={(e) => onSelectItem(img.id, e)}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => onMouseEnter(img.id)}
      onMouseLeave={onMouseLeave}
    >
      <CanvasImageContent src={img.src} />
      {renderControls()}
    </div>
  );
};

// Optimize memoization to include local resize state
export default React.memo<CanvasImageProps>(CanvasImage, (prevProps, nextProps) => {
  // Detect position changes for smooth drag operations
  const positionChanged =
    prevProps.img.position.x !== nextProps.img.position.x ||
    prevProps.img.position.y !== nextProps.img.position.y;

  // Is this image currently being resized?
  const isBeingResized =
    nextProps.localImageResizeState?.itemId === nextProps.img.id ||
    prevProps.localImageResizeState?.itemId === prevProps.img.id;

  // If position changed, always re-render for smooth dragging
  if (positionChanged) {
    return false;
  }

  // If it's being resized, we need to compare the local resize state
  if (isBeingResized) {
    const prevSize =
      prevProps.localImageResizeState?.itemId === prevProps.img.id
        ? prevProps.localImageResizeState.size
        : prevProps.img.size;

    const nextSize =
      nextProps.localImageResizeState?.itemId === nextProps.img.id
        ? nextProps.localImageResizeState.size
        : nextProps.img.size;

    return (
      prevSize.width === nextSize.width &&
      prevSize.height === nextSize.height &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isHovered === nextProps.isHovered
    );
  }

  // Regular comparison for other updates
  return (
    prevProps.img.size.width === nextProps.img.size.width &&
    prevProps.img.size.height === nextProps.img.size.height &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.img.zIndex === nextProps.img.zIndex
  );
});
