import React from "react";
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
}) => {
  const rotation = txt.style.rotation || 0;

  return (
    <div
      className={`absolute cursor-move canvas-item ${
        isSelected ? "ring-2 ring-blue-500 p-1" : "p-1"
      }`}
      style={{
        left: `${txt.position.x}px`,
        top: `${txt.position.y}px`,
        width: typeof textSize.width === "number" ? `${textSize.width}px` : textSize.width,
        height: typeof textSize.height === "number" ? `${textSize.height}px` : textSize.height,
        zIndex: txt.zIndex,
        transform: `rotate(${rotation}deg) translateZ(0)`,
        transformOrigin: "center center",
        userSelect: "none",
        willChange: "transform",
      }}
      onClick={(e) => onSelectItem(txt.id, e)}
      onMouseDown={(e) => onDragStart(e, txt.position, txt.id)}
    >
      <div
        style={{
          fontSize: `${txt.style.fontSize}px`,
          color: txt.style.color,
          fontFamily: txt.style.fontFamily || "inherit",
          fontWeight: txt.style.fontWeight || "normal",
          fontStyle: txt.style.fontStyle || "normal",
          lineHeight: txt.style.lineHeight || "normal",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textAlign: (txt.style.textAlign as TextAlign) || "left",
          width: "100%",
          height: "100%",
          overflowWrap: "break-word",
          pointerEvents: "none",
        }}
      >
        {txt.content}
      </div>

      {/* Control buttons */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex">
          {/* Edit button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-5 w-5 rounded-full mr-1"
            onClick={(e) => onEditText(txt.id, e)}
          >
            <Pencil className="h-3 w-3" />
          </Button>

          {/* X button for quick removal */}
          <Button
            variant="destructive"
            size="icon"
            className="h-5 w-5 rounded-full"
            onClick={(e) => onRemoveItem(txt.id, e)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize handle - only visible when selected */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center"
          onMouseDown={(e) => {
            // Ensure we have numeric values for width and height
            const width = typeof txt.size?.width === "number" ? txt.size.width : 100;
            const height = typeof txt.size?.height === "number" ? txt.size.height : 50;
            onResizeStart(e, { width, height });
          }}
        >
          <div className="w-2 h-2 bg-white"></div>
        </div>
      )}
    </div>
  );
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
    prevProps.txt.style.rotation === nextProps.txt.style.rotation
  );
});
