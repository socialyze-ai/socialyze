import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface SelectionRange {
  start: number;
  end: number;
}

export interface AITextareaState {
  // Content and selection state
  content: string;
  selectedText: string;
  selectedRange: SelectionRange | null;
  isTyping: boolean;
  underlineType: "selection" | "completion";
  isTextSelected: boolean;
  hasScrollbar: boolean;

  // AI Options and UI state
  showAIOptions: boolean;
  showConfirmation: boolean;

  // Generated content states
  hashtags: string;
  generatedContent: string;
  generatedRefineContent: string;

  // Loading states
  isPendingGeneratingHashTags: boolean;
  isPendingGeneratingContent: boolean;
}

const initialState: AITextareaState = {
  content: "",
  selectedText: "",
  selectedRange: null,
  isTyping: false,
  underlineType: "selection",
  isTextSelected: false,
  hasScrollbar: false,

  showAIOptions: false,
  showConfirmation: false,

  hashtags: "",
  generatedContent: "",
  generatedRefineContent: "",

  isPendingGeneratingHashTags: false,
  isPendingGeneratingContent: false,
};

export const aiTextareaSlice = createSlice({
  name: "aiTextarea",
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
    setSelectedText: (state, action: PayloadAction<string>) => {
      state.selectedText = action.payload;
    },
    setSelectedRange: (state, action: PayloadAction<SelectionRange | null>) => {
      state.selectedRange = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setUnderlineType: (state, action: PayloadAction<"selection" | "completion">) => {
      state.underlineType = action.payload;
    },
    setIsTextSelected: (state, action: PayloadAction<boolean>) => {
      state.isTextSelected = action.payload;
    },
    setHasScrollbar: (state, action: PayloadAction<boolean>) => {
      state.hasScrollbar = action.payload;
    },
    setShowAIOptions: (state, action: PayloadAction<boolean>) => {
      state.showAIOptions = action.payload;
    },
    setShowConfirmation: (state, action: PayloadAction<boolean>) => {
      state.showConfirmation = action.payload;
    },
    setHashtags: (state, action: PayloadAction<string>) => {
      state.hashtags = action.payload;
    },
    setGeneratedContent: (state, action: PayloadAction<string>) => {
      state.generatedContent = action.payload;
    },
    setGeneratedRefineContent: (state, action: PayloadAction<string>) => {
      state.generatedRefineContent = action.payload;
    },
    setIsPendingGeneratingHashTags: (state, action: PayloadAction<boolean>) => {
      state.isPendingGeneratingHashTags = action.payload;
    },
    setIsPendingGeneratingContent: (state, action: PayloadAction<boolean>) => {
      state.isPendingGeneratingContent = action.payload;
    },
    resetTextState: (state) => {
      state.selectedRange = null;
      state.selectedText = "";
      state.isTextSelected = false;
    },
    resetConfirmation: (state) => {
      state.showConfirmation = false;
      state.showAIOptions = false;
      state.hashtags = "";
      state.generatedContent = "";
      state.generatedRefineContent = "";
      state.isPendingGeneratingHashTags = false;
      state.isPendingGeneratingContent = false;
    },
    reset: () => initialState,
  },
});

// Selectors
export const selectAITextarea = (state: RootState) => state.aiTextarea;
export const selectContent = (state: RootState) => state.aiTextarea.content;
export const selectSelectedText = (state: RootState) => state.aiTextarea.selectedText;
export const selectSelectedRange = (state: RootState) => state.aiTextarea.selectedRange;
export const selectIsTyping = (state: RootState) => state.aiTextarea.isTyping;
export const selectUnderlineType = (state: RootState) => state.aiTextarea.underlineType;
export const selectIsTextSelected = (state: RootState) => state.aiTextarea.isTextSelected;
export const selectHasScrollbar = (state: RootState) => state.aiTextarea.hasScrollbar;
export const selectShowAIOptions = (state: RootState) => state.aiTextarea.showAIOptions;
export const selectShowConfirmation = (state: RootState) => state.aiTextarea.showConfirmation;
export const selectHashtags = (state: RootState) => state.aiTextarea.hashtags;
export const selectGeneratedContent = (state: RootState) => state.aiTextarea.generatedContent;
export const selectGeneratedRefineContent = (state: RootState) =>
  state.aiTextarea.generatedRefineContent;
export const selectIsPendingGeneratingHashTags = (state: RootState) =>
  state.aiTextarea.isPendingGeneratingHashTags;
export const selectIsPendingGeneratingContent = (state: RootState) =>
  state.aiTextarea.isPendingGeneratingContent;

export const {
  setContent,
  setSelectedText,
  setSelectedRange,
  setIsTyping,
  setUnderlineType,
  setIsTextSelected,
  setHasScrollbar,
  setShowAIOptions,
  setShowConfirmation,
  setHashtags,
  setGeneratedContent,
  setGeneratedRefineContent,
  setIsPendingGeneratingHashTags,
  setIsPendingGeneratingContent,
  resetTextState,
  resetConfirmation,
  reset,
} = aiTextareaSlice.actions;

export default aiTextareaSlice.reducer;
