import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define TypeScript interfaces
export interface Tag {
  id: string;
  name: string;
  color: string;
  selected?: boolean;
}

interface TagManagerState {
  tags: Tag[];
  searchValue: string;
  filteredTags: Tag[];
  isCreateDialogOpen: boolean;
  newTagName: string;
  selectedColor: string;
}

// Initial state with default tags
const initialState: TagManagerState = {
  tags: [
    { id: "1", name: "hello", color: "#9c27b0", selected: false },
    { id: "2", name: "important", color: "#e74c3c", selected: false },
    { id: "3", name: "lop", color: "#1abc9c", selected: false },
    { id: "4", name: "tags", color: "#8bc34a", selected: false },
    { id: "5", name: "test", color: "#e91e63", selected: false },
  ],
  searchValue: "",
  filteredTags: [
    { id: "1", name: "hello", color: "#9c27b0", selected: false },
    { id: "2", name: "important", color: "#e74c3c", selected: false },
    { id: "3", name: "lop", color: "#1abc9c", selected: false },
    { id: "4", name: "tags", color: "#8bc34a", selected: false },
    { id: "5", name: "test", color: "#e91e63", selected: false },
  ],
  isCreateDialogOpen: false,
  newTagName: "",
  selectedColor: "#9c27b0",
};

const tagManagerSlice = createSlice({
  name: "tagManager",
  initialState,
  reducers: {
    setInitialTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
      // Also update filtered tags to match
      state.filteredTags = action.payload;
    },

    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;

      // Filter tags based on search
      if (action.payload) {
        state.filteredTags = state.tags.filter((tag) =>
          tag.name.toLowerCase().includes(action.payload.toLowerCase()),
        );
      } else {
        state.filteredTags = state.tags;
      }
    },

    toggleTag: (state, action: PayloadAction<string>) => {
      const tagId = action.payload;
      state.tags = state.tags.map((tag) =>
        tag.id === tagId ? { ...tag, selected: !tag.selected } : tag,
      );

      // Update filtered tags as well
      state.filteredTags = state.filteredTags.map((tag) =>
        tag.id === tagId ? { ...tag, selected: !tag.selected } : tag,
      );
    },

    unselectAllTags: (state) => {
      state.tags = state.tags.map((tag) => ({ ...tag, selected: false }));
      state.filteredTags = state.filteredTags.map((tag) => ({ ...tag, selected: false }));
    },

    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateDialogOpen = action.payload;
    },

    setNewTagName: (state, action: PayloadAction<string>) => {
      state.newTagName = action.payload;
    },

    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },

    createTag: (state) => {
      if (
        state.newTagName.trim() &&
        !state.tags.some((tag) => tag.name.toLowerCase() === state.newTagName.toLowerCase())
      ) {
        const newTag: Tag = {
          id: `tag-${Date.now()}`,
          name: state.newTagName.trim(),
          color: state.selectedColor,
          selected: false,
        };

        state.tags.push(newTag);
        state.newTagName = "";
        state.isCreateDialogOpen = false;
        state.searchValue = "";
        state.filteredTags = state.tags;
      }
    },

    initiateTagCreation: (state) => {
      state.newTagName = state.searchValue;
      state.isCreateDialogOpen = true;
    },
  },
});

// Selectors
export const selectTags = (state: RootState) => state.tagManager.tags;
export const selectFilteredTags = (state: RootState) => state.tagManager.filteredTags;
export const selectSearchValue = (state: RootState) => state.tagManager.searchValue;
export const selectIsCreateDialogOpen = (state: RootState) => state.tagManager.isCreateDialogOpen;
export const selectNewTagName = (state: RootState) => state.tagManager.newTagName;
export const selectSelectedColor = (state: RootState) => state.tagManager.selectedColor;
export const selectSelectedTags = (state: RootState) =>
  state.tagManager.tags.filter((tag) => tag.selected);
export const selectSelectedTagsCount = (state: RootState) =>
  state.tagManager.tags.filter((tag) => tag.selected).length;

export const {
  setInitialTags,
  setSearchValue,
  toggleTag,
  unselectAllTags,
  setCreateDialogOpen,
  setNewTagName,
  setSelectedColor,
  createTag,
  initiateTagCreation,
} = tagManagerSlice.actions;

export default tagManagerSlice.reducer;
