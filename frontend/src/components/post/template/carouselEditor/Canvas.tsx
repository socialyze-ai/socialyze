import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateImagePosition,
  updateImageSize,
  updateTextPosition,
  updateTextStyle,
  updateTextContent,
  updateTextSize,
  setSelectedItem,
  removeItem,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import TextEditor from "./TextEditor";

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
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Base box size in pixels (converted from mm)
  // Using an approximate conversion of 1mm ≈ 3.78px for screen display
  const BOX_SIZE_MM = 50; // Base box size in mm
  const PX_PER_MM = 3.78; // Approximate conversion factor
  const BOX_SIZE_PX = BOX_SIZE_MM * PX_PER_MM; // Base box size in pixels

  // Calculate aspect ratio dimensions
  const getAspectRatioStyle = () => {
    // Calculate the base width based on box count
    const baseWidth = BOX_SIZE_PX * canvasCount;

    switch (aspectRatio) {
      case "1:1":
        // For 1:1, height equals width for a single box
        // Width increases with box count, height remains constant at BOX_SIZE_PX
        return {
          width: `${baseWidth}px`,
          height: `${BOX_SIZE_PX}px`,
        };
      case "16:9":
        // For 16:9, height is calculated based on aspect ratio
        // Height adjusts based on the ratio, with width still determined by box count
        const height16_9 = (BOX_SIZE_PX * 9) / 16;
        return {
          width: `${baseWidth}px`,
          height: `${height16_9}px`,
        };
      case "4:5":
        // For 4:5, height is calculated based on aspect ratio
        // Height adjusts based on the ratio, with width still determined by box count
        const height4_5 = (BOX_SIZE_PX * 5) / 4;
        return {
          width: `${baseWidth}px`,
          height: `${height4_5}px`,
        };
      default:
        // Default to 1:1 ratio
        return {
          width: `${baseWidth}px`,
          height: `${BOX_SIZE_PX}px`,
        };
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

        // Allow positioning outside canvas bounds
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
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

  // Handle editing text
  const handleEditText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToEdit = texts.find((txt) => txt.id === id);
    if (textToEdit) {
      setEditingTextId(id);
      setShowTextEditor(true);
    }
  };

  // Helper function to estimate text dimensions
  const estimateTextDimensions = (content: string, fontSize: number) => {
    // Split text by line breaks
    const lines = content.split("\n");

    // Find the longest line
    let maxLineLength = 0;
    for (const line of lines) {
      maxLineLength = Math.max(maxLineLength, line.length);
    }

    // Calculate estimated width based on longest line
    const estimatedWidth = maxLineLength * fontSize * 0.6;

    // Get the canvas width from the aspect ratio style
    const { width } = getAspectRatioStyle();
    const canvasWidth = parseFloat(width);

    // Limit width to canvas width minus some padding
    const maxWidth = canvasWidth - 20; // 10px padding on each side
    const finalWidth = Math.min(estimatedWidth, maxWidth);

    // Calculate estimated height based on number of lines
    const lineHeight = fontSize * 1.2;
    const estimatedHeight = lineHeight * Math.max(1, lines.length);

    return { width: finalWidth, height: estimatedHeight };
  };

  // Handle saving edited text
  const handleSaveEditedText = (content: string, style?: { fontSize: number; color: string }) => {
    if (editingTextId) {
      const textToUpdate = texts.find((txt) => txt.id === editingTextId);
      if (textToUpdate) {
        // Calculate new font size
        const fontSize = style?.fontSize || textToUpdate.style.fontSize;

        // Calculate new dimensions
        const { width, height } = estimateTextDimensions(content, fontSize);

        // Update text content
        dispatch(
          updateTextContent({
            id: editingTextId,
            content: content,
          }),
        );

        // Update text style
        dispatch(
          updateTextStyle({
            id: editingTextId,
            style: style || textToUpdate.style,
          }),
        );

        // Update text size based on new content
        dispatch(
          updateTextSize({
            id: editingTextId,
            size: { width, height },
          }),
        );
      }
      setShowTextEditor(false);
      setEditingTextId(null);
    }
  };

  // Draw reference lines for canvas sections
  const renderReferenceLines = () => {
    if (canvasCount <= 1) return null;

    const lines = [];
    const canvasWidth = parseFloat(getAspectRatioStyle().width);

    // Calculate section width
    const sectionWidth = canvasWidth / canvasCount;

    // Draw vertical lines separating sections
    for (let i = 1; i < canvasCount; i++) {
      lines.push(
        <div
          key={`line-${i}`}
          className="absolute border-l border-dashed border-gray-400"
          style={{
            left: `${sectionWidth * i}px`,
            height: "100%",
            top: 0,
          }}
        />,
      );
    }

    return lines;
  };

  // Render all items on the canvas
  const renderCanvasItems = () => {
    return (
      <>
        {/* Render all images */}
        {images.map((img) => {
          const isSelected = selectedItemId === img.id;

          return (
            <div
              key={img.id}
              className={`absolute cursor-move ${isSelected ? "ring-2 ring-blue-500" : ""}`}
              style={{
                left: `${img.position.x}px`,
                top: `${img.position.y}px`,
                width: `${img.size.width}px`,
                height: `${img.size.height}px`,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={(e) => handleSelectItem(img.id, e)}
              onMouseDown={(e) => handleDragStart(e, img.position)}
            >
              <img src={img.src} alt="User uploaded" className="w-full h-full object-cover" />

              {/* X button for quick removal */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeItem(img.id));
                }}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Resize handle - only visible when selected */}
              {isSelected && (
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center"
                  onMouseDown={(e) => handleResizeStart(e, img.size)}
                >
                  <div className="w-2 h-2 bg-white"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Render all texts */}
        {texts.map((txt) => {
          const isSelected = selectedItemId === txt.id;
          const textSize = txt.size || estimateTextDimensions(txt.content, txt.style.fontSize);

          return (
            <div
              key={txt.id}
              className={`absolute cursor-move ${isSelected ? "ring-2 ring-blue-500 p-1" : "p-1"}`}
              style={{
                left: `${txt.position.x}px`,
                top: `${txt.position.y}px`,
                width: typeof textSize.width === "number" ? `${textSize.width}px` : textSize.width,
                height:
                  typeof textSize.height === "number" ? `${textSize.height}px` : textSize.height,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={(e) => handleSelectItem(txt.id, e)}
              onMouseDown={(e) => handleDragStart(e, txt.position)}
            >
              <div
                style={{
                  fontSize: `${txt.style.fontSize}px`,
                  color: txt.style.color,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  textAlign: "left",
                  width: "100%",
                  height: "100%",
                  overflowWrap: "break-word",
                }}
              >
                {txt.content}
              </div>

              {/* Control buttons */}
              <div className="absolute -top-2 -right-2 flex">
                {/* Edit button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-5 w-5 rounded-full mr-1"
                  onClick={(e) => handleEditText(txt.id, e)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>

                {/* X button for quick removal */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeItem(txt.id));
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // Get canvas dimensions in mm for display
  const getCanvasDimensionsInMm = () => {
    const { width, height } = getAspectRatioStyle();
    const widthPx = parseFloat(width);
    const heightPx = parseFloat(height);

    const widthMm = Math.round(widthPx / PX_PER_MM);
    const heightMm = Math.round(heightPx / PX_PER_MM);

    return { widthMm, heightMm };
  };

  const { widthMm, heightMm } = getCanvasDimensionsInMm();

  return (
    <div className="relative">
      <div className="mb-2 text-sm text-gray-600">
        Canvas Size: {widthMm}mm × {heightMm}mm ({aspectRatio})
      </div>
      <div
        ref={canvasRef}
        className={`relative border border-gray-300 ${
          selectedItemId ? "overflow-visible" : "overflow-hidden"
        }`}
        style={{
          ...getAspectRatioStyle(),
          position: "relative",
          backgroundColor,
        }}
        onClick={handleCanvasClick}
      >
        {/* Container for all items */}
        <div
          className={`absolute top-0 left-0 w-full h-full ${
            selectedItemId ? "overflow-visible" : "overflow-hidden"
          }`}
        >
          {/* Reference lines */}
          {renderReferenceLines()}

          {/* Canvas items */}
          {renderCanvasItems()}
        </div>
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

      {/* Text editor modal */}
      {showTextEditor && editingTextId && (
        <TextEditor
          onSave={handleSaveEditedText}
          onCancel={() => {
            setShowTextEditor(false);
            setEditingTextId(null);
          }}
          initialText={texts.find((txt) => txt.id === editingTextId)?.content || ""}
          initialStyle={texts.find((txt) => txt.id === editingTextId)?.style}
        />
      )}
    </div>
  );
};

export default Canvas;
