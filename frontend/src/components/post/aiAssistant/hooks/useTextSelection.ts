import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setSelectedText,
  setSelectedRange,
  setUnderlineType,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";

interface UseTextSelectionParams {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  isTyping: boolean;
}

export const useTextSelection = ({ textareaRef, content, isTyping }: UseTextSelectionParams) => {
  const dispatch = useDispatch();
  const previousSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Handle text selection to show underline and selection card
  const handleTextSelection = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const hasSelection =
      textarea.selectionStart !== undefined &&
      textarea.selectionEnd !== undefined &&
      textarea.selectionStart !== textarea.selectionEnd;

    if (hasSelection) {
      const selStart = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;
      const selText = content.substring(selStart, selEnd);

      if (selText.trim().length > 0) {
        dispatch(setSelectedText(selText));
        dispatch(setSelectedRange({ start: selStart, end: selEnd }));
        dispatch(setUnderlineType("selection"));
        dispatch(setIsTextSelected(true));
        previousSelectionRef.current = { start: selStart, end: selEnd };

        // Position the underline
        const textBeforeCursor = content.substring(0, selStart);
        const selectedTextContent = content.substring(selStart, selEnd);
        const textareaRect = textarea.getBoundingClientRect();

        // Create a temporary element to measure text position
        const mirror = document.createElement("div");
        mirror.style.position = "absolute";
        mirror.style.visibility = "hidden";
        mirror.style.whiteSpace = "pre-wrap";
        mirror.style.wordBreak = "break-word";

        const styles = window.getComputedStyle(textarea);
        ["font-family", "font-size", "line-height", "padding", "width"].forEach((prop) => {
          mirror.style[prop as any] = styles[prop];
        });

        // Insert a marker at the beginning of selection
        mirror.innerHTML = textBeforeCursor.replace(/\n/g, "<br>") + '<span id="marker"></span>';
        document.body.appendChild(mirror);

        const marker = mirror.querySelector("#marker");
        if (marker) {
          const markerRect = marker.getBoundingClientRect();

          // Measure selected text width
          const textWidthMeasure = document.createElement("span");
          textWidthMeasure.style.visibility = "hidden";
          textWidthMeasure.style.position = "absolute";
          textWidthMeasure.style.whiteSpace = "pre";
          textWidthMeasure.style.font = styles.font;
          textWidthMeasure.textContent = selectedTextContent;
          document.body.appendChild(textWidthMeasure);

          const textWidth = textWidthMeasure.getBoundingClientRect().width;
          document.body.removeChild(textWidthMeasure);
        }

        document.body.removeChild(mirror);
      }
    } else if (content.trim().length > 0 && !isTyping) {
      // Show completion suggestion at end of text
      dispatch(setUnderlineType("completion"));
      dispatch(setIsTextSelected(false));
    } else {
      dispatch(setIsTextSelected(false));
    }
  };

  // Handle cursor position change to unselect text
  const handleSelectionChange = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const currentStart = textarea.selectionStart;
    const currentEnd = textarea.selectionEnd;

    // If there's a previous selection and cursor position changed without selecting text
    if (
      previousSelectionRef.current &&
      (currentStart !== previousSelectionRef.current.start ||
        currentEnd !== previousSelectionRef.current.end) &&
      currentStart === currentEnd
    ) {
      // User moved cursor without selecting text, clear selection
      dispatch(setSelectedRange(null));
      dispatch(setSelectedText(""));
      dispatch(setIsTextSelected(false));
      previousSelectionRef.current = null;
    }
  };

  // Helper function to focus and select text
  const focusAndSelectText = (selectedRange: { start: number; end: number } | null) => {
    // Use either the active selection or the stored selection from ref
    const selRange = selectedRange || previousSelectionRef.current;
    if (selRange && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selRange.start, selRange.end);
          // Ensure the selection is also reflected in the Redux state
          if (!selectedRange) {
            dispatch(setSelectedRange(selRange));
            dispatch(setSelectedText(content.substring(selRange.start, selRange.end)));
            dispatch(setIsTextSelected(true));
          }
        }
      }, 0);
    }
  };

  return {
    handleTextSelection,
    handleSelectionChange,
    focusAndSelectText,
    previousSelectionRef,
  };
};
