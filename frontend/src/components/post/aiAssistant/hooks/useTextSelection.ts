import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setSelectedText,
  setSelectedRange,
  setUnderlineType,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";

interface UseTextSelectionParams {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  isTyping: boolean;
}

export const useTextSelection = ({ editorRef, content, isTyping }: UseTextSelectionParams) => {
  const dispatch = useDispatch();
  const previousSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Helper function to get text nodes in an element
  const getTextNodesIn = (node: Node): Text[] => {
    const textNodes: Text[] = [];
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        textNodes.push(...getTextNodesIn(childNodes[i]));
      }
    }
    return textNodes;
  };

  // Get current selection ranges
  const getCurrentSelection = (): { start: number; end: number; text: string } | null => {
    if (!editorRef.current) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    // Get all text nodes
    const textNodes = getTextNodesIn(editorRef.current);
    if (textNodes.length === 0) return null;

    // Calculate offset in the whole text
    let startOffset = 0;
    let endOffset = 0;
    let startNodeFound = false;
    let endNodeFound = false;

    for (const node of textNodes) {
      if (node === range.startContainer) {
        startOffset += range.startOffset;
        startNodeFound = true;
      } else if (!startNodeFound) {
        startOffset += node.length;
      }

      if (node === range.endContainer) {
        endOffset =
          startOffset + (range.endOffset - (node === range.startContainer ? range.startOffset : 0));
        endNodeFound = true;
        break;
      } else if (startNodeFound && !endNodeFound) {
        endOffset = startOffset + node.length;
      }
    }

    // If we couldn't determine the range, just use the content
    if (!startNodeFound || !endNodeFound) {
      return null;
    }

    return {
      start: startOffset,
      end: endOffset,
      text: content.substring(startOffset, endOffset),
    };
  };

  // Handle text selection to show underline and selection card
  const handleTextSelection = () => {
    if (!editorRef.current) return;

    const selection = getCurrentSelection();
    const hasSelection = selection && selection.start !== selection.end;

    if (hasSelection && selection) {
      const selStart = selection.start;
      const selEnd = selection.end;
      const selText = selection.text;

      if (selText.trim().length > 0) {
        dispatch(setSelectedText(selText));
        dispatch(setSelectedRange({ start: selStart, end: selEnd }));
        dispatch(setUnderlineType("selection"));
        dispatch(setIsTextSelected(true));
        previousSelectionRef.current = { start: selStart, end: selEnd };
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
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (selection.isCollapsed && previousSelectionRef.current) {
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
    if (selRange && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();

          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            const textNodes = getTextNodesIn(editorRef.current);

            // Find the correct text node and position
            let currentPos = 0;
            let startNode = textNodes[0];
            let startOffset = selRange.start;
            let endNode = textNodes[0];
            let endOffset = selRange.end;

            // Find start node and offset
            for (const node of textNodes) {
              if (currentPos + node.length > selRange.start) {
                startNode = node;
                startOffset = selRange.start - currentPos;
                break;
              }
              currentPos += node.length;
            }

            // Reset for end node search
            currentPos = 0;

            // Find end node and offset
            for (const node of textNodes) {
              if (currentPos + node.length > selRange.end) {
                endNode = node;
                endOffset = selRange.end - currentPos;
                break;
              }
              currentPos += node.length;
            }

            // Set the range
            try {
              range.setStart(startNode, startOffset);
              range.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);

              // Ensure the selection is also reflected in the Redux state
              if (!selectedRange) {
                dispatch(setSelectedRange(selRange));
                dispatch(setSelectedText(content.substring(selRange.start, selRange.end)));
                dispatch(setIsTextSelected(true));
              }
            } catch (e) {
              console.error("Error setting selection:", e);
            }
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
