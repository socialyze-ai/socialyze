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
  setSocialPlatform,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import Canvas from "./Canvas";
import TextEditor from "./TextEditor";
import Preview, { PreviewRef } from "./Preview";
import { apiService } from "./apiService";
import { Media } from "@/components/post/MediaUploader";
import { useUploadMedia } from "@/api/apiHooks/useMedia";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { setMediaUrls } from "@/redux/slices/postCreation.slice";
import CanvasOptions from "./CanvasOptions";
import ContentAndMediaManager from "./ContentAndMediaManager";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Loader2 } from "lucide-react";

interface TemplateEditModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTemplateData?: any;
  socialPlatform?: string | null;
}

const TemplateEditModal = ({
  open,
  onOpenChange,
  initialTemplateData,
  socialPlatform,
}: TemplateEditModalProps = {}) => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<PreviewRef>(null);
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(open || false);

  console.log("isLoading Carousel", isLoading);

  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();

  // Handle external open state changes
  useEffect(() => {
    if (open !== undefined) {
      setDialogOpen(open);
    }
  }, [open]);

  // Process initialTemplateData if provided
  useEffect(() => {
    if (initialTemplateData) {
      // Extract social platform if available
      if (initialTemplateData.template && initialTemplateData.template.socialPlatform) {
        dispatch(setSocialPlatform(initialTemplateData.template.socialPlatform));
      } else if (socialPlatform) {
        dispatch(setSocialPlatform(socialPlatform));
      }

      // Extract images with deduplication
      const allImages = [];
      const seenImageIds = new Set();

      if (initialTemplateData.template && initialTemplateData.template.sections) {
        for (const section of initialTemplateData.template.sections) {
          for (const image of section.images || []) {
            // Only add image if we haven't seen its ID before
            if (!seenImageIds.has(image.id)) {
              // Remove clipping info which is calculated dynamically
              const { clipping, ...imageWithoutClipping } = image;
              allImages.push(imageWithoutClipping);
              seenImageIds.add(image.id);
            }
          }
        }
        dispatch(setImages(allImages));
      }
    } else if (socialPlatform) {
      dispatch(setSocialPlatform(socialPlatform));
    }
  }, [initialTemplateData, socialPlatform, dispatch]);

  // Recalculate sections assignment whenever canvas count or images/texts position changes
  useEffect(() => {
    dispatch(recalculateSectionAssignments());
  }, [canvasCount, aspectRatio, images, texts, dispatch]);

  const handleOpenChange = (open: boolean) => {
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
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCancelClose = () => {
    setShowCloseAlert(false);
  };

  // Helper to position an image centered on the canvas
  const getDefaultImagePosition = (imageWidth: number, imageHeight: number) => {
    // Calculate canvas dimensions based on aspect ratio
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
        canvasWidth = (canvasHeight * 16) / 9;
    }

    // Center the image on canvas (without considering sections)
    return {
      x: Math.max(0, (canvasWidth - imageWidth) / 2),
      y: Math.max(0, (canvasHeight - imageHeight) / 2),
    };
  };

  const handleMediaChange = (selectedMedia: Media[]) => {
    if (selectedMedia && selectedMedia.length > 0) {
      // Get the last selected media (most recently added)
      const newMedia = selectedMedia[selectedMedia.length - 1];

      // Check if this image ID already exists in the images array
      const existingImageIndex = images.findIndex((img) => img.id === newMedia.id);
      if (existingImageIndex !== -1) {
        // Image already exists, skip adding it
        return;
      }

      // Create a temporary image to get dimensions
      const img = new Image();
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
      img.src = newMedia.url;
    }
  };

  const handleAddText = () => {
    setShowTextEditor(true);
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
        canvasWidth = (canvasHeight * 16) / 9;
    }

    // Limit width to canvas width minus some padding
    const maxWidth = canvasWidth - 20; // 10px padding on each side
    const finalWidth = Math.min(estimatedWidth, maxWidth);

    // Calculate estimated height based on number of lines
    const lineHeight = fontSize * 1.2;
    const estimatedHeight = lineHeight * Math.max(1, lines.length);

    return { width: finalWidth, height: estimatedHeight };
  };

  const handleSaveText = (text: string, style?: { fontSize: number; color: string }) => {
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

  // Generic function to process slides
  const processSlides = async (onComplete: (uploadedImages: Media[]) => void) => {
    try {
      // Check if we have a valid preview reference
      if (!previewRef.current) {
        toast.error("Preview not available", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      const totalSlides = previewRef.current.getTotalSlides();
      const uploadedImages: Media[] = [];

      // Process each slide/box
      for (let i = 0; i < totalSlides; i++) {
        // Navigate to the slide
        previewRef.current.goToSlide(i);

        // Wait for the slide to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the canvas content element
        const canvasContentElement = previewRef.current.getCanvasContentElement();
        if (!canvasContentElement) {
          toast.error(`Failed to capture content for slide ${i + 1}`, { position: "top-center" });
          continue;
        }

        // Convert the preview to a canvas
        const canvas = await html2canvas(canvasContentElement, {
          backgroundColor,
          scale: 2, // Higher quality
          logging: false,
          removeContainer: false,
          allowTaint: true,
          useCORS: true,
        });

        // Convert canvas to blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              toast.error(`Failed to create image for slide ${i + 1}`, { position: "top-center" });
              return;
            }

            // Create form data for upload
            const formData = new FormData();
            formData.append("file", blob, `template-section-${i + 1}.png`);
            formData.append("postId", uuidv4());

            // Upload the image
            uploadMedia(formData, {
              onSuccess: (response) => {
                if (response?.data?.url) {
                  // Add to uploaded images array
                  uploadedImages.push({
                    id: uuidv4(),
                    url: response.data.url,
                    type: "image",
                  });

                  // When all images are uploaded, call the completion handler
                  if (uploadedImages.length === totalSlides) {
                    onComplete(uploadedImages);
                  }
                }
              },
              onError: (error) => {
                console.error("Error uploading template section:", error);
                toast.error(`Failed to upload slide ${i + 1}`, { position: "top-center" });
              },
            });
          },
          "image/png",
          0.9,
        );
      }
    } catch (error) {
      console.error("Error processing slides:", error);
      toast.error("Failed to process slides", { position: "top-center" });
      setIsLoading(false);
    }
  };

  const handleTemplateSaveAndUse = async (isSave: boolean = false) => {
    setIsLoading(true);
    try {
      // Ensure sections are calculated correctly before processing
      dispatch(recalculateSectionAssignments());

      // Process slides and save the template
      processSlides(async (uploadedImages) => {
        // Extract URLs for the API
        const outputUrls = uploadedImages.map((img) => img.url);

        // Call API service to process template with the uploaded image URLs
        apiService
          .processTemplate({
            canvasCount,
            aspectRatio,
            backgroundColor,
            images,
            texts,
            outputUrls,
            socialPlatform,
          })
          .then((response) => {
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
            } else {
              throw new Error(response.error || "Unknown error occurred");
            }
          })
          .catch((error) => {
            console.error("Error processing template:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Error processing template. Please try again.",
              { position: "top-center" },
            );
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
    } catch (error) {
      console.error("Error processing template:", error);
      toast.error("Failed to process template", { position: "top-center" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {!open && (
          <DialogTrigger asChild>
            <Button>Create Custom Carousel</Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-7xl h-5/6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 relative">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing template...</p>
                </div>
              </div>
            )}

            {/* Preview at the top */}
            <div className="grid grid-cols-7 gap-2 w-full h-fit">
              <div className="col-span-5 h-full">
                <Preview ref={previewRef} />
              </div>

              <div className="col-span-2 h-full">
                <CanvasOptions
                  handleTemplateSaveAndUse={handleTemplateSaveAndUse}
                  isLoading={isLoading}
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
              <Canvas />
            </div>
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
