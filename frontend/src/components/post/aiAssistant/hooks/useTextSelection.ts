import { useRef, useEffect, MutableRefObject } from "react";
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
  isTypingEffect?: boolean;
  showTypeControls?: boolean;
  isPendingContent?: boolean;
  isPendingHashTags?: boolean;
  previousSelectionRef?: MutableRefObject<{ start: number; end: number } | null>;
}

export const useTextSelection = ({
  editorRef,
  content,
  isTyping,
  isTypingEffect = false,
  showTypeControls = false,
  isPendingContent = false,
  isPendingHashTags = false,
  previousSelectionRef: externalSelectionRef,
}: UseTextSelectionParams) => {
  const dispatch = useDispatch();
  const internalSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Use either the external ref provided or the internal one
  const previousSelectionRef = externalSelectionRef || internalSelectionRef;

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

    // Don't handle text selection if AI features are active
    if (isTyping || isTypingEffect || showTypeControls || isPendingContent || isPendingHashTags)
      return;

    // Check if the selection is within the editor
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) return;

    const range = domSelection.getRangeAt(0);
    // Verify the selection is inside our editor
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      // Selection is outside the editor, ignore it
      return;
    }

    const selection = getCurrentSelection();
    const hasSelection = selection && selection.start !== selection.end;

    if (hasSelection && selection) {
      const selStart = selection.start;
      const selEnd = selection.end;
      const selText = selection.text;

      if (selText.trim().length > 0) {
        // Store current selection in previousSelectionRef for future use
        previousSelectionRef.current = { start: selStart, end: selEnd };

        // Always update Redux to ensure consistent state
        dispatch(setSelectedText(selText));
        dispatch(setSelectedRange({ start: selStart, end: selEnd }));
        dispatch(setUnderlineType("selection"));
        dispatch(setIsTextSelected(true));
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

  // Add a function to deliberately clear selection
  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    // Clear the Redux state
    dispatch(setSelectedText(""));
    dispatch(setSelectedRange(null));
    dispatch(setIsTextSelected(false));
    previousSelectionRef.current = null;
  };

  // Improve focusAndSelectText to work better with pasted content
  const focusAndSelectText = (selectedRange: { start: number; end: number } | null) => {
    // Use either the active selection or the stored selection from ref
    const selRange = selectedRange || previousSelectionRef.current;
    if (selRange && editorRef.current) {
      // Focus the editor first
      editorRef.current.focus();

      const attemptSelection = (attempt = 1, maxAttempts = 5) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection) return;

        try {
          // Clear any existing selection first
          selection.removeAllRanges();

          const range = document.createRange();
          const textNodes = getTextNodesIn(editorRef.current);

          if (textNodes.length === 0) {
            if (attempt < maxAttempts) {
              // Try again after a short delay with increased time
              setTimeout(() => attemptSelection(attempt + 1), 50 * attempt);
            }
            return;
          }

          // Find the correct text node and position with improved calculation
          let currentPos = 0;
          let startFound = false;
          let endFound = false;
          let startNode: Text | null = null;
          let startOffset = 0;
          let endNode: Text | null = null;
          let endOffset = 0;

          // Improved node traversal that handles more edge cases
          for (const node of textNodes) {
            const nodeLength = node.length;

            // Check if this node contains the start position
            if (
              !startFound &&
              currentPos <= selRange.start &&
              currentPos + nodeLength >= selRange.start
            ) {
              startNode = node;
              startOffset = selRange.start - currentPos;
              startFound = true;
            }

            // Check if this node contains the end position
            if (
              !endFound &&
              currentPos <= selRange.end &&
              currentPos + nodeLength >= selRange.end
            ) {
              endNode = node;
              endOffset = selRange.end - currentPos;
              endFound = true;
            }

            // If we found both start and end, we can break the loop
            if (startFound && endFound) break;

            currentPos += nodeLength;
          }

          // If start and end nodes are found, create and apply the range
          if (startNode && endNode) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection.addRange(range);

            // Always update Redux state to ensure consistent selection state
            dispatch(setSelectedRange(selRange));
            dispatch(setSelectedText(content.substring(selRange.start, selRange.end)));
            dispatch(setIsTextSelected(true));

            // Store in previousSelectionRef for future use
            previousSelectionRef.current = selRange;
          } else if (attempt < maxAttempts) {
            // If we couldn't find the nodes, try again after a short delay
            setTimeout(() => attemptSelection(attempt + 1), 100 * attempt);
          }
        } catch (e) {
          console.error("Error setting selection:", e);
          if (attempt < maxAttempts) {
            // If there was an error, try again after a short delay
            setTimeout(() => attemptSelection(attempt + 1), 100 * attempt);
          }
        }
      };

      // Start the selection attempt
      attemptSelection();
    }
  };

  return {
    handleTextSelection,
    handleSelectionChange,
    focusAndSelectText,
    clearSelection,
    previousSelectionRef,
  };
};
