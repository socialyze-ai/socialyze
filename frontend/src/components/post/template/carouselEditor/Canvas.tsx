import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, X, Pencil, RotateCw, Plus } from "lucide-react";
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
  setImages,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import TextEditor from "./TextEditor";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Media } from "../../MediaUploader";
import ImageEditor from "../../editor/ImageEditor";
import MediaUploader from "../../MediaUploader";

// Add TextAlign type
type TextAlign = "left" | "center" | "right" | "justify";

// Define interface for Canvas ref
export interface CanvasRef {
  captureCanvasContent: (boxIndex: number) => Promise<Blob | null>;
  getTotalBoxes: () => number;
}

const Canvas = forwardRef<CanvasRef, {}>((props, ref) => {
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
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<{ id: string; src: string } | null>(null);
  const [isReplaceImageDialogOpen, setIsReplaceImageDialogOpen] = useState(false);
  const [imageToReplace, setImageToReplace] = useState<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    captureCanvasContent: async (boxIndex: number): Promise<Blob | null> => {
      if (!canvasRef.current) return null;

      try {
        // Get canvas dimensions
        const canvasWidth = parseFloat(getAspectRatioStyle().width);
        const canvasHeight = parseFloat(getAspectRatioStyle().height);

        // Calculate section width
        const sectionWidth = canvasWidth / canvasCount;

        // Create a new canvas for this section
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Set high resolution
        const scale = 2; // Higher quality
        canvas.width = sectionWidth * scale;
        canvas.height = canvasHeight * scale;

        // Set background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);

        // Translate context to offset the section
        ctx.translate(-boxIndex * sectionWidth, 0);

        // Draw all images
        for (const img of images) {
          // Check if image is visible in this section
          const imgLeft = img.position.x;
          const imgRight = img.position.x + img.size.width;
          const sectionLeft = boxIndex * sectionWidth;
          const sectionRight = (boxIndex + 1) * sectionWidth;

          // Skip if image is not visible in this section
          if (imgRight < sectionLeft || imgLeft > sectionRight) continue;

          // Load image
          const imgElement = new Image();
          imgElement.crossOrigin = "anonymous";

          // Draw image when loaded
          await new Promise<void>((resolve, reject) => {
            imgElement.onload = () => {
              ctx.drawImage(
                imgElement,
                img.position.x,
                img.position.y,
                img.size.width,
                img.size.height,
              );
              resolve();
            };
            imgElement.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            imgElement.src = img.src;
          });
        }

        // Draw all texts
        for (const txt of texts) {
          // Check if text is visible in this section
          const txtLeft = txt.position.x;
          // Estimate text width based on content and font size
          const estimatedWidth = txt.content.length * txt.style.fontSize * 0.6;
          // Ensure we're working with a number for calculations
          const txtWidth = typeof txt.size?.width === "number" ? txt.size.width : estimatedWidth;
          const txtRight = txtLeft + txtWidth;
          const sectionLeft = boxIndex * sectionWidth;
          const sectionRight = (boxIndex + 1) * sectionWidth;

          // Skip if text is not visible in this section
          if (txtRight < sectionLeft || txtLeft > sectionRight) continue;

          // Set text styles
          ctx.font = `${txt.style.fontWeight || "normal"} ${txt.style.fontSize}px ${
            txt.style.fontFamily || "Arial"
          }`;
          ctx.fillStyle = txt.style.color;
          ctx.textBaseline = "top";

          // Apply rotation if needed
          if (txt.style.rotation) {
            // Save context state
            ctx.save();
            // Get text height as a number
            const txtHeight =
              typeof txt.size?.height === "number" ? txt.size.height : txt.style.fontSize;
            // Translate to the center of text for rotation
            const centerX = txt.position.x + txtWidth / 2;
            const centerY = txt.position.y + txtHeight / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((txt.style.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
          }

          // Draw text
          // Convert TextAlign to CanvasTextAlign, skipping 'justify' which isn't supported
          let textAlign: CanvasTextAlign = "left";
          if (txt.style.textAlign === "center" || txt.style.textAlign === "right") {
            textAlign = txt.style.textAlign;
          }
          ctx.textAlign = textAlign;

          // Handle multi-line text
          const lines = txt.content.split("\n");
          const lineHeight = txt.style.fontSize * 1.2;

          lines.forEach((line, i) => {
            let x = txt.position.x;
            if (textAlign === "center") {
              x += txtWidth / 2;
            } else if (textAlign === "right") {
              x += txtWidth;
            }
            ctx.fillText(line, x, txt.position.y + i * lineHeight);
          });

          // Restore context if rotation was applied
          if (txt.style.rotation) {
            ctx.restore();
          }
        }

        // Convert canvas to blob
        return new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
        });
      } catch (error) {
        console.error(`Error capturing canvas content for box ${boxIndex}:`, error);
        return null;
      }
    },

    getTotalBoxes: () => canvasCount,
  }));

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
        const selectedText = texts.find((txt) => txt.id === selectedItemId);

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
        } else if (selectedText) {
          // Handle text resizing
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          // Calculate new width and height
          const newWidth = Math.max(
            50,
            typeof resizeStart.width === "number" ? resizeStart.width + deltaX : 100 + deltaX,
          );
          const newHeight = Math.max(
            20,
            typeof resizeStart.height === "number" ? resizeStart.height + deltaY : 50 + deltaY,
          );

          // Update text size
          dispatch(
            updateTextSize({
              id: selectedItemId,
              size: {
                width: newWidth as number,
                height: newHeight as number,
              },
            }),
          );

          // Optionally adjust font size based on width change
          const fontSizeAdjustment = deltaX * 0.05; // Subtle adjustment based on width change
          if (Math.abs(fontSizeAdjustment) > 0.5) {
            // Only adjust if change is significant
            const currentFontSize = selectedText.style.fontSize;
            const newFontSize = Math.max(8, Math.min(72, currentFontSize + fontSizeAdjustment));

            // Update font size if it changed
            if (newFontSize !== currentFontSize) {
              dispatch(
                updateTextStyle({
                  id: selectedItemId,
                  style: {
                    ...selectedText.style,
                    fontSize: newFontSize,
                  },
                }),
              );
            }
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
  const estimateTextDimensions = (content: string, fontSize: number, fontFamily?: string) => {
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
  const handleSaveEditedText = (
    content: string,
    style?: {
      fontSize: number;
      color: string;
      fontFamily?: string;
      fontWeight?: string;
      rotation?: number;
    },
  ) => {
    if (editingTextId) {
      const textToUpdate = texts.find((txt) => txt.id === editingTextId);
      if (textToUpdate) {
        // Calculate new font size
        const fontSize = style?.fontSize || textToUpdate.style.fontSize;
        const fontFamily = style?.fontFamily || textToUpdate.style.fontFamily;

        // Calculate new dimensions
        const { width, height } = estimateTextDimensions(content, fontSize, fontFamily);

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
            style: {
              ...textToUpdate.style,
              ...(style || {}),
            },
          }),
        );

        // Update text size based on new content
        dispatch(
          updateTextSize({
            id: editingTextId,
            size: {
              width: width as number,
              height: height as number,
            },
          }),
        );
      }
      setShowTextEditor(false);
      setEditingTextId(null);
    }
  };

  // Handle editing an image
  const handleEditImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const imageToEdit = images.find((img) => img.id === id);
    if (imageToEdit) {
      setImageToEdit({
        id: imageToEdit.id,
        src: imageToEdit.src,
      });
      setIsEditImageDialogOpen(true);
    }
  };

  // Handle save edited image
  const handleSaveEditedImage = (editedImageUrl: string, selectedMedia: Media) => {
    if (!imageToEdit) return;

    // Update the image with edited version
    const updatedImages = images.map((img) =>
      img.id === imageToEdit.id ? { ...img, src: editedImageUrl } : img,
    );

    dispatch(setImages(updatedImages));
    setIsEditImageDialogOpen(false);
    setImageToEdit(null);
  };

  // Handle replacing an image
  const handleReplaceImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const image = images.find((img) => img.id === id);
    if (image) {
      setImageToReplace({
        id: image.id,
        position: image.position,
        size: image.size,
      });
      setIsReplaceImageDialogOpen(true);
    }
  };

  // Handle media selection for image replacement
  const handleMediaSelect = (selectedMedia: Media[]) => {
    if (!imageToReplace || selectedMedia.length === 0) return;

    // Get the last selected media (most recently added)
    const newMedia = selectedMedia[selectedMedia.length - 1];

    // Update the image with the new media while keeping position and size
    const updatedImages = images.map((img) =>
      img.id === imageToReplace.id
        ? {
            ...img,
            id: newMedia.id, // Update ID to the new media ID
            src: newMedia.url, // Update source to the new media URL
          }
        : img,
    );

    dispatch(setImages(updatedImages));
    setIsReplaceImageDialogOpen(false);
    setImageToReplace(null);
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
          const isHovered = hoveredImageId === img.id;

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
              onMouseEnter={() => setHoveredImageId(img.id)}
              onMouseLeave={() => setHoveredImageId(null)}
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
                    onClick={(e) => handleEditImage(img.id, e)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  {/* X button for quick removal */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeItem(img.id));
                    }}
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
                    onClick={(e) => handleReplaceImage(img.id, e)}
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
          const textSize =
            txt.size ||
            estimateTextDimensions(txt.content, txt.style.fontSize, txt.style.fontFamily);
          const rotation = txt.style.rotation || 0;

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
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
              onClick={(e) => handleSelectItem(txt.id, e)}
              onMouseDown={(e) => handleDragStart(e, txt.position)}
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
              )}

              {/* Resize handle - only visible when selected */}
              {isSelected && (
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize flex items-center justify-center"
                  onMouseDown={(e) => {
                    // Ensure we have numeric values for width and height
                    const width = typeof txt.size?.width === "number" ? txt.size.width : 100;
                    const height = typeof txt.size?.height === "number" ? txt.size.height : 50;
                    handleResizeStart(e, { width, height });
                  }}
                >
                  <div className="w-2 h-2 bg-white"></div>
                </div>
              )}
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
    <div className="relative h-fit w-full bg-gray-50 shadow rounded-lg p-3 flex flex-col gap-2 overflow-x-auto">
      <p className="w-full text-center text-sm text-gray-600">
        Canvas Size: {widthMm}mm × {heightMm}mm ({aspectRatio})
      </p>

      <div className="max-w-6xl mx-auto overflow-x-auto">
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

      {/* Image Editor Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          {imageToEdit && (
            <ImageEditor
              selectedImage={{
                id: imageToEdit.id,
                url: imageToEdit.src,
                type: "image",
              }}
              onSave={handleSaveEditedImage}
              onCancel={() => setIsEditImageDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Image Replacement Dialog */}
      <Dialog open={isReplaceImageDialogOpen} onOpenChange={setIsReplaceImageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Replace Image</DialogTitle>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Select a new image to replace the current one. Position and size will be maintained.
            </p>
            <MediaUploader
              onlyTriggerButton={false}
              onMediaChange={handleMediaSelect}
              modalMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default Canvas;
