import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Crop,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  LayoutTemplate,
} from "lucide-react";
import { ImageEditorState } from "./types";
import { useDispatch, useSelector } from "react-redux";
import {
  updateEditorState,
  setSelectedRatio,
  getCurrentEditorState,
} from "@/redux/slices/imageEditor.slice";
import { RootState } from "@/redux/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  state: ImageEditorState;
  onStateChange: (newState: Partial<ImageEditorState>) => void;
  onCrop: () => void;
  onCancelCrop?: () => void;
  drawImage?: () => void;
}

// Common social media aspect ratios
const aspectRatios = [
  { name: "Free", value: undefined },
  { name: "Square (1:1)", value: 1 }, // Instagram, Facebook
  { name: "Portrait (4:5)", value: 4 / 5 }, // Instagram
  { name: "Landscape (16:9)", value: 16 / 9 }, // Instagram, Facebook, LinkedIn
  { name: "Story (9:16)", value: 9 / 16 }, // Instagram/Facebook Stories, Reels
  { name: "Twitter Post (16:10)", value: 16 / 10 }, // X.com (Twitter)
  { name: "LinkedIn (3:2)", value: 3 / 2 }, // LinkedIn
];

const EditorToolbar: React.FC<EditorToolbarProps> = memo(
  ({ state, onStateChange, onCrop, onCancelCrop, drawImage }) => {
    const dispatch = useDispatch();
    const editorState = useSelector(getCurrentEditorState);
    const selectedRatio = editorState.selectedRatio;

    const handleRotateLeft = () => {
      onStateChange({ rotation: state.rotation + 90 });
      // This will trigger a redraw immediately
      setTimeout(() => drawImage(), 0);
    };

    const handleRotateRight = () => {
      onStateChange({ rotation: state.rotation - 90 });
      // This will trigger a redraw immediately
      setTimeout(() => drawImage(), 0);
    };

    const handleFlipHorizontal = () => {
      onStateChange({ flipHorizontal: !state.flipHorizontal });
      setTimeout(() => {
        // This will trigger a redraw after the state has been updated
      }, 0);
    };

    const handleFlipVertical = () => {
      onStateChange({ flipVertical: !state.flipVertical });
      setTimeout(() => {
        // This will trigger a redraw after the state has been updated
      }, 0);
    };

    const handleAspectRatioChange = (name: string, ratio: number | undefined) => {
      dispatch(setSelectedRatio(name));
      onStateChange({
        cropAspectRatio: ratio,
      });
    };

    const handleCancelCrop = () => {
      if (onCancelCrop) {
        onCancelCrop();
      } else {
        onStateChange({
          cropMode: false,
          cropStartX: 0,
          cropStartY: 0,
          cropEndX: 0,
          cropEndY: 0,
        });
      }
    };

    return (
      <div className="flex justify-between h-auto p-1">
        <div className="flex flex-wrap">
          {!state.cropMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => onStateChange({ cropMode: true })}
              >
                <Crop className="h-5 w-5" />
                <span className="ml-1 text-xs">Crop</span>
              </Button>

              <Button variant="ghost" size="sm" className="p-2" onClick={handleRotateLeft}>
                <RotateCcw className="h-5 w-5" />
                <span className="ml-1 text-xs">Rotate Left</span>
              </Button>

              <Button variant="ghost" size="sm" className="p-2" onClick={handleRotateRight}>
                <RotateCw className="h-5 w-5" />
                <span className="ml-1 text-xs">Rotate Right</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${state.flipHorizontal ? "bg-muted" : ""}`}
                onClick={handleFlipHorizontal}
              >
                <FlipHorizontal className="h-5 w-5" />
                <span className="ml-1 text-xs">Mirror</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${state.flipVertical ? "bg-muted" : ""}`}
                onClick={handleFlipVertical}
              >
                <FlipVertical className="h-5 w-5" />
                <span className="ml-1 text-xs">Flip</span>
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <LayoutTemplate className="h-5 w-5" />
                    <span className="ml-1 text-xs">{selectedRatio}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    {aspectRatios.map((ratio) => (
                      <DropdownMenuItem
                        key={ratio.name}
                        onClick={() => handleAspectRatioChange(ratio.name, ratio.value)}
                      >
                        {ratio.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="p-2" onClick={handleCancelCrop}>
                <X className="h-5 w-5" />
                <span className="ml-1 text-xs">Cancel</span>
              </Button>

              <Button variant="ghost" size="sm" className="p-2" onClick={onCrop}>
                <Check className="h-5 w-5" />
                <span className="ml-1 text-xs">Apply</span>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  },
);

EditorToolbar.displayName = "EditorToolbar";

export default EditorToolbar;
