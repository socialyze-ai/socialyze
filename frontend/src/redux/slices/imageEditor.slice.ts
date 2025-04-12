import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ImageEditorState,
  ImageEditHistory,
} from "../../components/post/editor/types";
import { RootState } from "../store";
import { useSelector } from "react-redux";

// Add the missing fields for crop position
interface ExtendedImageEditorState extends ImageEditorState {
  cropX: number;
  cropY: number;
  selectedRatio: string;
}

// Initial state for the image editor
const initialState: {
  state: ExtendedImageEditorState;
  history: {
    states: ExtendedImageEditorState[];
    canvasData: string[]; // To store canvas data URLs
    index: number;
  };
  originalImageData: string | null;
} = {
  state: {
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
    // Additional fields for crop position
    cropX: 0,
    cropY: 0,
    selectedRatio: "Free",
  },
  history: {
    states: [], // Store full state objects for undo/redo
    canvasData: [], // Store canvas data URLs
    index: -1,
  },
  originalImageData: null,
};

const imageEditorSlice = createSlice({
  name: "imageEditor",
  initialState,
  reducers: {
    updateEditorState: (
      state,
      action: PayloadAction<Partial<ExtendedImageEditorState>>
    ) => {
      state.state = { ...state.state, ...action.payload };
    },

    setOriginalImageData: (state, action: PayloadAction<string | null>) => {
      state.originalImageData = action.payload;
    },

    // Save current state and canvas data to history
    saveToHistory: (state, action: PayloadAction<string>) => {
      // If we're not at the end of history, truncate future states
      const newHistoryStates = state.history.states.slice(
        0,
        state.history.index + 1
      );
      const newHistoryCanvasData = state.history.canvasData.slice(
        0,
        state.history.index + 1
      );

      // Add current state and canvas data to history
      newHistoryStates.push({ ...state.state });
      newHistoryCanvasData.push(action.payload);

      state.history = {
        states: newHistoryStates,
        canvasData: newHistoryCanvasData,
        index: newHistoryStates.length - 1,
      };
    },

    // Step back in history to undo
    undoEdit: (state) => {
      if (state.history.index > 0) {
        state.history.index -= 1;
        // Restore state from history
        state.state = { ...state.history.states[state.history.index] };
      }
    },

    // Step forward in history to redo
    redoEdit: (state) => {
      if (state.history.index < state.history.states.length - 1) {
        state.history.index += 1;
        // Restore state from history
        state.state = { ...state.history.states[state.history.index] };
      }
    },

    // Load initial state
    initializeHistory: (
      state,
      action: PayloadAction<{
        state: ExtendedImageEditorState;
        canvasData: string;
      }>
    ) => {
      state.state = action.payload.state;
      state.history = {
        states: [action.payload.state],
        canvasData: [action.payload.canvasData],
        index: 0,
      };
    },

    resetEditor: (state) => {
      const resetState = {
        ...state.state,
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

      state.state = resetState;
      // We don't save to history here - that will be done after drawing
    },

    resetCropMode: (state) => {
      state.state = {
        ...state.state,
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
      state.state.selectedRatio = action.payload;
    },
  },
});

// Create a selector to get the current canvas data
export const getCurrentCanvasData = (state: RootState): string | null => {
  return (
    state.imageEditor.history.canvasData[state.imageEditor.history.index] ||
    null
  );
};

export const {
  updateEditorState,
  setOriginalImageData,
  saveToHistory,
  undoEdit,
  redoEdit,
  initializeHistory,
  resetEditor,
  resetCropMode,
  setSelectedRatio,
} = imageEditorSlice.actions;

export default imageEditorSlice.reducer;
