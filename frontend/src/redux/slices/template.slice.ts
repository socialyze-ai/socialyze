import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";

export interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasIndex: number; // Used primarily for preview, not restriction
}

export interface TextItem {
  id: string;
  content: string;
  position: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  style: {
    fontSize: number;
    color: string;
    fontFamily?: string;
    fontWeight?: string;
    rotation?: number;
    textAlign?: string;
    fontStyle?: string;
    lineHeight?: string;
  };
  canvasIndex: number; // Used primarily for preview, not restriction
}

export interface TemplateState {
  canvasCount: number;
  aspectRatio: string;
  backgroundColor: string;
  images: ImageItem[];
  texts: TextItem[];
  selectedItemId: string | null;
  gridSize: {
    columns: number;
    rows: number;
  };
  socialPlatform: string | null;
}

const initialState: TemplateState = {
  canvasCount: 1,
  aspectRatio: "1:1",
  backgroundColor: "#ffffff",
  images: [],
  texts: [],
  selectedItemId: null,
  gridSize: {
    columns: 3,
    rows: 1,
  },
  socialPlatform: null,
};

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    setCanvasCount: (state, action: PayloadAction<number>) => {
      state.canvasCount = action.payload;
    },
    setAspectRatio: (state, action: PayloadAction<string>) => {
      state.aspectRatio = action.payload;
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload;
    },
    setImages: (state, action: PayloadAction<ImageItem[]>) => {
      state.images = action.payload;
    },
    addImage: (state, action: PayloadAction<ImageItem>) => {
      state.images.push(action.payload);
    },
    setText: (state, action: PayloadAction<TextItem[]>) => {
      state.texts = action.payload;
    },
    addText: (state, action: PayloadAction<TextItem>) => {
      state.texts.push(action.payload);
    },
    updateImagePosition: (
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>,
    ) => {
      const image = state.images.find((img) => img.id === action.payload.id);
      if (image) {
        image.position = action.payload.position;
      }
    },
    updateImageSize: (
      state,
      action: PayloadAction<{ id: string; size: { width: number; height: number } }>,
    ) => {
      const image = state.images.find((img) => img.id === action.payload.id);
      if (image) {
        image.size = action.payload.size;
      }
    },
    updateTextPosition: (
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>,
    ) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.position = action.payload.position;
      }
    },
    updateTextSize: (
      state,
      action: PayloadAction<{
        id: string;
        size: { width: number | string; height: number | string };
      }>,
    ) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.size = action.payload.size;
      }
    },
    updateTextStyle: (
      state,
      action: PayloadAction<{
        id: string;
        style: {
          fontSize: number;
          color: string;
          fontFamily?: string;
          fontWeight?: string;
          rotation?: number;
          textAlign?: string;
          fontStyle?: string;
          lineHeight?: string;
        };
      }>,
    ) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.style = { ...text.style, ...action.payload.style };
      }
    },
    updateTextContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.content = action.payload.content;
      }
    },
    setSelectedItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((img) => img.id !== action.payload);
      state.texts = state.texts.filter((txt) => txt.id !== action.payload);
      state.selectedItemId = null;
    },
    // Calculate section assignment for preview
    recalculateSectionAssignments: (state) => {
      // Calculate canvas dimensions to determine section width
      let canvasWidth = 0;
      const canvasHeight = 384; // Fixed canvas height

      switch (state.aspectRatio) {
        case "16:9":
          canvasWidth = (canvasHeight * 16) / 9;
          break;
        case "1:1":
          canvasWidth = canvasHeight;
          break;
        case "4:5":
          canvasWidth = (canvasHeight * 4) / 5;
          break;
        default:
          canvasWidth = (canvasHeight * 16) / 9;
      }

      const sectionWidth = canvasWidth / state.canvasCount;

      // Update images with the correct canvasIndex
      state.images.forEach((img) => {
        // Determine which section this image primarily belongs to
        let sectionIndex = Math.floor(img.position.x / sectionWidth);
        // Ensure it's within valid range
        sectionIndex = Math.max(0, Math.min(state.canvasCount - 1, sectionIndex));
        img.canvasIndex = sectionIndex;
      });

      // Update texts with the correct canvasIndex
      state.texts.forEach((txt) => {
        // Determine which section this text belongs to
        let sectionIndex = Math.floor(txt.position.x / sectionWidth);
        // Ensure it's within valid range
        sectionIndex = Math.max(0, Math.min(state.canvasCount - 1, sectionIndex));
        txt.canvasIndex = sectionIndex;
      });
    },
    resetTemplate: () => initialState,
    setGridSize: (state, action: PayloadAction<{ columns: number; rows: number }>) => {
      state.gridSize = action.payload;
      // Update canvasCount based on the grid size
      state.canvasCount = action.payload.columns * action.payload.rows;
    },
    setSocialPlatform: (state, action: PayloadAction<string | null>) => {
      state.socialPlatform = action.payload;
    },
  },
});

export const {
  setCanvasCount,
  setAspectRatio,
  setBackgroundColor,
  setImages,
  addImage,
  setText,
  addText,
  updateImagePosition,
  updateImageSize,
  updateTextPosition,
  updateTextSize,
  updateTextStyle,
  updateTextContent,
  setSelectedItem,
  removeItem,
  recalculateSectionAssignments,
  resetTemplate,
  setGridSize,
  setSocialPlatform,
} = templateSlice.actions;

export default templateSlice.reducer;
