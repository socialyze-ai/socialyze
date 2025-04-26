import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface AIAssistantState {
  // Stage management
  currentStage: number;

  // User input
  prompt: string;
  selectedTone: string;

  // Suggestions management
  suggestions: string[];
  selectedSuggestion: number;
  finalContent: string;
  isFavorite: boolean;

  // Example prompts
  examplePrompts: string[];
}

const initialState: AIAssistantState = {
  currentStage: 1,
  prompt: "",
  selectedTone: "balanced",
  suggestions: [
    "Unlock your brand's potential with cutting-edge marketing tactics and imaginative strategies! Explore customized solutions that can dramatically boost your brand's growth and visibility. For example, personalized campaigns and data-driven insights have been shown to elevate engagement by over 35%, thus ensuring a more profound connection with your audience. #MarketingMagic #BrandSuccess",
    "Transform your marketing approach with data-driven strategies and customer-centric campaigns. Our research shows that personalized content increases engagement by 35% and conversion rates by 20%. Ready to elevate your brand's performance?",
    "Looking to amplify your brand's impact? Our marketing solutions combine analytical precision with creative innovation, delivering measurable results. Industry leaders have seen 30-40% improvement in customer retention using our approach.",
  ],
  selectedSuggestion: 0,
  finalContent: "",
  isFavorite: false,
  examplePrompts: [
    "Write something on marketing",
    "Write something on travel",
    "Write something on technology",
  ],
};

export const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {
    setCurrentStage: (state, action: PayloadAction<number>) => {
      state.currentStage = action.payload;
    },
    setPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    clearPrompt: (state) => {
      state.prompt = "";
    },
    setSelectedTone: (state, action: PayloadAction<string>) => {
      state.selectedTone = action.payload;
    },
    setSelectedSuggestion: (state, action: PayloadAction<number>) => {
      state.selectedSuggestion = action.payload;
    },
    setFinalContent: (state, action: PayloadAction<string>) => {
      state.finalContent = action.payload;
    },
    toggleFavorite: (state) => {
      state.isFavorite = !state.isFavorite;
    },
    reset: (state) => {
      state.currentStage = 1;
      state.prompt = "";
      state.selectedSuggestion = 0;
      state.finalContent = "";
      state.isFavorite = false;
    },
    // This would be used for the AI generation API call in a real app
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
  },
});

// Selectors
export const selectAIAssistant = (state: RootState) => state.aiAssistant;
export const selectCurrentStage = (state: RootState) => state.aiAssistant.currentStage;
export const selectPrompt = (state: RootState) => state.aiAssistant.prompt;
export const selectSelectedTone = (state: RootState) => state.aiAssistant.selectedTone;
export const selectSuggestions = (state: RootState) => state.aiAssistant.suggestions;
export const selectSelectedSuggestion = (state: RootState) => state.aiAssistant.selectedSuggestion;
export const selectFinalContent = (state: RootState) => state.aiAssistant.finalContent;
export const selectIsFavorite = (state: RootState) => state.aiAssistant.isFavorite;
export const selectExamplePrompts = (state: RootState) => state.aiAssistant.examplePrompts;

export const {
  setCurrentStage,
  setPrompt,
  clearPrompt,
  setSelectedTone,
  setSelectedSuggestion,
  setFinalContent,
  toggleFavorite,
  reset,
  setSuggestions,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;
