import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasIndex: number;
}

export interface TextItem {
  id: string;
  content: string;
  position: { x: number; y: number };
  style: { fontSize: number; color: string };
  canvasIndex: number;
}

export interface TemplateState {
  canvasCount: number;
  aspectRatio: string;
  backgroundColor: string;
  images: ImageItem[];
  texts: TextItem[];
  selectedItemId: string | null;
}

const initialState: TemplateState = {
  canvasCount: 1,
  aspectRatio: "16:9",
  backgroundColor: "#ffffff",
  images: [],
  texts: [],
  selectedItemId: null,
};

export const templateSlice = createSlice({
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
    setText: (state, action: PayloadAction<TextItem[]>) => {
      state.texts = action.payload;
    },
    setSelectedItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
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
    updateTextStyle: (
      state,
      action: PayloadAction<{ id: string; style: { fontSize: number; color: string } }>,
    ) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.style = action.payload.style;
      }
    },
    updateTextContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.content = action.payload.content;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((img) => img.id !== action.payload);
      state.texts = state.texts.filter((txt) => txt.id !== action.payload);
      if (state.selectedItemId === action.payload) {
        state.selectedItemId = null;
      }
    },
  },
});

export const {
  setCanvasCount,
  setAspectRatio,
  setBackgroundColor,
  setImages,
  setText,
  setSelectedItem,
  updateImagePosition,
  updateImageSize,
  updateTextPosition,
  updateTextStyle,
  updateTextContent,
  removeItem,
} = templateSlice.actions;

export default templateSlice.reducer;
