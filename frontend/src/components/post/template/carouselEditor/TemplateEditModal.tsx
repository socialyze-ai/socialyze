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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type, Save } from "lucide-react";
import {
  setImages,
  setText,
  setAspectRatio,
  setCanvasCount,
  setBackgroundColor,
  recalculateSectionAssignments,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import Canvas from "./Canvas";
import TextEditor from "./TextEditor";
import Preview, { PreviewRef } from "./Preview";
import { apiService } from "./apiService";
import { Media } from "@/components/post/MediaUploader";
import MediaUploader from "@/components/post/MediaUploader";
import ImageGallery from "./ImageGallery";
import { useUploadMedia } from "@/api/apiHooks/useMedia";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { setMediaUrls } from "@/redux/slices/postCreation.slice";

interface TemplateEditModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialTemplateData?: any;
}

const TemplateEditModal = ({
  open,
  onOpenChange,
  initialTemplateData,
}: TemplateEditModalProps = {}) => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<PreviewRef>(null);

  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();

  // Process initialTemplateData if provided
  useEffect(() => {
    if (initialTemplateData) {
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
    }
  }, [initialTemplateData, dispatch]);

  // Recalculate sections assignment whenever canvas count or images/texts position changes
  useEffect(() => {
    dispatch(recalculateSectionAssignments());
  }, [canvasCount, aspectRatio, images, texts, dispatch]);

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
                setIsLoading(false);
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

  const handleTemplateSaveAndUse = async ({ isSave = false }: { isSave: boolean }) => {
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
          })
          .then((response) => {
            if (response.success) {
              console.log(
                isSave ? "Template saved successfully:" : "Template processed successfully:",
                response.data,
              );
              if (onOpenChange) {
                onOpenChange(false);
              }
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
            if (!isSave) {
              dispatch(setMediaUrls(uploadedImages));
            }
            if (onOpenChange) {
              onOpenChange(false);

              toast.success(
                isSave
                  ? "Template saved and processed successfully!"
                  : "Template added to post composer",
                {
                  position: "top-center",
                },
              );
            }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!open && (
        <DialogTrigger asChild>
          <Button>Edit</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-6xl h-5/6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview at the top */}
          <div className="flex gap-2 w-full">
            <div className="w-full">
              <Preview ref={previewRef} />
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Canvas Options</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Number of Sections</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={canvasCount}
                        onChange={(e) => dispatch(setCanvasCount(parseInt(e.target.value) || 1))}
                        className="w-20"
                      />
                      <Slider
                        value={[canvasCount]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => dispatch(setCanvasCount(value[0]))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Aspect Ratio</label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value) => dispatch(setAspectRatio(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="4:5">4:5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => dispatch(setBackgroundColor(e.target.value))}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => dispatch(setBackgroundColor(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium mb-2">Content</h3>
                <div className="flex gap-2">
                  <MediaUploader onlyTriggerButton={true} onMediaChange={handleMediaChange} />

                  <Button variant="outline" className="flex-1" onClick={handleAddText}>
                    <Type className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                </div>
              </div>

              <ImageGallery />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleTemplateSaveAndUse({ isSave: true })}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleTemplateSaveAndUse({ isSave: false })}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Use"}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 h-96">
            <Canvas />
          </div>
        </div>

        {showTextEditor && (
          <TextEditor onSave={handleSaveText} onCancel={() => setShowTextEditor(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditModal;
