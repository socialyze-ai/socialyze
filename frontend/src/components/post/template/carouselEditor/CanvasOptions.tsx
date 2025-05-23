import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { setAspectRatio, setBackgroundColor, setCanvasCount } from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const CanvasOptions = ({
  handleTemplateSaveAndUse,
  isLoading,
}: {
  handleTemplateSaveAndUse: (isSave: boolean) => void;
  isLoading: boolean;
}) => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor } = useSelector(
    (state: RootState) => state.template,
  );

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium">Canvas Options</h3>

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
          <Select value={aspectRatio} onValueChange={(value) => dispatch(setAspectRatio(value))}>
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
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleTemplateSaveAndUse(true)}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleTemplateSaveAndUse(false)}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Use"}
        </Button>
      </div>
    </div>
  );
};

export default CanvasOptions;
