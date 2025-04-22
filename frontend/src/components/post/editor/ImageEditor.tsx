import React, { useRef, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Undo, Redo, X, Check, Loader2 } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import EditorControls from "./EditorControls";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  updateEditorState,
  setOriginalImageData,
  saveToHistory,
  undoEdit,
  redoEdit,
  resetEditor,
  resetCropMode,
  initializeHistory,
  setCurrentImage,
  getCurrentEditorState,
  getCurrentHistory,
  getCurrentOriginalImageData,
  defaultEditorState,
  setOriginalImageUrl,
  ExtendedImageEditorState,
} from "@/redux/slices/imageEditor.slice";
import { ImageEditorState } from "./types";
import { Media } from "../MediaUploader";
import { useUploadMedia } from "@/api/apiHooks/useMedia";
import { v4 as uuidv4 } from "uuid";

interface ImageEditorProps {
  selectedImage: Media;
  onSave: (editedImageUrl: string, selectedImage: Media) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ selectedImage, onSave, onCancel }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();

  // Redux hooks
  const dispatch = useDispatch();

  // For preview mode - we'll keep a local copy of the state for previewing edits
  // This will only be synchronized with Redux when the user clicks "Save Changes"
  const [previewState, setPreviewState] = useState<ExtendedImageEditorState | null>(null);

  // Flag to track if edits have been made but not saved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Set current image ID when component mounts
  useEffect(() => {
    if (selectedImage?.id) {
      dispatch(setCurrentImage(selectedImage.id));
    }
  }, [selectedImage, dispatch]);

  // Get the state for the current image
  const reduxState = useSelector(getCurrentEditorState);
  const history = useSelector(getCurrentHistory);
  const originalImageData = useSelector(getCurrentOriginalImageData);

  // The actual state we use for rendering - either preview state (if exists) or Redux state
  const state = previewState || reduxState;

  // Get all history data for all images
  const { imageSettings } = useSelector((state: RootState) => state.imageEditor);

  // Initialize preview state from Redux state
  useEffect(() => {
    if (reduxState && !previewState) {
      setPreviewState(reduxState);
    }
  }, [reduxState, previewState]);

  // Load the image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    // Determine which image URL to use - prioritize cropped image URL if exists
    // otherwise fall back to original or selected image URL
    const imageUrl =
      reduxState.croppedImageUrl || reduxState.originalImageUrl || selectedImage?.url;

    // Store the original image URL when first editing an image
    if (!reduxState.originalImageUrl) {
      dispatch(setOriginalImageUrl(selectedImage?.url));
    }

    img.onload = () => {
      imageRef.current = img;

      // Set initial canvas dimensions - respect cropped dimensions if they exist
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
      }

      // Draw initial image with any existing edit settings
      // This will apply stored edit settings but start with original image
      drawImage();

      // Check if the image has history entries already
      const hasHistory = history.states.length > 0;

      // Only initialize history with default state if it's a new image (no history)
      // For previously edited images, we keep existing settings but don't add new history
      if (canvasRef.current && !hasHistory) {
        const initialCanvasData = canvasRef.current.toDataURL("image/png");
        dispatch(
          initializeHistory({
            state: defaultEditorState,
            canvasData: initialCanvasData,
          }),
        );

        // Also initialize preview state with default values
        setPreviewState(defaultEditorState);
      } else if (canvasRef.current && hasHistory) {
        // For previously edited images, we start with a fresh history point using
        // the existing settings but based on the original image
        const initialCanvasData = canvasRef.current.toDataURL("image/png");

        // Only store a new history point if we're reopening an image
        if (history.canvasData.length === 0) {
          dispatch(saveToHistory(initialCanvasData));
        }
      }
    };
    img.src = imageUrl;

    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
      }
    };
  }, [selectedImage, dispatch, history, reduxState.originalImageUrl, reduxState.croppedImageUrl]);

  // Update preview when edits are made
  useEffect(() => {
    if (previewState) {
      drawImage();
    }
  }, [previewState]);

  const drawImage = (showCropOverlay = false) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;

    // Set canvas dimensions to match the image
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();

    // Move to center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    const radians = (state.rotation * Math.PI) / 180;
    ctx.rotate(radians);

    // Apply flips
    const scaleX = state.flipHorizontal ? -1 : 1;
    const scaleY = state.flipVertical ? -1 : 1;
    ctx.scale((scaleX * state.zoom) / 100, (scaleY * state.zoom) / 100);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

    // Restore context
    ctx.restore();

    // Apply filters
    if (
      state.brightness !== 100 ||
      state.contrast !== 100 ||
      state.saturation !== 100 ||
      state.blur > 0 ||
      state.sharpen > 0 ||
      state.grayscale > 0 ||
      state.invert > 0 ||
      state.enhance > 0
    ) {
      applyImageFilters(ctx, canvas.width, canvas.height);
    }

    // Draw crop overlay if in crop mode
    if (showCropOverlay && state.cropMode) {
      drawCropOverlay(ctx, canvas.width, canvas.height);
    }
  };

  const applyImageFilters = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Store original image data for the first time
    if (!originalImageData) {
      const originalDataStr = JSON.stringify(Array.from(data));
      dispatch(setOriginalImageData(originalDataStr));
    }

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      const brightnessValue = state.brightness / 100;
      r = r * brightnessValue;
      g = g * brightnessValue;
      b = b * brightnessValue;

      // Apply contrast
      const contrastFactor = (259 * (state.contrast + 255)) / (255 * (259 - state.contrast));
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // Apply saturation
      const grayScale = 0.3 * r + 0.59 * g + 0.11 * b;
      const saturationValue = state.saturation / 100;
      r = grayScale + saturationValue * (r - grayScale);
      g = grayScale + saturationValue * (g - grayScale);
      b = grayScale + saturationValue * (b - grayScale);

      // Apply grayscale
      if (state.grayscale > 0) {
        const gray = (r + g + b) / 3;
        const grayFactor = state.grayscale / 100;
        r = r * (1 - grayFactor) + gray * grayFactor;
        g = g * (1 - grayFactor) + gray * grayFactor;
        b = b * (1 - grayFactor) + gray * grayFactor;
      }

      // Apply invert
      if (state.invert > 0) {
        const invertFactor = state.invert / 100;
        r = r * (1 - invertFactor) + (255 - r) * invertFactor;
        g = g * (1 - invertFactor) + (255 - g) * invertFactor;
        b = b * (1 - invertFactor) + (255 - b) * invertFactor;
      }

      // Apply enhance (increase vibrancy)
      if (state.enhance > 0) {
        const enhanceFactor = state.enhance / 100;
        const avgLuminance = (r + g + b) / 3;
        r = r + (r - avgLuminance) * enhanceFactor;
        g = g + (g - avgLuminance) * enhanceFactor;
        b = b + (b - avgLuminance) * enhanceFactor;
      }

      // Clamp values to 0-255 range
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    // Apply blur/sharpen
    if (state.blur > 0 || state.sharpen > 0) {
      applyBlurSharpen(data, width, height);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyBlurSharpen = (data: Uint8ClampedArray, width: number, height: number) => {
    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * width + x) * 4 + c;

          if (state.blur > 0) {
            // Simple 3x3 box blur
            const blurFactor = (state.blur / 100) * 0.8;

            const neighbors = [
              tempData[idx - width * 4 - 4], // top left
              tempData[idx - width * 4], // top
              tempData[idx - width * 4 + 4], // top right
              tempData[idx - 4], // left
              tempData[idx], // center
              tempData[idx + 4], // right
              tempData[idx + width * 4 - 4], // bottom left
              tempData[idx + width * 4], // bottom
              tempData[idx + width * 4 + 4], // bottom right
            ];

            const avgValue = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
            data[idx] = data[idx] * (1 - blurFactor) + avgValue * blurFactor;
          }

          if (state.sharpen > 0) {
            // Simple unsharp masking
            const sharpenFactor = (state.sharpen / 100) * 0.5;

            const center = tempData[idx];
            const neighbors = [
              tempData[idx - width * 4], // top
              tempData[idx - 4], // left
              tempData[idx + 4], // right
              tempData[idx + width * 4], // bottom
            ];

            const avgValue = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
            const sharpened = center + (center - avgValue) * sharpenFactor;
            data[idx] = Math.max(0, Math.min(255, sharpened));
          }
        }
      }
    }
  };

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const x = Math.min(state.cropStartX, state.cropEndX);
    const y = Math.min(state.cropStartY, state.cropEndY);
    const cropWidth = Math.abs(state.cropEndX - state.cropStartX);
    const cropHeight = Math.abs(state.cropEndY - state.cropStartY);

    ctx.rect(x, y, cropWidth, cropHeight);
    ctx.stroke();

    // Semi-transparent overlay outside crop area
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

    // Top
    ctx.fillRect(0, 0, width, y);
    // Left
    ctx.fillRect(0, y, x, cropHeight);
    // Right
    ctx.fillRect(x + cropWidth, y, width - (x + cropWidth), cropHeight);
    // Bottom
    ctx.fillRect(0, y + cropHeight, width, height - (y + cropHeight));
  };

  const addCurrentStateToHistory = () => {
    if (!canvasRef.current) return;

    const dataURL = canvasRef.current.toDataURL("image/png");
    dispatch(saveToHistory(dataURL));
  };

  const handleUndo = () => {
    if (history.index > 0) {
      // Store the current index before dispatching
      const currentIndex = history.index;
      dispatch(undoEdit());

      // Use the stored index to load canvas data
      setTimeout(() => {
        if (history.canvasData[currentIndex - 1]) {
          loadCanvasFromHistory(history.canvasData[currentIndex - 1]);
        }
      }, 0);
    }
  };

  const handleRedo = () => {
    if (history.index < history.states.length - 1) {
      // Store the next index before dispatching
      const nextIndex = history.index + 1;
      dispatch(redoEdit());

      // Use the stored index to load canvas data
      setTimeout(() => {
        if (history.canvasData[nextIndex]) {
          loadCanvasFromHistory(history.canvasData[nextIndex]);
        }
      }, 0);
    }
  };

  const loadCanvasFromHistory = (dataURL: string) => {
    if (!dataURL) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Resize canvas to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Update image reference
      imageRef.current = img;
    };
    img.src = dataURL;
  };

  // Modified to update preview state instead of Redux state directly
  const handleStateChange = (newState: Partial<ImageEditorState>) => {
    // Update preview state
    setPreviewState((prevState) => ({
      ...(prevState || reduxState),
      ...newState,
    }));

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Using setTimeout to ensure this runs after the state has been updated
    setTimeout(() => {
      drawImage();
    }, 0);
  };

  const createCroppedImage = (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.src = imageSrc;

      image.onload = () => {
        // Create a canvas for the cropped image
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw the cropped portion
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height,
        );

        // Return the data URL of the cropped image
        resolve(canvas.toDataURL("image/png"));
      };

      image.onerror = () => {
        reject(new Error("Failed to load image for cropping"));
      };
    });
  };

  const handleCrop = async () => {
    // We need to have crop dimensions
    if (
      state.cropStartX === undefined ||
      state.cropStartY === undefined ||
      state.cropEndX === undefined ||
      state.cropEndY === undefined
    ) {
      toast({
        title: "Crop error",
        description: "Please select a crop area first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get crop dimensions from state
      const pixelCrop = {
        x: Math.min(state.cropStartX, state.cropEndX),
        y: Math.min(state.cropStartY, state.cropEndY),
        width: Math.abs(state.cropEndX - state.cropStartX),
        height: Math.abs(state.cropEndY - state.cropStartY),
      };

      // Skip if crop area is too small
      if (pixelCrop.width < 10 || pixelCrop.height < 10) {
        handleCancelCrop();
        return;
      }

      // Use the utility function to create the cropped image
      // We use the original image URL to ensure full quality
      const croppedImageUrl = await createCroppedImage(
        reduxState.originalImageUrl || selectedImage.url,
        pixelCrop,
      );

      // Load the cropped image
      const newImage = new Image();
      newImage.crossOrigin = "Anonymous";

      newImage.onload = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Update canvas dimensions
        canvas.width = newImage.width;
        canvas.height = newImage.height;

        // Draw the cropped image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0);

        // Update image reference for current session
        imageRef.current = newImage;

        // Update preview state - STORE THE CROPPED DIMENSIONS!
        setPreviewState((prevState) => ({
          ...(prevState || reduxState),
          cropMode: false,
          isCropping: false,
          // Store the new dimensions so we know this image was cropped
          croppedWidth: newImage.width,
          croppedHeight: newImage.height,
          // Store the cropped image URL to use when re-opening the editor
          croppedImageUrl: croppedImageUrl,
        }));

        // Mark as having unsaved changes
        setHasUnsavedChanges(true);
      };

      newImage.src = croppedImageUrl;
    } catch (error) {
      console.error("Error cropping image:", error);
      toast({
        title: "Crop error",
        description: "An error occurred while cropping the image.",
        variant: "destructive",
      });
    }
  };

  // This is called when the user clicks "Save Changes"
  const handleSave = () => {
    if (!canvasRef.current) return;

    try {
      // First, apply all preview state changes to Redux
      if (previewState && hasUnsavedChanges) {
        // Update Redux state
        dispatch(updateEditorState(previewState as ExtendedImageEditorState));

        // Add to history
        const dataURL = canvasRef.current.toDataURL("image/png");
        dispatch(saveToHistory(dataURL));

        // If we cropped the image, also save the cropped URL
        if ((previewState as ExtendedImageEditorState).croppedImageUrl) {
          dispatch(
            updateEditorState({
              originalImageUrl: (previewState as ExtendedImageEditorState).croppedImageUrl,
            }),
          );
        }

        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
      }

      // Get the edited image as data URL
      const dataURL = canvasRef.current.toDataURL("image/png");

      // Convert data URL to Blob
      const fetchResponse = fetch(dataURL);
      fetchResponse
        .then((res) => res.blob())
        .then((blob) => {
          // Create a File object from the blob
          const file = new File([blob], `edited_image_${selectedImage.id}.png`, {
            type: "image/png",
          });

          // Create FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("postId", uuidv4());

          // Upload the edited image
          uploadMedia(formData, {
            onSuccess: (response) => {
              if (response?.data?.url) {
                // Call the onSave with the server URL instead of data URL
                onSave(response.data.url, selectedImage);
                // Reset crop data to default
                dispatch(resetCropMode());
                toast({
                  title: "Image edited",
                  description: "Your image has been edited and uploaded successfully.",
                });
              } else {
                throw new Error("Invalid response format");
              }
            },
            onError: (error) => {
              console.error("Error uploading edited image:", error);
              toast({
                title: "Error uploading image",
                description: "There was an error uploading your edited image.",
                variant: "destructive",
              });

              // Fallback to local data URL if upload fails
              onSave(dataURL, selectedImage);
            },
          });
        })
        .catch((error) => {
          console.error("Error processing image:", error);
          toast({
            title: "Error processing image",
            description: "There was an error processing your image.",
            variant: "destructive",
          });

          // Fallback to local data URL if processing fails
          onSave(dataURL, selectedImage);
        });
    } catch (error) {
      toast({
        title: "Error saving image",
        description: "There was an error saving your edited image.",
        variant: "destructive",
      });
    }
  };

  // Cancel all unsaved changes and restore from Redux state
  const handleCancelEdits = () => {
    if (hasUnsavedChanges) {
      // Reset preview state to match Redux state
      setPreviewState(reduxState);
      setHasUnsavedChanges(false);

      // Redraw with the original state
      setTimeout(() => drawImage(), 0);
    }

    // Exit the editor
    onCancel();
  };

  const resetAdjustments = () => {
    // Update preview state with reset values
    setPreviewState((prevState) => ({
      ...(prevState || reduxState),
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      zoom: 100,
      flipHorizontal: false,
      flipVertical: false,
      blur: 0,
      sharpen: 0,
      grayscale: 0,
      invert: 0,
      enhance: 0,
    }));

    setHasUnsavedChanges(true);

    setTimeout(() => drawImage(), 0);
  };

  const handleCancelCrop = () => {
    setPreviewState((prevState) => ({
      ...(prevState || reduxState),
      cropMode: false,
      cropStartX: 0,
      cropStartY: 0,
      cropEndX: 0,
      cropEndY: 0,
      cropAspectRatio: undefined,
    }));
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-3xl mx-auto">
      <div className="flex justify-center items-center">
        <h3 className="text-lg font-semibold">
          Edit Image {hasUnsavedChanges && "(Unsaved Changes)"}
        </h3>
      </div>

      <EditorToolbar
        state={state}
        onStateChange={handleStateChange}
        onCrop={handleCrop}
        onCancelCrop={handleCancelCrop}
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <EditorCanvas
          ref={canvasRef}
          state={state}
          onStateChange={handleStateChange}
          drawImage={drawImage}
          imageUrl={selectedImage?.url}
        />

        <EditorControls
          state={state}
          onStateChange={handleStateChange}
          onReset={resetAdjustments}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handleCancelEdits}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
