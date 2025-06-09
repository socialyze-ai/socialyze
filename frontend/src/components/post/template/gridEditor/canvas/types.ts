// Type definitions for Grid Canvas component
import { Media } from "../../../MediaUploader";

// Add TextAlign type
export type TextAlign = "left" | "center" | "right" | "justify";

// Define interface for Canvas ref
export interface CanvasRef {
  captureCanvasContent: (cellIndex: number) => Promise<Blob | null>;
  getTotalCells: () => number;
}

export interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface TextStyle {
  fontSize: number;
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: string;
  textAlign?: TextAlign;
  rotation?: number;
}

export interface TextItem {
  id: string;
  content: string;
  position: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  style: TextStyle;
  zIndex: number;
}

export interface GridSize {
  columns: number;
  rows: number;
}

export interface CanvasItem {
  id: string;
  position: { x: number; y: number };
  zIndex: number;
  type: "image" | "text";
}

export type CanvasImageItem = ImageItem & { type: "image" };
export type CanvasTextItem = TextItem & { type: "text" };

export interface ImageToEdit {
  id: string;
  src: string;
}

export interface ImageToReplace {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
