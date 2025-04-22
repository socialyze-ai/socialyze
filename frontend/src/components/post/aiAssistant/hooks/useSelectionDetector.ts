import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  setSelectedText,
  setSelectedRange,
  resetTextState,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";

interface SelectionDetectorProps {
  editorRef: React.RefObject<HTMLDivElement>;
  isTyping: boolean;
}

export const useSelectionDetector = ({ editorRef, isTyping }: SelectionDetectorProps) => {
  const dispatch = useDispatch();

  // Helper function to get the text directly from the editor
  const getEditorText = useCallback(() => {
    if (!editorRef.current) return "";
    // Get plain text without HTML tags
    return editorRef.current.innerText || "";
  }, [editorRef]);

  // Modified function to detect and handle text selection
  const detectTextSelection = useCallback(() => {
    if (!editorRef.current || isTyping) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      dispatch(resetTextState());
      return null;
    }

    // If we have selected text, store it
    const range = selection.getRangeAt(0);
    const editorContent = getEditorText();

    // Find the position in the plain text content
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    const selectionRange = {
      start,
      end: start + selectedText.length,
    };

    dispatch(setSelectedText(selectedText));
    dispatch(setSelectedRange(selectionRange));
    dispatch(setIsTextSelected(true));

    return { selectedText, selectionRange };
  }, [editorRef, isTyping, dispatch, getEditorText]);

  // Function to clear any text selection in the DOM
  const clearSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    dispatch(resetTextState());
  }, [dispatch]);

  return { detectTextSelection, clearSelection };
};
