import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Popular Google Fonts
const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Oswald",
  "Source Sans Pro",
  "Ubuntu",
  "Merriweather",
  "PT Sans",
  "Rubik",
  "Inter",
  "Lora",
  "Crimson Text",
  "Merriweather Sans",
  "Noto Sans",
  "Noto Serif",
];

// Font weight options
const FONT_WEIGHTS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

interface TextEditorProps {
  onSave: (
    text: string,
    style?: {
      fontSize: number;
      color: string;
      fontFamily?: string;
      fontWeight?: string;
      rotation?: number;
    },
  ) => void;
  onCancel: () => void;
  initialText?: string;
  initialStyle?: {
    fontSize: number;
    color: string;
    fontFamily?: string;
    fontWeight?: string;
    rotation?: number;
  };
}

const TextEditor = ({
  onSave,
  onCancel,
  initialText = "",
  initialStyle = {
    fontSize: 16,
    color: "#000000",
    fontFamily: "Roboto",
    fontWeight: "400",
    rotation: 0,
  },
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize);
  const [textColor, setTextColor] = useState(initialStyle.color);
  const [fontFamily, setFontFamily] = useState(initialStyle.fontFamily || "Roboto");
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || "400");
  const [rotation, setRotation] = useState(initialStyle.rotation || 0);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  // Load selected Google Font
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
      / /g,
      "+",
    )}:wght@${fontWeight}&display=swap`;
    document.head.appendChild(link);

    // Add to loaded fonts
    setLoadedFonts((prev) => [...prev, fontFamily]);

    return () => {
      document.head.removeChild(link);
    };
  }, [fontFamily, fontWeight]);

  // Preload all fonts for the dropdown
  useEffect(() => {
    // Create a batch request for all fonts
    const fontFamiliesParam = GOOGLE_FONTS.map(
      (font) => `${font.replace(/ /g, "+")}:wght@400`,
    ).join("|");

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamiliesParam}&display=swap`;
    document.head.appendChild(link);

    setLoadedFonts(GOOGLE_FONTS);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Determine if we're editing or adding new text
  const isEditing = initialText.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(text, {
      fontSize,
      color: textColor,
      fontFamily,
      fontWeight,
      rotation,
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md min-h-11/12 max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Text" : "Add Text"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="preview">Preview</Label>
            <div
              className="border rounded-md p-2 min-h-16 flex items-center justify-center whitespace-break-spaces"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                color: textColor,
                fontWeight,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {text || "Text Preview"}
            </div>
          </div>

          <Textarea
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32"
            required
            style={{
              fontFamily,
              fontWeight,
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger style={{ fontFamily }}>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger style={{ fontFamily, fontWeight }}>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem
                      key={weight.value}
                      value={weight.value}
                      style={{ fontFamily, fontWeight: weight.value }}
                    >
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="font-size-slider"
                  min={8}
                  max={72}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="flex-1"
                />
                <Input
                  id="font-size"
                  type="number"
                  min={8}
                  max={72}
                  value={fontSize}
                  onChange={(e) =>
                    setFontSize(Math.max(8, Math.min(72, parseInt(e.target.value) || 16)))
                  }
                  className="w-16"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color-picker"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  id="text-color"
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rotation">Rotation ({rotation}°)</Label>
            <div className="flex items-center gap-2">
              <Slider
                id="rotation-slider"
                min={-180}
                max={180}
                step={1}
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                className="flex-1"
              />
              <Input
                id="rotation"
                type="number"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) =>
                  setRotation(Math.max(-180, Math.min(180, parseInt(e.target.value) || 0)))
                }
                className="w-16"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Add Text"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
