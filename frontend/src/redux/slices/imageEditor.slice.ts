import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImageEditorState, ImageEditHistory } from "../../components/post/editor/types";
import { RootState } from "../store";
import { useSelector } from "react-redux";

// Add the missing fields for crop position
export interface ExtendedImageEditorState extends ImageEditorState {
  cropX: number;
  cropY: number;
  selectedRatio: string;
  originalImageUrl?: string; // Store the original image URL
  croppedImageUrl?: string; // Store the cropped image URL
  croppedWidth?: number; // Store the cropped image width
  croppedHeight?: number; // Store the cropped image height
}

// Default editor state to use for new images
export const defaultEditorState: ExtendedImageEditorState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  zoom: 100,
  flipHorizontal: false,
  flipVertical: false,
  blur: 0,
  sharpen: 0,
  grayscale: 0,
  invert: 0,
  enhance: 0,
  cropMode: false,
  cropStartX: 0,
  cropStartY: 0,
  cropEndX: 0,
  cropEndY: 0,
  isCropping: false,
  activeTab: "adjust",
  cropAspectRatio: undefined,
  cropX: 0,
  cropY: 0,
  selectedRatio: "Free",
  originalImageUrl: undefined,
  croppedImageUrl: undefined,
  croppedWidth: undefined,
  croppedHeight: undefined,
};

// Store editor settings for each image by imageId
interface ImageEditorSettings {
  [imageId: string]: {
    state: ExtendedImageEditorState;
    history: {
      states: ExtendedImageEditorState[];
      canvasData: string[]; // To store canvas data URLs
      index: number;
    };
    originalImageData: string | null;
  };
}

// Initial state for the image editor
const initialState: {
  currentImageId: string | null;
  imageSettings: ImageEditorSettings;
} = {
  currentImageId: null,
  imageSettings: {},
};

const imageEditorSlice = createSlice({
  name: "imageEditor",
  initialState,
  reducers: {
    setCurrentImage: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      state.currentImageId = imageId;

      // Initialize state for this image if it doesn't exist
      if (!state.imageSettings[imageId]) {
        state.imageSettings[imageId] = {
          state: { ...defaultEditorState },
          history: {
            states: [],
            canvasData: [],
            index: -1,
          },
          originalImageData: null,
        };
      }
    },

    updateEditorState: (state, action: PayloadAction<Partial<ExtendedImageEditorState>>) => {
      if (!state.currentImageId) return;

      state.imageSettings[state.currentImageId].state = {
        ...state.imageSettings[state.currentImageId].state,
        ...action.payload,
      };
    },

    setOriginalImageData: (state, action: PayloadAction<string | null>) => {
      if (!state.currentImageId) return;

      state.imageSettings[state.currentImageId].originalImageData = action.payload;
    },

    // Save current state and canvas data to history
    saveToHistory: (state, action: PayloadAction<string>) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      // If we're not at the end of history, truncate future states
      const newHistoryStates = settings.history.states.slice(0, settings.history.index + 1);
      const newHistoryCanvasData = settings.history.canvasData.slice(0, settings.history.index + 1);

      // Add current state and canvas data to history
      newHistoryStates.push({ ...settings.state });
      newHistoryCanvasData.push(action.payload);

      settings.history = {
        states: newHistoryStates,
        canvasData: newHistoryCanvasData,
        index: newHistoryStates.length - 1,
      };
    },

    // Step back in history to undo
    undoEdit: (state) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      if (settings.history.index > 0) {
        settings.history.index -= 1;
        // Restore state from history
        settings.state = { ...settings.history.states[settings.history.index] };
      }
    },

    // Step forward in history to redo
    redoEdit: (state) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      if (settings.history.index < settings.history.states.length - 1) {
        settings.history.index += 1;
        // Restore state from history
        settings.state = { ...settings.history.states[settings.history.index] };
      }
    },

    // Load initial state
    initializeHistory: (
      state,
      action: PayloadAction<{
        state: ExtendedImageEditorState;
        canvasData: string;
      }>,
    ) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      settings.state = action.payload.state;
      settings.history = {
        states: [action.payload.state],
        canvasData: [action.payload.canvasData],
        index: 0,
      };
    },

    resetEditor: (state) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      const resetState = {
        ...settings.state,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        rotation: 0,
        zoom: 100,
        flipHorizontal: false,
        flipVertical: false,
        blur: 0,
        sharpen: 0,
        grayscale: 0,
        invert: 0,
        enhance: 0,
      };

      settings.state = resetState;
      // We don't save to history here - that will be done after drawing
    },

    resetCropMode: (state) => {
      if (!state.currentImageId) return;

      const settings = state.imageSettings[state.currentImageId];
      settings.state = {
        ...settings.state,
        cropMode: false,
        cropStartX: 0,
        cropStartY: 0,
        cropEndX: 0,
        cropEndY: 0,
        cropAspectRatio: undefined,
        cropX: 0,
        cropY: 0,
      };
    },

    setSelectedRatio: (state, action: PayloadAction<string>) => {
      if (!state.currentImageId) return;

      state.imageSettings[state.currentImageId].state.selectedRatio = action.payload;
    },

    // Add a new action to store the original image URL
    setOriginalImageUrl: (state, action: PayloadAction<string>) => {
      if (!state.currentImageId) return;

      state.imageSettings[state.currentImageId].state.originalImageUrl = action.payload;
    },
  },
});

// Create selectors to get the current state
export const getCurrentEditorState = (state: RootState): ExtendedImageEditorState => {
  const imageId = state.imageEditor.currentImageId;
  if (!imageId || !state.imageEditor.imageSettings[imageId]) {
    return defaultEditorState;
  }
  return state.imageEditor.imageSettings[imageId].state;
};

export const getCurrentHistory = (state: RootState) => {
  const imageId = state.imageEditor.currentImageId;
  if (!imageId || !state.imageEditor.imageSettings[imageId]) {
    return { states: [], canvasData: [], index: -1 };
  }
  return state.imageEditor.imageSettings[imageId].history;
};

export const getCurrentOriginalImageData = (state: RootState): string | null => {
  const imageId = state.imageEditor.currentImageId;
  if (!imageId || !state.imageEditor.imageSettings[imageId]) {
    return null;
  }
  return state.imageEditor.imageSettings[imageId].originalImageData;
};

export const getCurrentCanvasData = (state: RootState): string | null => {
  const imageId = state.imageEditor.currentImageId;
  if (!imageId || !state.imageEditor.imageSettings[imageId]) {
    return null;
  }

  const history = state.imageEditor.imageSettings[imageId].history;
  return history.canvasData[history.index] || null;
};

export const {
  setCurrentImage,
  updateEditorState,
  setOriginalImageData,
  saveToHistory,
  undoEdit,
  redoEdit,
  initializeHistory,
  resetEditor,
  resetCropMode,
  setSelectedRatio,
  setOriginalImageUrl,
} = imageEditorSlice.actions;

export default imageEditorSlice.reducer;
