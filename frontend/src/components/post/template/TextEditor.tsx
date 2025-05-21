import { useState } from "react";
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

interface TextEditorProps {
  onSave: (text: string, style?: { fontSize: number; color: string }) => void;
  onCancel: () => void;
  initialText?: string;
  initialStyle?: { fontSize: number; color: string };
}

const TextEditor = ({
  onSave,
  onCancel,
  initialText = "",
  initialStyle = { fontSize: 16, color: "#000000" },
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize);
  const [textColor, setTextColor] = useState(initialStyle.color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(text, { fontSize, color: textColor });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Text</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-32"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                min={8}
                max={72}
                value={fontSize}
                onChange={(e) =>
                  setFontSize(Math.max(8, Math.min(72, parseInt(e.target.value) || 16)))
                }
              />
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

          <div className="p-3 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div
              className="p-2 bg-white border rounded"
              style={{ fontSize: `${fontSize}px`, color: textColor }}
            >
              {text || "Sample Text"}
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Text</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
