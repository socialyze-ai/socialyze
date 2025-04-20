import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define TypeScript interfaces
export interface Label {
  id: string;
  name: string;
  color: string;
  selected?: boolean;
}

interface LabelManagerState {
  labels: Label[];
  searchValue: string;
  filteredLabels: Label[];
  isCreateDialogOpen: boolean;
  newLabelName: string;
  selectedColor: string;
}

// Initial state with default labels
const initialState: LabelManagerState = {
  labels: [
    { id: "1", name: "hello", color: "#9c27b0", selected: false },
    { id: "2", name: "important", color: "#e74c3c", selected: false },
    { id: "3", name: "lop", color: "#1abc9c", selected: false },
    { id: "4", name: "tags", color: "#8bc34a", selected: false },
    { id: "5", name: "test", color: "#e91e63", selected: false },
  ],
  searchValue: "",
  filteredLabels: [
    { id: "1", name: "hello", color: "#9c27b0", selected: false },
    { id: "2", name: "important", color: "#e74c3c", selected: false },
    { id: "3", name: "lop", color: "#1abc9c", selected: false },
    { id: "4", name: "tags", color: "#8bc34a", selected: false },
    { id: "5", name: "test", color: "#e91e63", selected: false },
  ],
  isCreateDialogOpen: false,
  newLabelName: "",
  selectedColor: "#9c27b0",
};

const labelManagerSlice = createSlice({
  name: "labelManager",
  initialState,
  reducers: {
    setInitialLabels: (state, action: PayloadAction<Label[]>) => {
      state.labels = action.payload;
      // Also update filtered labels to match
      state.filteredLabels = action.payload;
    },

    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;

      // Filter labels based on search
      if (action.payload) {
        state.filteredLabels = state.labels.filter((label) =>
          label.name.toLowerCase().includes(action.payload.toLowerCase()),
        );
      } else {
        state.filteredLabels = state.labels;
      }
    },

    toggleLabel: (state, action: PayloadAction<string>) => {
      const labelId = action.payload;
      state.labels = state.labels.map((label) =>
        label.id === labelId ? { ...label, selected: !label.selected } : label,
      );

      // Update filtered labels as well
      state.filteredLabels = state.filteredLabels.map((label) =>
        label.id === labelId ? { ...label, selected: !label.selected } : label,
      );
    },

    unselectAllLabels: (state) => {
      state.labels = state.labels.map((label) => ({ ...label, selected: false }));
      state.filteredLabels = state.filteredLabels.map((label) => ({ ...label, selected: false }));
    },

    setCreateDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateDialogOpen = action.payload;
    },

    setNewLabelName: (state, action: PayloadAction<string>) => {
      state.newLabelName = action.payload;
    },

    setSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColor = action.payload;
    },

    createLabel: (state) => {
      if (
        state.newLabelName.trim() &&
        !state.labels.some((label) => label.name.toLowerCase() === state.newLabelName.toLowerCase())
      ) {
        const newLabel: Label = {
          id: `label-${Date.now()}`,
          name: state.newLabelName.trim(),
          color: state.selectedColor,
          selected: false,
        };

        state.labels.push(newLabel);
        state.newLabelName = "";
        state.isCreateDialogOpen = false;
        state.searchValue = "";
        state.filteredLabels = state.labels;
      }
    },

    initiateLabelCreation: (state) => {
      state.newLabelName = state.searchValue;
      state.isCreateDialogOpen = true;
    },
  },
});

// Selectors
export const selectLabels = (state: RootState) => state.labelManager.labels;
export const selectFilteredLabels = (state: RootState) => state.labelManager.filteredLabels;
export const selectSearchValue = (state: RootState) => state.labelManager.searchValue;
export const selectIsCreateDialogOpen = (state: RootState) => state.labelManager.isCreateDialogOpen;
export const selectNewLabelName = (state: RootState) => state.labelManager.newLabelName;
export const selectSelectedColor = (state: RootState) => state.labelManager.selectedColor;
export const selectSelectedLabels = (state: RootState) =>
  state.labelManager.labels.filter((label) => label.selected);
export const selectSelectedLabelsCount = (state: RootState) =>
  state.labelManager.labels.filter((label) => label.selected).length;

export const {
  setInitialLabels,
  setSearchValue,
  toggleLabel,
  unselectAllLabels,
  setCreateDialogOpen,
  setNewLabelName,
  setSelectedColor,
  createLabel,
  initiateLabelCreation,
} = labelManagerSlice.actions;

export default labelManagerSlice.reducer;
