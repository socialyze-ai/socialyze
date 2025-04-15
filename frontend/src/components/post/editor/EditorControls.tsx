import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sliders, Sparkles, Circle, RotateCcw } from "lucide-react";
import { ImageEditorState } from "./types";
import { useDispatch } from "react-redux";
import { updateEditorState } from "@/redux/slices/imageEditor.slice";

interface EditorControlsProps {
  state: ImageEditorState;
  onStateChange: (newState: Partial<ImageEditorState>) => void;
  onReset: () => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({ state, onStateChange, onReset }) => {
  const dispatch = useDispatch();

  const handleSliderChange = (property: keyof ImageEditorState) => (value: number[]) => {
    // We use onStateChange which will handle saving to history
    onStateChange({ [property]: value[0] });
  };

  return (
    <div className="w-full lg:w-1/3">
      <Tabs
        defaultValue="adjust"
        value={state.activeTab}
        onValueChange={(tab: "adjust" | "effects" | "filters") => onStateChange({ activeTab: tab })}
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="adjust">
            <Sliders className="h-4 w-4 mr-1" />
            Adjust
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Sparkles className="h-4 w-4 mr-1" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Circle className="h-4 w-4 mr-1" />
            Filters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adjust" className="space-y-4 mt-4">
          <SliderControl
            label="Brightness"
            id="brightness"
            value={state.brightness}
            min={0}
            max={200}
            onChange={handleSliderChange("brightness")}
          />

          <SliderControl
            label="Contrast"
            id="contrast"
            value={state.contrast}
            min={0}
            max={200}
            onChange={handleSliderChange("contrast")}
          />

          <SliderControl
            label="Saturation"
            id="saturation"
            value={state.saturation}
            min={0}
            max={200}
            onChange={handleSliderChange("saturation")}
          />

          <SliderControl
            label="Zoom"
            id="zoom"
            value={state.zoom}
            min={50}
            max={200}
            onChange={handleSliderChange("zoom")}
          />
        </TabsContent>

        <TabsContent value="effects" className="space-y-4 mt-4">
          <SliderControl
            label="Blur"
            id="blur"
            value={state.blur}
            min={0}
            max={100}
            onChange={handleSliderChange("blur")}
          />

          <SliderControl
            label="Sharpen"
            id="sharpen"
            value={state.sharpen}
            min={0}
            max={100}
            onChange={handleSliderChange("sharpen")}
          />

          <SliderControl
            label="Enhance"
            id="enhance"
            value={state.enhance}
            min={0}
            max={100}
            onChange={handleSliderChange("enhance")}
          />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4 mt-4">
          <SliderControl
            label="Grayscale"
            id="grayscale"
            value={state.grayscale}
            min={0}
            max={100}
            onChange={handleSliderChange("grayscale")}
          />

          <SliderControl
            label="Invert"
            id="invert"
            value={state.invert}
            min={0}
            max={100}
            onChange={handleSliderChange("invert")}
          />

          <div className="grid grid-cols-3 gap-2 mt-4">
            <PresetButton
              label="Vivid"
              color="bg-blue-100"
              onClick={() => {
                onStateChange({
                  brightness: 100,
                  contrast: 120,
                  saturation: 110,
                  grayscale: 0,
                  blur: 0,
                  sharpen: 30,
                  invert: 0,
                  enhance: 0,
                });
              }}
            />

            <PresetButton
              label="Warm"
              color="bg-yellow-100"
              onClick={() => {
                onStateChange({
                  brightness: 110,
                  contrast: 90,
                  saturation: 90,
                  grayscale: 0,
                  blur: 0,
                  sharpen: 0,
                  invert: 0,
                  enhance: 0,
                });
              }}
            />

            <PresetButton
              label="Cool"
              color="bg-gray-200"
              onClick={() => {
                onStateChange({
                  brightness: 90,
                  contrast: 110,
                  saturation: 80,
                  grayscale: 0,
                  blur: 0,
                  sharpen: 0,
                  invert: 0,
                  enhance: 0,
                });
              }}
            />

            <PresetButton
              label="Bright"
              color="bg-gray-100"
              onClick={() => {
                onStateChange({
                  brightness: 120,
                  contrast: 90,
                  saturation: 100,
                  grayscale: 0,
                  blur: 0,
                  sharpen: 0,
                  invert: 0,
                  enhance: 0,
                });
              }}
            />

            <PresetButton
              label="B&W"
              color="bg-gray-300"
              onClick={() => {
                onStateChange({
                  brightness: 100,
                  contrast: 100,
                  saturation: 0,
                  grayscale: 100,
                  blur: 0,
                  sharpen: 0,
                  invert: 0,
                  enhance: 0,
                });
              }}
            />

            <PresetButton
              label="Reset"
              color="bg-white"
              icon={<RotateCcw className="h-6 w-6 text-gray-400" />}
              onClick={onReset}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface SliderControlProps {
  label: string;
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number[]) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, id, value, min, max, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label htmlFor={id}>{label}</Label>
      <span className="text-sm text-gray-500">{value}%</span>
    </div>
    <Slider id={id} min={min} max={max} step={1} value={[value]} onValueChange={onChange} />
  </div>
);

interface PresetButtonProps {
  label: string;
  color: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const PresetButton: React.FC<PresetButtonProps> = ({ label, color, icon, onClick }) => (
  <Button variant="outline" className="flex flex-col items-center p-2 h-auto" onClick={onClick}>
    <div className={`w-12 h-12 ${color} rounded-md mb-1 flex items-center justify-center`}>
      {icon || null}
    </div>
    <span className="text-xs">{label}</span>
  </Button>
);

export default EditorControls;
