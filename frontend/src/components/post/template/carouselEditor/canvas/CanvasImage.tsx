import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, X, Plus } from "lucide-react";
import { CanvasImageItem } from "./types";

interface CanvasImageProps {
  img: CanvasImageItem;
  isSelected: boolean;
  isHovered: boolean;
  onSelectItem: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent, position: { x: number; y: number }) => void;
  onResizeStart: (e: React.MouseEvent, size: { width: number; height: number }) => void;
  onEditImage: (id: string, e: React.MouseEvent) => void;
  onReplaceImage: (id: string, e: React.MouseEvent) => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

const CanvasImage: React.FC<CanvasImageProps> = ({
  img,
  isSelected,
  isHovered,
  onSelectItem,
  onDragStart,
  onResizeStart,
  onEditImage,
  onReplaceImage,
  onRemoveItem,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={`absolute cursor-move ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${img.position.x}px`,
        top: `${img.position.y}px`,
        width: `${img.size.width}px`,
        height: `${img.size.height}px`,
        zIndex: img.zIndex,
      }}
      onClick={(e) => onSelectItem(img.id, e)}
      onMouseDown={(e) => onDragStart(e, img.position)}
      onMouseEnter={() => onMouseEnter(img.id)}
      onMouseLeave={() => onMouseLeave()}
    >
      <img src={img.src} alt="User uploaded" className="w-full h-full object-cover" />

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
      {isHovered && (
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
    </div>
  );
};

export default CanvasImage;
