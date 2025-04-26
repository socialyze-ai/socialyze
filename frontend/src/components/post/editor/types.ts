// types.ts
export interface ImageEditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  zoom: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  blur: number;
  sharpen: number;
  grayscale: number;
  invert: number;
  enhance: number;
  cropMode: boolean;
  cropStartX: number;
  cropStartY: number;
  cropEndX: number;
  cropEndY: number;
  isCropping: boolean;
  activeTab: "adjust" | "effects" | "filters";
  cropAspectRatio?: number;
}

export interface ImageEditHistory {
  stack: string[];
  index: number;
}
