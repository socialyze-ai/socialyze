import React, { useRef, useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAITextarea,
  setContent,
  setIsTyping,
  setHasScrollbar,
  setShowAIOptions,
  resetTextState,
  resetConfirmation,
  setUnderlineType,
  setIsFocused,
  setSelectedText,
  setSelectedRange,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";

// Import components
import ConfirmationDialog from "./components/ConfirmationDialog";
import AIOptions from "./components/AIOptions";
import TypeEffect from "./components/TypeEffect";
import TypeEffectControls from "./components/TypeEffectControls";
import SparkleButton from "./components/SparkleButton";

// Import hooks
import { useTypeEffect } from "./hooks/useTypeEffect";
import { useTextSelection } from "./hooks/useTextSelection";
import { useAIContent } from "./hooks/useAIContent";
import { Check, CircleX, RefreshCcw, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionButtons from "./components/ActionButtons";
import RefinePopover from "./components/RefinePopover";

interface AIAssistantTextareaProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  isPostModal?: boolean;
  className?: string;
}

const AIAssistantTextarea: React.FC<AIAssistantTextareaProps> = ({
  content,
  onContentChange,
  placeholder = "What would you like to share?",
  isPostModal = false,
  className,
}) => {
  const dispatch = useDispatch();
  const {
    selectedText,
    selectedRange,
    isTyping,
    underlineType,
    isTextSelected,
    hasScrollbar,
    showAIOptions,
    showConfirmation,
    hashtags,
    generatedContent,
    generatedRefineContent,
  } = useSelector(selectAITextarea);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentBackupRef = useRef<string>(content);
  const [showEditor, setShowEditor] = useState(true);
  const [showRefinePreview, setShowRefinePreview] = useState(false);
  const contentEditableRef = useRef<ContentEditable>(null);

  // Use custom hooks
  const {
    isTypingEffect,
    typedContent,
    fullContent,
    contentType,
    showTypeControls,
    startTypeEffect,
    resetTypeEffect,
  } = useTypeEffect();

  const {
    handleTextSelection,
    handleSelectionChange: hookHandleSelectionChange,
    focusAndSelectText,
    previousSelectionRef,
  } = useTextSelection({
    editorRef,
    content,
    isTyping,
  });

  const {
    handleRefineWithAI,
    handleCompleteWithAI,
    handleGenerateHashtags,
    handleRegenerateRefinedText,
    handleRegenerateCompletion,
    handleRegenerateHashtags,
    isPendingHashTags,
    isPendingContent,
  } = useAIContent({
    content,
    startTypeEffect,
    focusAndSelectText: () => focusAndSelectText(selectedRange),
    previousSelectionRef,
  });

  // Keep a reference to the current content for selection calculations
  useEffect(() => {
    contentBackupRef.current = content;
  }, [content]);

  // Update Redux store with initial content
  useEffect(() => {
    dispatch(setContent(content));
  }, [dispatch, content]);

  // Toggle editor based on typing effect
  useEffect(() => {
    if (isTypingEffect) {
      setShowEditor(false);
    }
  }, [isTypingEffect]);

  // Helper function to get the text directly from the editor
  const getEditorText = () => {
    if (!editorRef.current) return content;
    // Get plain text without HTML tags
    return editorRef.current.innerText || content;
  };

  // Helper function to get text nodes in an element
  const getTextNodesIn = (node: Node): Text[] => {
    const textNodes: Text[] = [];

    const collect = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      } else {
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
          collect(childNodes[i]);
        }
      }
    };

    collect(node);
    return textNodes;
  };

  // Helper function to get the coordinates of the current text selection
  const getSelectionCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if (!editorRect) return null;

    return {
      top: rect.top - editorRect.top + editorRef.current!.scrollTop,
      bottom: rect.bottom - editorRect.top + editorRef.current!.scrollTop,
      left: rect.left - editorRect.left + editorRef.current!.scrollLeft,
      right: rect.right - editorRect.left + editorRef.current!.scrollLeft,
    };
  };

  // Modified function to detect and handle text selection
  const detectTextSelection = () => {
    if (!editorRef.current || isTyping) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      dispatch(resetTextState());
      return;
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
  };

  // Handle text selection with the corrected approach
  const handleUpdatedTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!editorRef.current || isTyping) return;

    // Use a short timeout to ensure selection is complete
    setTimeout(() => {
      detectTextSelection();
    }, 0);
  };

  // Handle editor input
  const handleEditorInput = (e: React.FormEvent<HTMLElement>) => {
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    dispatch(setIsTyping(true));
    dispatch(setShowAIOptions(false));

    // Clear any selection when typing
    dispatch(resetTextState());
    setShowRefinePreview(false);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to mark user as not typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      dispatch(setIsTyping(false));
      // Check for new selections after user stops typing
      detectTextSelection();
    }, 1000);
  };

  // When clicking outside editor, hide all popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        dispatch(setShowAIOptions(false));
        dispatch(resetTextState());
        setShowRefinePreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Check if editor has scrollbar
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      dispatch(setHasScrollbar(editor.scrollHeight > editor.clientHeight));
    }
  }, [content, dispatch]);

  // Handle hovering over editor to show AI suggestions
  const handleEditorMouseEnter = () => {
    if (selectedRange || isTyping || !content.trim().length) return;
    dispatch(setUnderlineType("completion"));
  };

  // Handle clicking the sparkle icon
  const handleSparkleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowAIOptions(!showAIOptions));

    // Set underline type based on whether text is selected
    dispatch(
      setUnderlineType(
        selectedRange && selectedText.trim().length > 0 ? "selection" : "completion",
      ),
    );
  };

  // Handle closing the AI options popup
  const handleCloseOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowAIOptions(false));
  };

  // Handle "Refine with AI" button click
  const handleRefineWithAIClick = () => {
    if (!selectedRange) return;

    handleRefineWithAI(selectedRange);
    setShowRefinePreview(true);
  };

  // Handle editor click to update selection
  const handleEditorClick = (e: React.MouseEvent) => {
    handleUpdatedTextSelection(e);
  };

  // Handle applying the refined text
  const handleRefineAction = () => {
    if (!selectedRange) return;

    const beforeText = content.substring(0, selectedRange.start);
    const afterText = content.substring(selectedRange.end);
    const newContent = beforeText + generatedRefineContent + afterText;

    // Apply the new content
    onContentChange(newContent);
    dispatch(setContent(newContent));
    setShowRefinePreview(false);
    setShowEditor(true);

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Clear selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
        // Create and dispatch an input event
        const inputEvent = new Event("input", { bubbles: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
    }, 50);
  };

  // Confirmation handlers for generated content
  const confirmHashtags = () => {
    const newContent = content + " " + fullContent;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    resetTypeEffect();
    dispatch(resetTextState());

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Clear selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
        // Create and dispatch an input event
        const inputEvent = new Event("input", { bubbles: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
    }, 50);
  };

  const confirmGeneratedContent = () => {
    const newContent = content + " " + fullContent;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    resetTypeEffect();
    dispatch(resetTextState());

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Clear selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
        // Create and dispatch an input event
        const inputEvent = new Event("input", { bubbles: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
    }, 50);
  };

  const handleConfirm = () => {
    if (contentType === "hashtags") {
      confirmHashtags();
    } else if (contentType === "complete") {
      confirmGeneratedContent();
    } else if (contentType === "refine") {
      handleRefineAction();
    }
  };

  const handleRegenerate = () => {
    if (contentType === "hashtags") {
      handleRegenerateHashtags();
    } else if (contentType === "complete") {
      handleRegenerateCompletion();
    } else if (contentType === "refine" && selectedRange) {
      handleRegenerateRefinedText(selectedRange);
    }
  };

  const handleCancel = () => {
    resetTypeEffect();
    setShowRefinePreview(false);

    // Clear DOM selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    // Simulate an input event if there's content
    if (editorRef.current && content.trim()) {
      const inputEvent = new Event("input", { bubbles: true });
      editorRef.current.dispatchEvent(inputEvent);
    } else {
      // If no content, just reset the state
      dispatch(resetTextState());
    }
  };
  // Add focus/blur handlers to the editor
  const handleEditorFocus = () => {
    dispatch(setIsFocused(true));

    // If editor is empty, clear any placeholder text that might be there
    if (!content.trim() && editorRef.current) {
      // Make sure we're not actually clearing real content
      if (editorRef.current.innerHTML === placeholder) {
        editorRef.current.innerHTML = "";
      }
    }
  };

  const handleEditorBlur = () => {
    dispatch(setIsFocused(false));
  };

  // Paste as plain text handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    // Use insertText command for better cross-browser compatibility
    document.execCommand("insertText", false, text);

    // Update content state after paste
    const newContent = editorRef.current?.innerHTML || "";
    onContentChange(newContent);
    dispatch(setContent(newContent));

    // Reset selection state and ensure we're not in "typing" mode
    dispatch(resetTextState());

    // Set typing to true temporarily to prevent unwanted selection behavior
    dispatch(setIsTyping(true));

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // After a short delay, set typing to false to re-enable selection
    typingTimeoutRef.current = setTimeout(() => {
      dispatch(setIsTyping(false));
    }, 100);
  };

  // In your useEffect or existing keyup/mouseup handlers
  useEffect(() => {
    if (editorRef.current && content && !isTyping) {
      const checkSelection = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
          handleTextSelection();
        }
      };

      // Check selection after content changes
      checkSelection();

      // Add event listeners to handle selection changes
      editorRef.current.addEventListener("mouseup", checkSelection);
      editorRef.current.addEventListener("keyup", checkSelection);

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("mouseup", checkSelection);
          editorRef.current.removeEventListener("keyup", checkSelection);
        }
      };
    }
  }, [content, isTyping]);

  const hasContent = content.trim().length > 0;

  return (
    <>
      <div className="relative" ref={editorContainerRef}>
        <ContentEditable
          innerRef={editorRef}
          html={
            content +
            (isTypingEffect || showTypeControls
              ? '<span class="ai-generated">' +
                (isTypingEffect ? typedContent : fullContent) +
                "</span>"
              : "")
          }
          disabled={isTypingEffect || showTypeControls}
          className={cn(
            "resize-none border-0 outline-none focus:outline-none p-3 bg-gray-50 rounded overflow-y-auto whitespace-pre-wrap",
            isPostModal ? "text-sm min-h-[300px]" : "text-base min-h-[200px]",
            hasScrollbar ? "pr-5" : "pr-6",
            className,
          )}
          data-placeholder={placeholder}
          onChange={handleEditorInput}
          onMouseEnter={handleEditorMouseEnter}
          onMouseUp={handleUpdatedTextSelection}
          onKeyUp={handleUpdatedTextSelection}
          onClick={handleEditorClick}
          onKeyDown={handleUpdatedTextSelection}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          onPaste={handlePaste}
        />

        {/* Controls for AI-generated content after typing effect completes */}
        {showTypeControls && (
          <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-sm border border-gray-100 p-1 flex items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1">AI generated:</span>
            <ActionButtons
              handleConfirm={handleConfirm}
              handleRegenerate={handleRegenerate}
              handleCancel={handleCancel}
              isPending={isPendingContent || isPendingHashTags}
            />
          </div>
        )}

        {/* Show the Refine with AI button when text is selected */}
        {selectedRange && selectedText && !isTyping && !isTypingEffect && !showRefinePreview && (
          <div
            className="absolute z-50"
            style={{
              top: `${getSelectionCoordinates()?.bottom || 0}px`,
              left: `${getSelectionCoordinates()?.left || 0}px`,
            }}
          >
            <Button
              onClick={handleRefineWithAIClick}
              className="refine-button flex items-center gap-1.5 px-2 py-1 mt-1 bg-green-50 border border-green-200 hover:bg-green-100 text-xs rounded-md shadow-sm"
              variant="ghost"
              size="sm"
            >
              <Wand2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-700 font-medium">Refine with AI</span>
            </Button>
          </div>
        )}

        {/* Show AI response preview when requested */}
        {showRefinePreview && generatedRefineContent && selectedRange && (
          <div
            className="absolute z-50 bg-white rounded-md shadow-lg max-w-sm border border-gray-200"
            style={{
              top: `${getSelectionCoordinates()?.top || 0}px`,
              left: `${getSelectionCoordinates()?.left || 0}px`,
              transform: "translateY(-100%)",
            }}
          >
            <RefinePopover
              generatedRefineContent={generatedRefineContent}
              setShowRefinePreview={setShowRefinePreview}
              handleRefineAction={handleRefineAction}
              handleRegenerateRefinedText={() =>
                selectedRange && handleRegenerateRefinedText(selectedRange)
              }
              isPendingContent={isPendingContent}
            />
          </div>
        )}

        {/* Sparkles icon at the top right */}
        {hasContent && !isTyping && (
          <SparkleButton
            onClick={handleSparkleClick}
            isTextSelected={isTextSelected}
            hasScrollbar={hasScrollbar}
            isPostModal={isPostModal}
          />
        )}

        {/* AI suggestion card */}
        {showAIOptions && underlineType === "completion" && (
          <AIOptions
            underlineType={underlineType}
            onClose={handleCloseOptions}
            handleCompleteWithAI={handleCompleteWithAI}
            handleGenerateHashtags={handleGenerateHashtags}
            isPendingContent={isPendingContent}
            isPendingHashTags={isPendingHashTags}
          />
        )}
      </div>

      <style>
        {`
          @keyframes pulse-bg {
            0%, 100% { background-color: rgba(191, 219, 254, 0.5); }
            50% { background-color: rgba(191, 219, 254, 1); }
          }
          [contenteditable=true]:empty:not(:focus):before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            display: block;
          }
          .ai-generated {
            background-color: rgba(186, 230, 253, 0.4);
            border-radius: 2px;
            padding: 0 2px;
          }
        `}
      </style>
    </>
  );
};

export default AIAssistantTextarea;
