import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  updateTextContent,
  updateTextStyle,
  updateTextSize,
  removeItem,
  setImages,
} from "@/redux/slices/template.slice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Media } from "../../../MediaUploader";
import ImageEditor from "../../../editor/ImageEditor";
import MediaUploader from "../../../MediaUploader";

// Import types
import {
  CanvasRef,
  ImageToEdit,
  ImageToReplace,
  CanvasImageItem,
  CanvasTextItem,
  TextItem,
} from "./types";

// Import components
import CanvasImage from "./CanvasImage";
import CanvasText from "./CanvasText";
import ReferenceLines from "./ReferenceLines";
import TextEditor from "../TextEditor";

// Import hooks
import { useCanvasItems } from "./hooks/useCanvasItems";
import { useCanvasCapture } from "./hooks/useCanvasCapture";

// Import utils
import { estimateTextDimensions, getCanvasDimensionsInMm, getAspectRatioStyle } from "./utils";

const Canvas = forwardRef<CanvasRef, {}>((props, ref) => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts, selectedItemId } = useSelector(
    (state: RootState) => state.template,
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  // State for dialogs and editors
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<ImageToEdit | null>(null);
  const [isReplaceImageDialogOpen, setIsReplaceImageDialogOpen] = useState(false);
  const [imageToReplace, setImageToReplace] = useState<ImageToReplace | null>(null);

  // Use custom hooks
  const {
    isDragging,
    isResizing,
    hoveredImageId,
    setHoveredImageId,
    handleSelectItem,
    handleCanvasClick,
    handleDragStart,
    handleResizeStart,
  } = useCanvasItems();

  // Canvas capture functionality
  const { captureCanvasContent, getTotalBoxes } = useCanvasCapture(
    canvasRef,
    images,
    texts as TextItem[],
    backgroundColor,
    canvasCount,
    aspectRatio,
  );

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    captureCanvasContent,
    getTotalBoxes,
  }));

  // Handle editing text
  const handleEditText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToEdit = texts.find((txt) => txt.id === id);
    if (textToEdit) {
      setEditingTextId(id);
      setShowTextEditor(true);
    }
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
        const { width, height } = estimateTextDimensions(
          content,
          fontSize,
          fontFamily,
          aspectRatio,
          canvasCount,
        );

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

  // Handle item deletion
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeItem(id));
  };

  // Render all items on the canvas
  const renderCanvasItems = () => {
    // Combine images and texts into a single array
    const allItems = [
      ...images.map((img) => ({ ...img, type: "image" as const })),
      ...texts.map((txt) => ({ ...txt, type: "text" as const })),
    ];

    // Sort items by z-index (lowest first, so higher z-index items render on top)
    const sortedItems = [...allItems].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <>
        {sortedItems.map((item) => {
          if (item.type === "image") {
            const img = item as CanvasImageItem;
            const isSelected = selectedItemId === img.id;
            const isHovered = hoveredImageId === img.id;

            return (
              <CanvasImage
                key={img.id}
                img={img}
                isSelected={isSelected}
                isHovered={isHovered}
                onSelectItem={handleSelectItem}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                onEditImage={handleEditImage}
                onReplaceImage={handleReplaceImage}
                onRemoveItem={handleDeleteItem}
                onMouseEnter={setHoveredImageId}
                onMouseLeave={() => setHoveredImageId(null)}
              />
            );
          } else {
            // Text item
            const txt = item as CanvasTextItem;
            const isSelected = selectedItemId === txt.id;
            const textSize =
              txt.size ||
              estimateTextDimensions(txt.content, txt.style.fontSize, txt.style.fontFamily);

            return (
              <CanvasText
                key={txt.id}
                txt={txt}
                isSelected={isSelected}
                textSize={textSize}
                onSelectItem={handleSelectItem}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                onEditText={handleEditText}
                onRemoveItem={handleDeleteItem}
              />
            );
          }
        })}
      </>
    );
  };

  const { widthMm, heightMm } = getCanvasDimensionsInMm(aspectRatio, canvasCount);
  const canvasStyle = getAspectRatioStyle(aspectRatio, canvasCount);
  const canvasWidth = parseFloat(canvasStyle.width);

  return (
    <div className="w-full h-full bg-gray-50 shadow rounded-lg p-3">
      <p className="w-full text-center text-sm text-gray-600">
        Canvas Size: {widthMm}mm × {heightMm}mm ({aspectRatio})
      </p>

      <div className="relative h-full w-full flex flex-col gap-2 overflow-x-auto">
        <div className="max-w-6xl mx-auto my-auto">
          <div
            ref={canvasRef}
            className={`relative border border-gray-300 ${
              selectedItemId ? "overflow-visible" : "overflow-hidden"
            }`}
            style={{
              ...canvasStyle,
              position: "relative",
              backgroundColor,
              userSelect: "none",
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
              <ReferenceLines canvasCount={canvasCount} canvasWidth={canvasWidth} />

              {/* Canvas items */}
              {renderCanvasItems()}
            </div>
          </div>
        </div>

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
                isTemplateEditor={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
});

export default Canvas;
