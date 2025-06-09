import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { ColorPicker } from "@/components/ui/color-picker";
import { Type, Palette, RotateCcw, Eye, Settings, Sparkles, Save, X } from "lucide-react";

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

const FONT_WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

interface TextEditorProps {
  onSave: (text: string, style?: any) => void;
  onCancel: () => void;
  initialText?: string;
  initialStyle?: any;
}

const TextEditor = ({
  onSave,
  onCancel,
  initialText = "",
  initialStyle = {
    fontSize: 24,
    color: "#1a1a1a",
    fontFamily: "Inter",
    fontWeight: "500",
    rotation: 0,
  },
}: TextEditorProps) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialStyle.fontSize);
  const [textColor, setTextColor] = useState(initialStyle.color);
  const [fontFamily, setFontFamily] = useState(initialStyle.fontFamily || "Inter");
  const [fontWeight, setFontWeight] = useState(initialStyle.fontWeight || "500");
  const [rotation, setRotation] = useState(initialStyle.rotation || 0);
  const [activeTab, setActiveTab] = useState("content");

  const isEditing = initialText.length > 0;

  const handleSubmit = () => {
    if (text.trim()) {
      onSave(text, { fontSize, color: textColor, fontFamily, fontWeight, rotation });
    }
  };

  const resetToDefaults = () => {
    setFontSize(24);
    setTextColor("#1a1a1a");
    setFontFamily("Inter");
    setFontWeight("500");
    setRotation(0);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <DialogHeader>
          <div className="flex items-center gap-3 p-2 border-b bg-white/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Type className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-base font-semibold text-slate-800">
              {isEditing ? "Edit Text Element" : "Create Text Element"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview Panel */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex items-center gap-2 p-3 bg-slate-50/50">
              <Eye className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Live Preview</span>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-auto">
              <div className="relative">
                {/* Grid background for better visual reference */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>

                <div
                  className="relative max-w-lg"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center",
                  }}
                >
                  <div
                    className="whitespace-pre-wrap break-words text-center leading-relaxed"
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      fontWeight,
                      textShadow: rotation !== 0 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {text || "Your text will appear here..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-80 border-l bg-slate-50/50 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b bg-white">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "content"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Type className="w-4 h-4" />
                Content
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "style"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Palette className="w-4 h-4" />
                Style
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "content" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Text Content
                      </Label>
                      <Textarea
                        placeholder="Enter your text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-32 resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        style={{ fontFamily, fontWeight }}
                        required
                      />
                    </div>
                  </div>
                )}

                {activeTab === "style" && (
                  <div className="space-y-6">
                    {/* Typography Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Type className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Typography</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                            Font Family
                          </Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger className="h-10 border-slate-200" style={{ fontFamily }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                              {GOOGLE_FONTS.map((font) => (
                                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                  {font}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                              Weight
                            </Label>
                            <Select value={fontWeight} onValueChange={setFontWeight}>
                              <SelectTrigger className="h-10 border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_WEIGHTS.map((weight) => (
                                  <SelectItem key={weight.value} value={weight.value}>
                                    {weight.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">
                              Size
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={8}
                                max={120}
                                value={fontSize}
                                onChange={(e) =>
                                  setFontSize(
                                    Math.max(8, Math.min(120, parseInt(e.target.value) || 24)),
                                  )
                                }
                                className="h-10 border-slate-200 text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3 block">
                            Size: {fontSize}px
                          </Label>
                          <Slider
                            min={8}
                            max={120}
                            step={1}
                            value={[fontSize]}
                            onValueChange={(value) => setFontSize(value[0])}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <Palette className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-700">Appearance</span>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-3 block">
                          Text Color
                        </Label>
                        <div className="flex items-center gap-3">
                          <ColorPicker
                            value={textColor}
                            onChange={setTextColor}
                            className="w-10 h-10 rounded-xl border-2 border-white shadow-md"
                          />
                          <div className="flex-1">
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="h-10 border-slate-200 font-mono text-sm"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            Rotation: {rotation}°
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setRotation(0)}
                            className="h-6 px-2 text-xs"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </div>
                        <Slider
                          min={-180}
                          max={180}
                          step={5}
                          value={[rotation]}
                          onValueChange={(value) => setRotation(value[0])}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-slate-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetToDefaults}
                        className="w-full h-10 text-sm border-slate-200 hover:bg-slate-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t bg-white">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-11 border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="default"
                    className="flex-1 h-11 shadow-md"
                    disabled={!text.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Save Changes" : "Create Text"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
