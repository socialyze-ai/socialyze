import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { CanvasTextItem, TextAlign } from "./types";

interface CanvasTextProps {
  txt: CanvasTextItem;
  isSelected: boolean;
  textSize: { width: string | number; height: string | number };
  onSelectItem: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent, position: { x: number; y: number }, id: string) => void;
  onResizeStart: (e: React.MouseEvent, size: { width: number; height: number }) => void;
  onEditText: (id: string, e: React.MouseEvent) => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onUpdateSize?: (id: string, size: { width: number; height: number }) => void;
  localResizeState?: {
    itemId: string | null;
    size: { width: number; height: number };
    fontSize: number;
  };
}

const CanvasText: React.FC<CanvasTextProps> = ({
  txt,
  isSelected,
  textSize,
  onSelectItem,
  onDragStart,
  onResizeStart,
  onEditText,
  onRemoveItem,
  onUpdateSize,
  localResizeState,
}) => {
  const rotation = txt.style.rotation || 0;
  const textContentRef = useRef<HTMLDivElement>(null);

  // Check if this text is currently being resized
  const isResizing = localResizeState?.itemId === txt.id;

  // Use local resize state dimensions and font size during active resize
  const displaySize = isResizing
    ? {
        width: `${localResizeState.size.width}px`,
        height: `${localResizeState.size.height}px`,
      }
    : {
        width: typeof textSize.width === "number" ? `${textSize.width}px` : textSize.width,
        height: typeof textSize.height === "number" ? `${textSize.height}px` : textSize.height,
      };

  // Use local resize state font size during active resize
  const displayFontSize = isResizing ? localResizeState.fontSize : txt.style.fontSize;

  // Auto-resize effect - measure text content and update size
  useEffect(() => {
    if (textContentRef.current && onUpdateSize && !isResizing) {
      // Allow a small delay for the text to render with correct styles
      const timer = setTimeout(() => {
        const textElement = textContentRef.current;
        if (textElement) {
          // Get the actual content size plus some padding
          const contentWidth = Math.ceil(textElement.scrollWidth) + 20; // Add some padding
          const contentHeight = Math.ceil(textElement.scrollHeight) + 10; // Add some padding

          // If current size is significantly different from content size, update it
          const currentWidth = typeof txt.size?.width === "number" ? txt.size.width : 100;
          const currentHeight = typeof txt.size?.height === "number" ? txt.size.height : 50;

          if (
            Math.abs(contentWidth - currentWidth) > 5 ||
            Math.abs(contentHeight - currentHeight) > 5
          ) {
            onUpdateSize(txt.id, {
              width: contentWidth,
              height: contentHeight,
            });
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [txt.content, txt.style.fontSize, txt.style.fontFamily, txt.style.fontWeight]);

  return (
    <div
      className={`absolute cursor-move canvas-item ${
        isSelected ? "ring-2 ring-blue-500 p-1" : "p-1"
      }`}
      style={{
        left: `${txt.position.x}px`,
        top: `${txt.position.y}px`,
        width: displaySize.width,
        height: displaySize.height,
        zIndex: txt.zIndex,
        transform: `rotate(${rotation}deg) translateZ(0)`,
        transformOrigin: "center center",
        userSelect: "none",
        willChange: "transform, contents",
      }}
      onClick={(e) => onSelectItem(txt.id, e)}
      onMouseDown={(e) => onDragStart(e, txt.position, txt.id)}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          display: "flex",
          alignItems: txt.style.textAlign === "center" ? "center" : "flex-start",
          justifyContent: getJustifyContent(txt.style.textAlign),
        }}
      >
        <div
          ref={textContentRef}
          style={{
            fontSize: `${displayFontSize}px`,
            color: txt.style.color,
            fontFamily: txt.style.fontFamily || "inherit",
            fontWeight: txt.style.fontWeight || "normal",
            fontStyle: txt.style.fontStyle || "normal",
            lineHeight: txt.style.lineHeight || "normal",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: txt.style.textAlign || "left",
            width: "100%",
            maxHeight: "100%",
            overflowWrap: "break-word",
            pointerEvents: "none",
            WebkitFontSmoothing: "antialiased",
            textRendering: "optimizeLegibility",
          }}
        >
          {txt.content}
        </div>
      </div>

      {/* Control buttons */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex">
          {/* Edit button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-5 w-5 rounded-full mr-1 z-10"
            onClick={(e) => onEditText(txt.id, e)}
          >
            <Pencil className="h-3 w-3" />
          </Button>

          {/* X button for quick removal */}
          <Button
            variant="destructive"
            size="icon"
            className="h-5 w-5 rounded-full z-10"
            onClick={(e) => onRemoveItem(txt.id, e)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize handle - only visible when selected */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center z-10"
          onMouseDown={(e) => {
            // Get current size (either from localResizeState during resize or from txt.size)
            const width = isResizing
              ? localResizeState.size.width
              : typeof txt.size?.width === "number"
              ? txt.size.width
              : 100;

            const height = isResizing
              ? localResizeState.size.height
              : typeof txt.size?.height === "number"
              ? txt.size.height
              : 50;

            onResizeStart(e, { width, height });
          }}
        >
          <div className="w-2 h-2 bg-white"></div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert text alignment to flexbox justify content
const getJustifyContent = (textAlign: TextAlign): string => {
  switch (textAlign) {
    case "center":
      return "center";
    case "right":
      return "flex-end";
    case "justify":
      return "space-between";
    case "left":
    default:
      return "flex-start";
  }
};

export default React.memo<CanvasTextProps>(CanvasText, (prevProps, nextProps) => {
  return (
    prevProps.txt.position.x === nextProps.txt.position.x &&
    prevProps.txt.position.y === nextProps.txt.position.y &&
    prevProps.txt.content === nextProps.txt.content &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.textSize.width === nextProps.textSize.width &&
    prevProps.textSize.height === nextProps.textSize.height &&
    prevProps.txt.style.fontSize === nextProps.txt.style.fontSize &&
    prevProps.txt.style.color === nextProps.txt.style.color &&
    prevProps.txt.style.rotation === nextProps.txt.style.rotation &&
    prevProps.txt.style.fontFamily === nextProps.txt.style.fontFamily &&
    prevProps.localResizeState?.itemId === nextProps.localResizeState?.itemId &&
    prevProps.onUpdateSize === nextProps.onUpdateSize &&
    (prevProps.localResizeState === null ||
      nextProps.localResizeState === null ||
      (prevProps.localResizeState?.size.width === nextProps.localResizeState?.size.width &&
        prevProps.localResizeState?.size.height === nextProps.localResizeState?.size.height &&
        prevProps.localResizeState?.fontSize === nextProps.localResizeState?.fontSize))
  );
});
