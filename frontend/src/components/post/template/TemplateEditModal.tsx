import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { Upload, Type, Save } from "lucide-react";
import {
  setImages,
  setText,
  setAspectRatio,
  setCanvasCount,
  setBackgroundColor,
} from "@/redux/slices/template.slice";
import { RootState } from "@/redux/store";
import Canvas from "./Canvas";
import TextEditor from "./TextEditor";
import Preview from "./Preview";
import { apiService } from "./apiService";

const TemplateEditModal = () => {
  const dispatch = useDispatch();
  const { canvasCount, aspectRatio, backgroundColor, images, texts } = useSelector(
    (state: RootState) => state.template,
  );
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage = {
            id: `img-${Date.now()}`,
            src: event.target.result as string,
            position: { x: 20, y: 20 },
            size: { width: 150, height: 150 },
            canvasIndex: images.length % canvasCount,
          };
          dispatch(setImages([...images, newImage]));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    setShowTextEditor(true);
  };

  const handleSaveText = (text: string) => {
    const newText = {
      id: `text-${Date.now()}`,
      content: text,
      position: { x: 50, y: 50 },
      style: { fontSize: 16, color: "#000000" },
      canvasIndex: texts.length % canvasCount,
    };
    dispatch(setText([...texts, newText]));
    setShowTextEditor(false);
  };

  const handleUseTemplate = async () => {
    setIsLoading(true);
    try {
      // Call API service to process template
      const response = await apiService.processTemplate({
        canvasCount,
        aspectRatio,
        backgroundColor,
        images,
        texts,
      });

      if (response.success) {
        console.log("Template processed successfully:", response.data);
        alert("Template processed successfully!");
      } else {
        throw new Error(response.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error processing template:", error);
      alert(
        error instanceof Error ? error.message : "Error processing template. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-5/6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview at the top */}
          <Preview />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="bg-gray-100 rounded-lg p-4">
                {/* Fixed height canvas */}
                <div className="h-96">
                  <Canvas />
                </div>
              </div>
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
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <Button variant="outline" className="flex-1" onClick={handleAddText}>
                    <Type className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button className="flex-1" onClick={handleUseTemplate} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Use"}
                </Button>
              </div>
            </div>
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
