import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";

export interface ImageItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  canvasIndex: number; // Used primarily for preview, not restriction
  zIndex: number; // Layer ordering
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
  zIndex: number; // Layer ordering
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
  nextZIndex: number; // Track the next available z-index
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
  nextZIndex: 1, // Start z-index at 1
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
      // Ensure all images have a zIndex, use the existing one or assign a new one
      state.images = action.payload.map((img) => ({
        ...img,
        zIndex: img.zIndex || state.nextZIndex++,
      }));
    },
    addImage: (state, action: PayloadAction<ImageItem>) => {
      // Assign a z-index if not provided
      const newImage = {
        ...action.payload,
        zIndex: action.payload.zIndex || state.nextZIndex,
      };
      state.images.push(newImage);
      state.nextZIndex++;
    },
    setText: (state, action: PayloadAction<TextItem[]>) => {
      // Ensure all texts have a zIndex, use the existing one or assign a new one
      state.texts = action.payload.map((txt) => ({
        ...txt,
        zIndex: txt.zIndex || state.nextZIndex++,
      }));
    },
    addText: (state, action: PayloadAction<TextItem>) => {
      // Assign a z-index if not provided
      const newText = {
        ...action.payload,
        zIndex: action.payload.zIndex || state.nextZIndex,
      };
      state.texts.push(newText);
      state.nextZIndex++;
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
    // New actions for layer management
    updateItemZIndex: (state, action: PayloadAction<{ id: string; zIndex: number }>) => {
      // Try to find the item in images
      const image = state.images.find((img) => img.id === action.payload.id);
      if (image) {
        image.zIndex = action.payload.zIndex;
        return;
      }

      // If not found in images, try texts
      const text = state.texts.find((txt) => txt.id === action.payload.id);
      if (text) {
        text.zIndex = action.payload.zIndex;
      }
    },

    moveForward: (state, action: PayloadAction<string>) => {
      // Get all items
      const allItems = [...state.images, ...state.texts];
      if (allItems.length <= 1) return;

      // Sort items by z-index
      const sortedItems = [...allItems].sort((a, b) => a.zIndex - b.zIndex);

      // Find the current item's index in the sorted array
      const currentIndex = sortedItems.findIndex((item) => item.id === action.payload);

      // If this is already the topmost item or not found, do nothing
      if (currentIndex === -1 || currentIndex === sortedItems.length - 1) return;

      // Swap positions with the item above
      const temp = sortedItems[currentIndex];
      sortedItems[currentIndex] = sortedItems[currentIndex + 1];
      sortedItems[currentIndex + 1] = temp;

      // Reassign z-indices based on new order
      sortedItems.forEach((item, index) => {
        const newZIndex = index + 1;

        if (state.images.some((img) => img.id === item.id)) {
          const img = state.images.find((img) => img.id === item.id);
          if (img) img.zIndex = newZIndex;
        } else {
          const txt = state.texts.find((txt) => txt.id === item.id);
          if (txt) txt.zIndex = newZIndex;
        }
      });

      // Update nextZIndex
      state.nextZIndex = allItems.length + 1;
    },
    moveBackward: (state, action: PayloadAction<string>) => {
      // Get all items
      const allItems = [...state.images, ...state.texts];
      if (allItems.length <= 1) return;

      // Sort items by z-index
      const sortedItems = [...allItems].sort((a, b) => a.zIndex - b.zIndex);

      // Find the current item's index in the sorted array
      const currentIndex = sortedItems.findIndex((item) => item.id === action.payload);

      // If this is already the bottommost item or not found, do nothing
      if (currentIndex <= 0) return;

      // Swap positions with the item below
      const temp = sortedItems[currentIndex];
      sortedItems[currentIndex] = sortedItems[currentIndex - 1];
      sortedItems[currentIndex - 1] = temp;

      // Reassign z-indices based on new order
      sortedItems.forEach((item, index) => {
        const newZIndex = index + 1;

        if (state.images.some((img) => img.id === item.id)) {
          const img = state.images.find((img) => img.id === item.id);
          if (img) img.zIndex = newZIndex;
        } else {
          const txt = state.texts.find((txt) => txt.id === item.id);
          if (txt) txt.zIndex = newZIndex;
        }
      });

      // Update nextZIndex
      state.nextZIndex = allItems.length + 1;
    },
    // Add a new action to normalize z-indices
    normalizeZIndices: (state) => {
      // Combine all items into a single array
      const allItems = [...state.images, ...state.texts];

      // If there are no items, nothing to normalize
      if (allItems.length === 0) return;

      // Sort all items by their current z-index
      const sortedItems = [...allItems].sort((a, b) => a.zIndex - b.zIndex);

      // Reassign z-indices as consecutive integers starting from 1
      sortedItems.forEach((item, index) => {
        const newZIndex = index + 1;

        // Update the item in the appropriate collection
        if (state.images.some((img) => img.id === item.id)) {
          const image = state.images.find((img) => img.id === item.id);
          if (image) image.zIndex = newZIndex;
        } else {
          const text = state.texts.find((txt) => txt.id === item.id);
          if (text) text.zIndex = newZIndex;
        }
      });

      // Update nextZIndex to be one more than the highest assigned z-index
      state.nextZIndex = allItems.length + 1;
    },

    reorderLayers: (
      state,
      action: PayloadAction<{ itemId: string; fromIndex: number; toIndex: number }>,
    ) => {
      // Get all items and sort by z-index (highest first, matching LayerManager display)
      const allItems = [...state.images, ...state.texts];
      const sortedItems = [...allItems].sort((a, b) => b.zIndex - a.zIndex);

      const { itemId, fromIndex, toIndex } = action.payload;

      // Validate indices
      if (
        fromIndex < 0 ||
        fromIndex >= sortedItems.length ||
        toIndex < 0 ||
        toIndex >= sortedItems.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      // Remove the item from its current position and insert at new position
      const [movedItem] = sortedItems.splice(fromIndex, 1);
      sortedItems.splice(toIndex, 0, movedItem);

      // Reassign z-indices based on new order
      // Since sortedItems is ordered from highest to lowest z-index,
      // we assign z-indices in reverse order (highest index gets highest z-index)
      sortedItems.forEach((item, index) => {
        const newZIndex = sortedItems.length - index;

        // Update the item in the appropriate collection
        if (state.images.some((img) => img.id === item.id)) {
          const image = state.images.find((img) => img.id === item.id);
          if (image) image.zIndex = newZIndex;
        } else {
          const text = state.texts.find((txt) => txt.id === item.id);
          if (text) text.zIndex = newZIndex;
        }
      });

      // Update nextZIndex
      state.nextZIndex = allItems.length + 1;
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
  updateItemZIndex,
  moveForward,
  moveBackward,
  normalizeZIndices,
  reorderLayers,
} = templateSlice.actions;

export default templateSlice.reducer;
