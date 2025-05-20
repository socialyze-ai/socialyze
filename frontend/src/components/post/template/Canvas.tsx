import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateImagePosition,
  updateImageSize,
  updateTextPosition,
  setSelectedItem,
  removeItem,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";

const Canvas = () => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts, selectedItemId } = useSelector(
    (state: RootState) => state.template,
  );

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });

  // Calculate aspect ratio dimensions
  const getAspectRatioStyle = () => {
    const fixedHeight = 384; // Fixed height (h-96)
    let width = "100%";

    switch (aspectRatio) {
      case "16:9":
        width = `${(fixedHeight * 16) / 9}px`;
        return { width, height: `${fixedHeight}px` };
      case "1:1":
        return { width: `${fixedHeight}px`, height: `${fixedHeight}px` };
      case "4:5":
        width = `${(fixedHeight * 4) / 5}px`;
        return { width, height: `${fixedHeight}px` };
      default:
        width = `${(fixedHeight * 16) / 9}px`;
        return { width, height: `${fixedHeight}px` };
    }
  };

  // Handle item selection
  const handleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedItem(id));
  };

  // Handle canvas click (deselect all items)
  const handleCanvasClick = () => {
    dispatch(setSelectedItem(null));
  };

  // Start dragging an item
  const handleDragStart = (e: React.MouseEvent, position: { x: number; y: number }) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Start resizing an item
  const handleResizeStart = (e: React.MouseEvent, size: { width: number; height: number }) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: size.width,
      height: size.height,
    });
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedItemId) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      if (isDragging) {
        const selectedImage = images.find((img) => img.id === selectedItemId);
        const selectedText = texts.find((txt) => txt.id === selectedItemId);

        const newPosition = {
          x: Math.max(0, Math.min(canvasRect.width - 20, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(canvasRect.height - 20, e.clientY - dragStart.y)),
        };

        if (selectedImage) {
          dispatch(updateImagePosition({ id: selectedItemId, position: newPosition }));
        } else if (selectedText) {
          dispatch(updateTextPosition({ id: selectedItemId, position: newPosition }));
        }
      }

      if (isResizing) {
        const selectedImage = images.find((img) => img.id === selectedItemId);
        if (selectedImage) {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Determine if we want to maintain aspect ratio
          const maintainAspectRatio = true; // Can be made into a user toggle option

          if (maintainAspectRatio) {
            const aspectRatioValue = selectedImage.size.height / selectedImage.size.width;
            let newWidth = Math.max(20, resizeStart.width + deltaX);
            let newHeight = Math.max(20, newWidth * aspectRatioValue);

            // Keep it within bounds
            if (selectedImage.position.x + newWidth > canvasRect.width) {
              newWidth = canvasRect.width - selectedImage.position.x;
              newHeight = newWidth * aspectRatioValue;
            }

            if (selectedImage.position.y + newHeight > canvasRect.height) {
              newHeight = canvasRect.height - selectedImage.position.y;
              newWidth = newHeight / aspectRatioValue;
            }

            dispatch(
              updateImageSize({ id: selectedItemId, size: { width: newWidth, height: newHeight } }),
            );
          } else {
            // Free-form resize (not maintaining aspect ratio)
            const newWidth = Math.max(20, resizeStart.width + deltaX);
            const newHeight = Math.max(20, resizeStart.height + deltaY);

            dispatch(
              updateImageSize({ id: selectedItemId, size: { width: newWidth, height: newHeight } }),
            );
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, selectedItemId, dragStart, resizeStart, images, texts, dispatch]);

  // Handle item deletion
  const handleDeleteItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemId) {
      dispatch(removeItem(selectedItemId));
    }
  };

  // Render canvas sections
  const renderCanvasSections = () => {
    const sections = [];

    for (let i = 0; i < canvasCount; i++) {
      sections.push(
        <div
          key={`section-${i}`}
          className="border border-gray-300 relative"
          style={{
            flex: `1 0 ${100 / canvasCount}%`,
            minWidth: `${100 / canvasCount}%`,
            backgroundColor,
          }}
        >
          {/* Canvas section number */}
          <div className="absolute top-1 left-1 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-700 z-50">
            {i + 1}
          </div>

          {/* Render images in this section */}
          {images
            .filter((img) => img.canvasIndex === i)
            .map((img) => (
              <div
                key={img.id}
                className={`absolute cursor-move ${
                  selectedItemId === img.id ? "ring-2 ring-blue-500" : ""
                }`}
                style={{
                  left: `${img.position.x}px`,
                  top: `${img.position.y}px`,
                  width: `${img.size.width}px`,
                  height: `${img.size.height}px`,
                  zIndex: selectedItemId === img.id ? 10 : 1,
                }}
                onClick={(e) => handleSelectItem(img.id, e)}
                onMouseDown={(e) => handleDragStart(e, img.position)}
              >
                <img src={img.src} alt="User uploaded" className="w-full h-full object-cover" />

                {/* Resize handle - only visible when selected */}
                {selectedItemId === img.id && (
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center"
                    onMouseDown={(e) => handleResizeStart(e, img.size)}
                  >
                    <div className="w-2 h-2 bg-white"></div>
                  </div>
                )}
              </div>
            ))}

          {/* Render texts in this section */}
          {texts
            .filter((txt) => txt.canvasIndex === i)
            .map((txt) => (
              <div
                key={txt.id}
                className={`absolute cursor-move ${
                  selectedItemId === txt.id ? "ring-2 ring-blue-500 p-1" : "p-1"
                }`}
                style={{
                  left: `${txt.position.x}px`,
                  top: `${txt.position.y}px`,
                  zIndex: selectedItemId === txt.id ? 10 : 1,
                }}
                onClick={(e) => handleSelectItem(txt.id, e)}
                onMouseDown={(e) => handleDragStart(e, txt.position)}
              >
                <div
                  style={{
                    fontSize: `${txt.style.fontSize}px`,
                    color: txt.style.color,
                  }}
                >
                  {txt.content}
                </div>
              </div>
            ))}
        </div>,
      );
    }

    return sections;
  };

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        className="relative overflow-x-auto flex"
        style={{
          ...getAspectRatioStyle(),
          position: "relative",
          overflowY: "hidden",
        }}
        onClick={handleCanvasClick}
      >
        <div className="absolute top-0 left-0 w-full h-full flex">{renderCanvasSections()}</div>
      </div>

      {/* Controls for selected item */}
      {selectedItemId && (
        <div className="absolute top-2 right-2 bg-white rounded-md shadow-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 h-8 w-8"
            onClick={handleDeleteItem}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
