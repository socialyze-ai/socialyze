import { useCallback } from "react";

interface Coordinates {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const useSelectionCoordinates = (editorRef: React.RefObject<HTMLDivElement>) => {
  // Get coordinates of the current text selection
  const getSelectionCoordinates = useCallback((): Coordinates | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    if (!editorRef.current) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    return {
      top: rect.top - editorRect.top + editorRef.current.scrollTop,
      bottom: rect.bottom - editorRect.top + editorRef.current.scrollTop,
      left: rect.left - editorRect.left + editorRef.current.scrollLeft,
      right: rect.right - editorRect.left + editorRef.current.scrollLeft,
    };
  }, [editorRef]);

  return { getSelectionCoordinates };
};
