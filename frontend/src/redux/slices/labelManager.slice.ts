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

// Helper to get selected labels from localStorage
const getSelectedLabelsFromStorage = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem("selectedLabels");
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save selected labels to localStorage
const saveSelectedLabelsToStorage = (selectedLabels: Record<string, boolean>) => {
  try {
    localStorage.setItem("selectedLabels", JSON.stringify(selectedLabels));
  } catch (e) {
    console.error("Failed to save selected labels to localStorage", e);
  }
};

// Initial state with empty labels (will be populated from API)
const initialState: LabelManagerState = {
  labels: [],
  searchValue: "",
  filteredLabels: [],
  isCreateDialogOpen: false,
  newLabelName: "",
  selectedColor: "#9c27b0",
};

const labelManagerSlice = createSlice({
  name: "labelManager",
  initialState,
  reducers: {
    setInitialLabels: (state, action: PayloadAction<Label[]>) => {
      // Get selected labels from localStorage
      const storedSelectedLabels = getSelectedLabelsFromStorage();

      // Apply stored selection state to labels
      const labelsWithSelection = action.payload.map((label) => ({
        ...label,
        selected: storedSelectedLabels[label.id] || false,
      }));

      state.labels = labelsWithSelection;
      state.filteredLabels = labelsWithSelection;
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

      // Update labels in state
      state.labels = state.labels.map((label) =>
        label.id === labelId ? { ...label, selected: !label.selected } : label,
      );

      // Update filtered labels as well
      state.filteredLabels = state.filteredLabels.map((label) =>
        label.id === labelId ? { ...label, selected: !label.selected } : label,
      );

      // Update localStorage
      const storedLabels = getSelectedLabelsFromStorage();
      const isSelected = state.labels.find((l) => l.id === labelId)?.selected || false;

      if (isSelected) {
        storedLabels[labelId] = true;
      } else {
        delete storedLabels[labelId];
      }

      saveSelectedLabelsToStorage(storedLabels);
    },

    unselectAllLabels: (state) => {
      state.labels = state.labels.map((label) => ({ ...label, selected: false }));
      state.filteredLabels = state.filteredLabels.map((label) => ({ ...label, selected: false }));

      // Clear localStorage
      saveSelectedLabelsToStorage({});
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
      // This is now handled by the API, but we keep this for local UI updates
      // The actual API call is made in the component
      if (
        state.newLabelName.trim() &&
        !state.labels.some((label) => label.name.toLowerCase() === state.newLabelName.toLowerCase())
      ) {
        // Reset state after label creation
        state.newLabelName = "";
        state.isCreateDialogOpen = false;
        state.searchValue = "";
        // Labels will be updated when the API responds
      }
    },

    initiateLabelCreation: (state) => {
      state.newLabelName = state.searchValue;
      state.isCreateDialogOpen = true;
    },

    removeDeletedLabel: (state, action: PayloadAction<string>) => {
      const labelId = action.payload;

      // Remove from state
      state.labels = state.labels.filter((label) => label.id !== labelId);
      state.filteredLabels = state.filteredLabels.filter((label) => label.id !== labelId);

      // Remove from localStorage
      const storedLabels = getSelectedLabelsFromStorage();
      delete storedLabels[labelId];
      saveSelectedLabelsToStorage(storedLabels);
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
  removeDeletedLabel,
} = labelManagerSlice.actions;

export default labelManagerSlice.reducer;
