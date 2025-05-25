import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  setImages,
  setText,
  recalculateSectionAssignments,
  setGridSize,
  setSocialPlatform,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import Canvas, { CanvasRef } from "./Canvas";
import TextEditor from "./TextEditor";
import Preview, { PreviewRef } from "./Preview";
import { apiService } from "./apiService";
import { Media } from "@/components/post/MediaUploader";
import { useUploadMultipleMedia } from "@/api/apiHooks/useMedia";
import { toast } from "sonner";
import { setIsTemplateSectionOpen, setMediaUrls } from "@/redux/slices/postCreation.slice";
import CanvasOptions from "./CanvasOptions";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Loader2 } from "lucide-react";
import ImageGallery from "./ImageGallery";

interface TemplateEditModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTemplateData?: any;
  socialPlatform?: string | null;
}

// Supported social platforms
const SUPPORTED_PLATFORMS = ["instagram", "facebook", "twitter", "linkedin", "tiktok"];

// Upload timeout in milliseconds
const UPLOAD_TIMEOUT = 30000; // 30 seconds

const TemplateEditModal = ({
  open,
  onOpenChange,
  initialTemplateData,
  socialPlatform,
}: TemplateEditModalProps = {}) => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts, gridSize } = useSelector(
    (state: RootState) => state.template,
  );
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<PreviewRef>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const [columns, setColumns] = useState(gridSize?.columns || 3);
  const [rows, setRows] = useState(gridSize?.rows || Math.ceil(canvasCount / columns));
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(open || false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const { mutate: uploadMultipleMedia, isPending: isUploading } = useUploadMultipleMedia();

  console.log("isLoading Grid", isLoading);

  // Handle external open state changes
  useEffect(() => {
    if (open !== undefined) {
      setDialogOpen(open);
    }
  }, [open]);

  // Process initialTemplateData if provided
  useEffect(() => {
    if (initialTemplateData) {
      try {
        // Validate initialTemplateData structure
        if (!initialTemplateData.template) {
          console.warn("Invalid template data: missing template property");
          return;
        }

        // Extract gridSize
        if (initialTemplateData.template && initialTemplateData.template.gridSize) {
          // Validate grid size
          const { columns: cols, rows: rs } = initialTemplateData.template.gridSize;
          if (typeof cols === "number" && cols > 0 && typeof rs === "number" && rs > 0) {
            dispatch(setGridSize(initialTemplateData.template.gridSize));
            setColumns(cols);
            setRows(rs);
          } else {
            console.warn("Invalid grid size in template data");
          }
        }

        // Extract social platform if available
        if (initialTemplateData.template && initialTemplateData.template.socialPlatform) {
          // Validate social platform
          const platform = initialTemplateData.template.socialPlatform.toLowerCase();
          if (SUPPORTED_PLATFORMS.includes(platform)) {
            dispatch(setSocialPlatform(platform));
          } else {
            console.warn(`Unsupported social platform: ${platform}`);
            // Use default or fallback to provided socialPlatform
            if (socialPlatform && SUPPORTED_PLATFORMS.includes(socialPlatform.toLowerCase())) {
              dispatch(setSocialPlatform(socialPlatform));
            }
          }
        } else if (socialPlatform && SUPPORTED_PLATFORMS.includes(socialPlatform.toLowerCase())) {
          dispatch(setSocialPlatform(socialPlatform));
        }

        // Extract images with deduplication
        const allImages = [];
        const seenImageIds = new Set();

        if (initialTemplateData.template.sections) {
          for (const section of initialTemplateData.template.sections) {
            if (!Array.isArray(section.images)) {
              continue; // Skip invalid sections
            }

            for (const image of section.images || []) {
              // Validate image object
              if (!image || !image.id || !image.src) {
                continue; // Skip invalid images
              }

              // Only add image if we haven't seen its ID before
              if (!seenImageIds.has(image.id)) {
                // Remove clipping info which is calculated dynamically
                const { clipping, ...imageWithoutClipping } = image;
                allImages.push(imageWithoutClipping);
                seenImageIds.add(image.id);
              }
            }
          }
          if (allImages.length > 0) {
            dispatch(setImages(allImages));
          }
        }
      } catch (error) {
        console.error("Error processing template data:", error);
        toast.error("Invalid template data format", { position: "top-center" });
      }
    } else if (socialPlatform) {
      dispatch(setSocialPlatform(socialPlatform));
    }
  }, [initialTemplateData, socialPlatform, dispatch]);

  // Update grid size whenever columns or rows change
  useEffect(() => {
    dispatch(setGridSize({ columns, rows }));
  }, [columns, rows, dispatch]);

  // Recalculate sections assignment whenever canvas count or images/texts position changes
  useEffect(() => {
    dispatch(recalculateSectionAssignments());
  }, [canvasCount, aspectRatio, images, texts, dispatch]);

  const handleOpenChange = (open: boolean) => {
    // Reset processing error when opening
    if (open) {
      setProcessingError(null);
    }

    if (!open && (images.length > 0 || texts.length > 0)) {
      // If trying to close and there are unsaved changes
      setShowCloseAlert(true);
    } else {
      setDialogOpen(open);
      if (onOpenChange) {
        onOpenChange(open);
      }
    }
  };

  const handleConfirmClose = () => {
    setShowCloseAlert(false);
    setDialogOpen(false);
    setIsLoading(false); // Ensure loading state is reset
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCancelClose = () => {
    setShowCloseAlert(false);
  };

  const handleCancelProcessing = () => {
    setIsLoading(false);
    setProcessingError(null);
    toast.info("Processing cancelled", { position: "top-center" });
  };

  // Helper to position an image centered on the canvas
  const getDefaultImagePosition = (imageWidth: number, imageHeight: number) => {
    // Each cell size in mm (50mm x 50mm per cell)
    const CELL_SIZE_MM = 50;
    // Approximate conversion factor from mm to pixels for screen display
    const PX_PER_MM = 3.78;
    // Cell size in pixels
    const CELL_SIZE_PX = CELL_SIZE_MM * PX_PER_MM;

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
    const canvasWidth = cellWidth * columns;
    const canvasHeight = cellHeight * rows;

    // Center the image on canvas
    return {
      x: Math.max(0, (canvasWidth - imageWidth) / 2),
      y: Math.max(0, (canvasHeight - imageHeight) / 2),
    };
  };

  const handleMediaChange = (selectedMedia: Media[]) => {
    if (!selectedMedia || selectedMedia.length === 0) {
      return;
    }

    // Get the last selected media (most recently added)
    const newMedia = selectedMedia[selectedMedia.length - 1];

    // Validate media object
    if (!newMedia || !newMedia.id || !newMedia.url) {
      toast.error("Invalid media selected", { position: "top-center" });
      return;
    }

    // Check if this image ID already exists in the images array
    const existingImageIndex = images.findIndex((img) => img.id === newMedia.id);
    if (existingImageIndex !== -1) {
      // Image already exists, skip adding it
      return;
    }

    // Create a temporary image to get dimensions
    const img = new Image();

    // Handle image loading errors
    img.onerror = () => {
      toast.error("Failed to load image. Please try another one.", { position: "top-center" });
    };

    img.onload = () => {
      // Calculate appropriate size to fit in canvas (max 70% of canvas height)
      const maxHeight = 384 * 0.7; // 70% of canvas height
      let newWidth = img.width;
      let newHeight = img.height;

      if (newHeight > maxHeight) {
        const ratio = maxHeight / newHeight;
        newWidth = newWidth * ratio;
        newHeight = maxHeight;
      }

      // Get centered position
      const position = getDefaultImagePosition(newWidth, newHeight);

      const templateImage = {
        id: newMedia.id,
        src: newMedia.url,
        position,
        size: { width: newWidth, height: newHeight },
        canvasIndex: 0, // This will be updated by recalculateSectionAssignments
      };

      dispatch(setImages([...images, templateImage]));
    };

    // Set crossOrigin to anonymous to handle CORS issues
    img.crossOrigin = "Anonymous";
    img.src = newMedia.url;
  };

  const handleAddText = () => {
    setShowTextEditor(true);
  };

  // Helper function to estimate text dimensions
  const estimateTextDimensions = (content: string, fontSize: number) => {
    if (!content) {
      return { width: 100, height: fontSize * 1.2 };
    }

    // Split text by line breaks
    const lines = content.split("\n");

    // Find the longest line
    let maxLineLength = 0;
    for (const line of lines) {
      maxLineLength = Math.max(maxLineLength, line.length);
    }

    // Calculate estimated width based on longest line
    const estimatedWidth = Math.max(50, maxLineLength * fontSize * 0.6);

    // Calculate canvas width based on aspect ratio
    let canvasWidth = 0;
    const canvasHeight = 384; // Fixed canvas height

    switch (aspectRatio) {
      case "16:9":
        canvasWidth = (canvasHeight * 16) / 9;
        break;
      case "1:1":
        canvasWidth = canvasHeight;
        break;
      case "4:5":
        canvasWidth = (canvasHeight * 4) / 5;
        break;
      default:
        canvasWidth = canvasHeight;
    }

    // Limit width to canvas width minus some padding
    const maxWidth = canvasWidth - 20; // 10px padding on each side
    const finalWidth = Math.min(estimatedWidth, maxWidth);

    // Calculate estimated height based on number of lines
    const lineHeight = fontSize * 1.2;
    const estimatedHeight = Math.max(fontSize, lineHeight * Math.max(1, lines.length));

    return { width: finalWidth, height: estimatedHeight };
  };

  const handleSaveText = (text: string, style?: { fontSize: number; color: string }) => {
    if (!text.trim()) {
      toast.error("Text cannot be empty", { position: "top-center" });
      return;
    }

    const fontSize = style?.fontSize || 16;
    // Calculate dimensions based on content
    const { width, height } = estimateTextDimensions(text, fontSize);

    const newText = {
      id: `text-${Date.now()}`,
      content: text,
      position: { x: 50, y: 50 },
      style: style || { fontSize: 16, color: "#000000" },
      size: { width, height },
      canvasIndex: 0, // Will be updated by recalculateSectionAssignments
    };
    dispatch(setText([...texts, newText]));
    setShowTextEditor(false);
  };

  // Process cells to capture as images
  const processCells = async (onComplete: (uploadedImages: Media[]) => void) => {
    // Reset any previous errors
    setProcessingError(null);

    try {
      // Check if we have a valid canvas reference
      if (!canvasRef.current) {
        const errorMsg = "Canvas not available";
        setProcessingError(errorMsg);
        toast.error(errorMsg, { position: "top-center" });
        setIsLoading(false);
        return;
      }

      const totalCells = canvasRef.current.getTotalCells();

      // Validate that we have cells to process
      if (totalCells <= 0) {
        const errorMsg = "No cells to process";
        setProcessingError(errorMsg);
        toast.error(errorMsg, { position: "top-center" });
        setIsLoading(false);
        return;
      }

      // First process all cells to get image blobs
      const imageBlobs: Blob[] = [];

      for (let i = 0; i < totalCells; i++) {
        try {
          // Use native canvas API to capture each cell
          const blob = await canvasRef.current.captureCanvasContent(i);

          if (!blob) {
            const errorMsg = `Failed to create image for cell ${i + 1}`;
            setProcessingError(errorMsg);
            toast.error(errorMsg, { position: "top-center" });
            continue;
          }

          // Add blob to our collection
          imageBlobs.push(blob);
        } catch (error) {
          console.error(`Error processing cell ${i + 1}:`, error);
          const errorMsg = `Failed to process cell ${i + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          setProcessingError(errorMsg);
          toast.error(errorMsg, { position: "top-center" });
        }
      }

      // Check if we have any successful image blobs
      if (imageBlobs.length === 0) {
        const finalErrorMsg = "No cells were successfully processed";
        setProcessingError(finalErrorMsg);
        toast.error(finalErrorMsg, { position: "top-center" });
        setIsLoading(false);
        return;
      }

      // Create one FormData for all images
      const formData = new FormData();
      const postId = uuidv4();

      // Append all blobs to the same formData
      imageBlobs.forEach((blob, index) => {
        formData.append("files", blob, `grid-cell-${index + 1}.png`);
      });

      formData.append("postId", postId);

      // Upload all images in one API call
      uploadMultipleMedia(formData, {
        onSuccess: (response) => {
          if (response?.data?.urls && Array.isArray(response.data.urls)) {
            const uploadedImages: Media[] = response.data.urls.map((item) => ({
              id: item.id,
              url: item.url,
              type: "image",
            }));

            if (uploadedImages.length === 0) {
              const finalErrorMsg = "No cells were successfully uploaded";
              setProcessingError(finalErrorMsg);
              toast.error(finalErrorMsg, { position: "top-center" });
              setIsLoading(false);
              return;
            }

            onComplete(uploadedImages);
          } else {
            const errorMsg = "Invalid response from server";
            setProcessingError(errorMsg);
            toast.error(errorMsg, { position: "top-center" });
            setIsLoading(false);
          }
        },
        onError: (error) => {
          console.error("Error uploading grid cells:", error);
          const errorMsg = "Failed to upload cells";
          setProcessingError(errorMsg);
          toast.error(errorMsg, { position: "top-center" });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error processing cells:", error);
      const errorMsg = `Failed to process grid cells: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      setProcessingError(errorMsg);
      toast.error(errorMsg, { position: "top-center" });
      setIsLoading(false);
    }
  };

  const handleTemplateSaveAndUse = async (isSave: boolean) => {
    // Validate that we have content to process
    if (images.length === 0 && texts.length === 0) {
      const errorMsg = "Cannot process empty template. Please add images or text.";
      setProcessingError(errorMsg);
      toast.error(errorMsg, { position: "top-center" });
      return;
    }

    setIsLoading(true);
    setProcessingError(null);

    try {
      // Ensure sections are calculated correctly before processing
      dispatch(recalculateSectionAssignments());

      // Process cells and save the template
      processCells(async (uploadedImages) => {
        // Validate we have images to process
        if (uploadedImages.length === 0) {
          const errorMsg = "No images were successfully processed";
          setProcessingError(errorMsg);
          toast.error(errorMsg, { position: "top-center" });
          setIsLoading(false);
          return;
        }

        // Extract URLs for the API
        const outputUrls = uploadedImages.map((img) => img.url);

        try {
          // Set a timeout for the API call
          const apiPromise = apiService.processTemplate({
            canvasCount,
            aspectRatio,
            backgroundColor,
            gridSize: { columns, rows },
            images,
            texts,
            outputUrls,
            socialPlatform,
          });

          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("API request timed out")), 30000); // 30 seconds timeout
          });

          // Race the API call against the timeout
          const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

          if (response.success) {
            console.log(
              isSave ? "Template saved successfully:" : "Template processed successfully:",
              response.data,
            );

            // Add media URLs to post creation state if not saving
            if (!isSave) {
              dispatch(setMediaUrls(uploadedImages));
            }

            // Show success toast
            toast.success(
              isSave
                ? "Template saved and processed successfully!"
                : "Template added to post composer",
              {
                position: "top-center",
              },
            );

            // Close the dialog only on success
            handleConfirmClose();
            dispatch(setIsTemplateSectionOpen(false));
          } else {
            const errorMsg = response.error || "Unknown error occurred";
            setProcessingError(errorMsg);
            throw new Error(errorMsg);
          }
        } catch (error) {
          console.error("Error processing template:", error);
          const errorMsg =
            error instanceof Error ? error.message : "Error processing template. Please try again.";
          setProcessingError(errorMsg);
          toast.error(errorMsg, { position: "top-center" });
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error processing template:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to process template. Please try again.";
      setProcessingError(errorMsg);
      toast.error(errorMsg, { position: "top-center" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {!open && (
          <DialogTrigger asChild>
            <Button>Create Custom Grid</Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-8xl h-full overflow-y-auto">
          <DialogHeader className="h-fit">
            <DialogTitle className="text-center">Edit Grid Template</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 relative h-full w-full items-start">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {processingError ? `Error: ${processingError}` : "Processing template..."}
                  </p>
                  {processingError && (
                    <Button variant="outline" size="sm" onClick={handleCancelProcessing}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-10 gap-2 w-full">
              <div className="col-span-7 h-fit grid gap-2">
                <div className="bg-white rounded-lg shadow p-1">
                  <ImageGallery />
                </div>

                <Canvas ref={canvasRef} />
              </div>

              <div className="col-span-3 h-fit space-y-2">
                <CanvasOptions
                  handleTemplateSaveAndUse={handleTemplateSaveAndUse}
                  isLoading={isLoading}
                  columns={columns}
                  setColumns={setColumns}
                  rows={rows}
                  setRows={setRows}
                  handleMediaChange={handleMediaChange}
                  handleAddText={handleAddText}
                />

                <Preview ref={previewRef} />
              </div>
            </div>

            {/* <div>
              <Separator />
              <Separator />
              <Separator />

              <div className="grid grid-cols-7 gap-2 w-full h-fit">
                <div className="col-span-5 h-full">
                  <Preview ref={previewRef} />
                </div>

                <div className="col-span-2 h-full">
                  <CanvasOptions
                    handleTemplateSaveAndUse={handleTemplateSaveAndUse}
                    isLoading={isLoading}
                    columns={columns}
                    setColumns={setColumns}
                    rows={rows}
                    setRows={setRows}
                  />
                </div>
              </div>

              <div className="w-full">
                <ContentAndMediaManager
                  handleMediaChange={handleMediaChange}
                  handleAddText={handleAddText}
                />
              </div>

              <div className="w-full">
                <Canvas ref={canvasRef} />
              </div>
            </div> */}
          </div>

          {showTextEditor && !isLoading && (
            <TextEditor onSave={handleSaveText} onCancel={() => setShowTextEditor(false)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showCloseAlert}
        onOpenChange={setShowCloseAlert}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        variant="destructive"
      />
    </>
  );
};

export default TemplateEditModal;
