import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TemplateGenerationState {
  isModalOpen: boolean;
  selectedTemplate: any;
  generatedContent: string;
  prompt: string;
  isGenerating: boolean;
  suggestions: string[];
}

const initialState: TemplateGenerationState = {
  isModalOpen: false,
  selectedTemplate: null,
  generatedContent: "",
  prompt: "",
  isGenerating: false,
  suggestions: [
    "Write a professional post about our new product launch",
    "Create an engaging announcement for our upcoming event",
    "Generate a post highlighting customer success stories",
  ],
};

export const templateGenerationSlice = createSlice({
  name: "templateGeneration",
  initialState,
  reducers: {
    setIsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setSelectedTemplate: (state, action: PayloadAction<any>) => {
      state.selectedTemplate = action.payload;
    },
    setGeneratedContent: (state, action: PayloadAction<string>) => {
      state.generatedContent = action.payload;
    },
    setPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    resetTemplateGeneration: (state) => {
      state.generatedContent = "";
      state.prompt = "";
      state.isGenerating = false;
    },
  },
});

export const {
  setIsModalOpen,
  setSelectedTemplate,
  setGeneratedContent,
  setPrompt,
  setIsGenerating,
  resetTemplateGeneration,
} = templateGenerationSlice.actions;

export default templateGenerationSlice.reducer;
