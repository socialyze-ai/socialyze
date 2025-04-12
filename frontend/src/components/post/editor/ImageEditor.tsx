import React, { useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Undo, Redo, X, Check } from "lucide-react";
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
} from "@/redux/slices/imageEditor.slice";
import { ImageEditorState } from "./types";
import { Media } from "../MediaUploader";

interface ImageEditorProps {
  selectedImage: Media;
  onSave: (editedImageUrl: string, selectedImage: Media) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  selectedImage,
  onSave,
  onCancel,
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Redux hooks
  const dispatch = useDispatch();
  const { state, history, originalImageData } = useSelector(
    (state: RootState) => state.imageEditor
  );

  // Load the image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      imageRef.current = img;

      // Set initial canvas dimensions
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
      }

      // Draw initial image
      drawImage();

      // Initialize history with initial state and canvas data
      if (canvasRef.current) {
        const initialCanvasData = canvasRef.current.toDataURL("image/png");
        dispatch(
          initializeHistory({
            state: state,
            canvasData: initialCanvasData,
          })
        );
      }
    };
    img.src = selectedImage?.url;

    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
      }
    };
  }, [selectedImage, dispatch]);

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

  const applyImageFilters = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
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
      const contrastFactor =
        (259 * (state.contrast + 255)) / (255 * (259 - state.contrast));
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

  const applyBlurSharpen = (
    data: Uint8ClampedArray,
    width: number,
    height: number
  ) => {
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

            const avgValue =
              neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
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

            const avgValue =
              neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
            const sharpened = center + (center - avgValue) * sharpenFactor;
            data[idx] = Math.max(0, Math.min(255, sharpened));
          }
        }
      }
    }
  };

  const drawCropOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
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

  const handleStateChange = (newState: Partial<ImageEditorState>) => {
    dispatch(updateEditorState(newState));

    // Using setTimeout to ensure this runs after the state has been updated
    setTimeout(() => {
      drawImage();

      // Save to history for certain operations
      if (
        newState.rotation !== undefined ||
        newState.flipHorizontal !== undefined ||
        newState.flipVertical !== undefined ||
        newState.brightness !== undefined ||
        newState.contrast !== undefined ||
        newState.saturation !== undefined ||
        newState.blur !== undefined ||
        newState.sharpen !== undefined ||
        newState.grayscale !== undefined ||
        newState.invert !== undefined ||
        newState.enhance !== undefined
      ) {
        addCurrentStateToHistory();
      }
    }, 0);
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Get crop dimensions from state
    const x = Math.min(state.cropStartX, state.cropEndX);
    const y = Math.min(state.cropStartY, state.cropEndY);
    const width = Math.abs(state.cropEndX - state.cropStartX);
    const height = Math.abs(state.cropEndY - state.cropStartY);

    // Skip if crop area is too small
    if (width < 10 || height < 10) {
      dispatch(resetCropMode());
      return;
    }

    // Set dimensions for the temp canvas
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw the cropped portion onto the temp canvas
    tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    // Create a new image from the temp canvas
    const newImage = new Image();
    newImage.onload = () => {
      // Resize the main canvas
      canvas.width = width;
      canvas.height = height;

      // Draw the cropped image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(newImage, 0, 0);

      // Update image reference
      imageRef.current = newImage;

      // Reset crop mode
      dispatch(resetCropMode());

      // Save to history
      addCurrentStateToHistory();
    };

    newImage.src = tempCanvas.toDataURL("image/png");
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    try {
      const dataURL = canvasRef.current.toDataURL("image/png");
      onSave(dataURL, selectedImage);
      toast({
        title: "Image edited",
        description: "Your image has been edited successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving image",
        description: "There was an error saving your edited image.",
        variant: "destructive",
      });
    }
  };

  const resetAdjustments = () => {
    dispatch(resetEditor());

    setTimeout(() => {
      drawImage();
      addCurrentStateToHistory();
    }, 0);
  };

  const handleCancelCrop = () => {
    dispatch(resetCropMode());
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-3xl mx-auto">
      {/* ---- Undo & Redo (Check logic)---- */}
      {/*   <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Image</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={history.index <= 0}
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={history.index >= history.states.length - 1}
          >
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
        </div>
      </div> */}
      <div className="flex justify-center items-center">
        <h3 className="text-lg font-semibold">Edit Image</h3>
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
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
