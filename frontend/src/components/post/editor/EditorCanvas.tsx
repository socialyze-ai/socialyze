import React, { forwardRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { ImageEditorState } from "./types";
import { useDispatch, useSelector } from "react-redux";
import { updateEditorState, getCurrentEditorState } from "@/redux/slices/imageEditor.slice";
import { RootState } from "@/redux/store";

interface EditorCanvasProps {
  state: ImageEditorState;
  onStateChange: (newState: Partial<ImageEditorState>) => void;
  drawImage: (showCropOverlay?: boolean) => void;
  imageUrl: string;
}

const EditorCanvas = forwardRef<HTMLCanvasElement, EditorCanvasProps>(
  ({ state, onStateChange, drawImage, imageUrl }, ref) => {
    const dispatch = useDispatch();
    const editorState = useSelector(getCurrentEditorState);

    // Instead of local state, use the values from Redux
    const crop = { x: editorState.cropX || 0, y: editorState.cropY || 0 };
    const zoom = editorState.zoom / 100; // Convert from percentage to decimal

    const onCropChange = useCallback(
      (newCrop: { x: number; y: number }) => {
        dispatch(
          updateEditorState({
            cropX: newCrop.x,
            cropY: newCrop.y,
          }),
        );
      },
      [dispatch],
    );

    const onZoomChange = useCallback(
      (newZoom: number) => {
        onStateChange({ zoom: newZoom * 100 });
      },
      [onStateChange],
    );

    const onCropComplete = useCallback(
      (croppedArea: any, croppedAreaPixels: any) => {
        // Store crop data in the state for later use
        onStateChange({
          cropStartX: croppedAreaPixels.x,
          cropStartY: croppedAreaPixels.y,
          cropEndX: croppedAreaPixels.x + croppedAreaPixels.width,
          cropEndY: croppedAreaPixels.y + croppedAreaPixels.height,
        });
      },
      [onStateChange],
    );

    // Add this effect to ensure canvas updates when state changes
    useEffect(() => {
      if (!state.cropMode) {
        // Small delay to ensure state is fully updated
        const timer = setTimeout(() => {
          drawImage();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [state, drawImage]);

    // If we're in crop mode, show the Cropper, otherwise show the canvas
    return (
      <div className="bg-gray-50 border rounded-md p-2 flex items-center justify-center w-full lg:w-2/3 h-[300px] overflow-hidden relative">
        {state.cropMode ? (
          <div className="absolute inset-0">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={state.cropAspectRatio}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgb(0, 0, 0)",
                },
              }}
            />
            <canvas ref={ref} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <canvas ref={ref} className="max-w-full max-h-full object-contain" />
        )}
      </div>
    );
  },
);

EditorCanvas.displayName = "EditorCanvas";

export default EditorCanvas;
