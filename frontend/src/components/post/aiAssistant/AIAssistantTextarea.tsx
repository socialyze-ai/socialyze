import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContentEditable from "react-contenteditable";
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
  setIsTextSelected,
  setSelectedRange,
} from "@/redux/slices/aiTextarea.slice";

// Import components
import ContentEditableWrapper from "./components/ContentEditableWrapper";
import AIOptions from "./components/AIOptions";
import SelectionTooltip from "./components/SelectionTooltip";
import SparkleButton from "./components/SparkleButton";
import RefinePopover from "./components/RefinePopover";
import GeneratedContentControls from "./components/GeneratedContentControls";
import GeneratedContentControlsPortal from "./components/GeneratedContentControlsPortal";
import { Popover, PopoverTrigger } from "@/components/ui/popover";

// Import hooks
import { useTypeEffect } from "./hooks/useTypeEffect";
import { useTextSelection } from "./hooks/useTextSelection";
import { useAIContent } from "./hooks/useAIContent";
import { useSelectionCoordinates } from "./hooks/useSelectionCoordinates";
import { useSelectionDetector } from "./hooks/useSelectionDetector";

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
  const previousSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const [showEditor, setShowEditor] = useState(true);
  const [showRefinePreview, setShowRefinePreview] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const contentEditableRef = useRef<ContentEditable>(null);
  // Store selection coordinates in a ref to preserve them during regeneration
  const selectionCoordsRef = useRef<{ top: number; left: number } | null>(null);
  // Add a new state to track ongoing AI operations
  const [activeAIOperation, setActiveAIOperation] = useState<string | null>(null);

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
    clearSelection: clearTextSelection,
  } = useTextSelection({
    editorRef,
    content,
    isTyping,
    isTypingEffect,
    showTypeControls,
    // We'll pass placeholders for these since they're not defined yet
    isPendingContent: false,
    isPendingHashTags: false,
    previousSelectionRef,
  });

  // Now define the AI content handlers
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
    focusAndSelectText: (range: { start: number; end: number } | null) => focusAndSelectText(range),
    previousSelectionRef,
  });

  const { getSelectionCoordinates } = useSelectionCoordinates(editorRef);
  const { detectTextSelection, clearSelection: originalClearSelection } = useSelectionDetector({
    editorRef,
    isTyping,
    isPendingContent,
    isPendingHashTags,
    onBeforeSelectionDetected: () => {
      // Reset refine preview before detecting a new selection
      if (showRefinePreview) {
        setShowRefinePreview(false);
      }
    },
  });

  // Wrap the original clearSelection to also close refine preview
  const clearSelection = () => {
    setShowRefinePreview(false);
    setIsRefining(false);
    originalClearSelection();
    clearTextSelection();
  };

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

  // Check if editor has scrollbar
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      dispatch(setHasScrollbar(editor.scrollHeight > editor.clientHeight));
    }
  }, [content, dispatch]);

  // Add selection detection on editor events
  useEffect(() => {
    if (editorRef.current && content && !isTyping) {
      const checkSelection = () => {
        detectTextSelection();
      };

      editorRef.current.addEventListener("mouseup", checkSelection);
      editorRef.current.addEventListener("keyup", checkSelection);

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("mouseup", checkSelection);
          editorRef.current.removeEventListener("keyup", checkSelection);
        }
      };
    }
  }, [content, isTyping, detectTextSelection]);

  // When clicking outside editor, hide all popups only if not in an active operation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        // Only hide AI options and reset state if there's no active AI operation
        if (!activeAIOperation && !isRefining && !isPendingContent && !isPendingHashTags) {
          dispatch(setShowAIOptions(false));
          dispatch(resetTextState());

          // Explicitly reset refine preview state
          if (showRefinePreview && !isRefining) {
            setShowRefinePreview(false);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    dispatch,
    showRefinePreview,
    activeAIOperation,
    isRefining,
    isPendingContent,
    isPendingHashTags,
  ]);

  // Handle editor input
  const handleEditorInput = (e: React.FormEvent<HTMLElement>) => {
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    dispatch(setIsTyping(true));

    // Only hide AI options if there's no active AI operation
    if (!activeAIOperation) {
      dispatch(setShowAIOptions(false));
    }

    // Clear any selection when typing
    dispatch(resetTextState());

    // Only hide refine preview if not actively refining
    if (!isRefining) {
      setShowRefinePreview(false);
    }

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

  // Handle text selection with the corrected approach
  const handleUpdatedTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!editorRef.current || isTyping) return;

    // If there's an active refine preview, only close it if we're not in an active refining operation
    if (showRefinePreview && !isRefining) {
      setShowRefinePreview(false);
    }

    // Use a short timeout to ensure selection is complete
    setTimeout(() => {
      detectTextSelection();
    }, 0);
  };

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

    // Store the current selection coordinates
    selectionCoordsRef.current = getSelectionCoordinates();

    // Store the current selection before handling refine
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Save the current selection range to restore it after API call
      previousSelectionRef.current = selectedRange;
    }

    // Dispatch to keep selection state active in Redux
    dispatch(setIsTextSelected(true));
    dispatch(setSelectedRange(selectedRange));

    // Set refining state to true
    setIsRefining(true);
    // Set active AI operation
    setActiveAIOperation("refine");

    // Call API to get refinement
    handleRefineWithAI(selectedRange);
    setShowRefinePreview(true);

    // Re-apply the selection to keep text highlighted
    setTimeout(() => {
      focusAndSelectText(selectedRange);
    }, 10);
  };

  // Ensure that selection tooltip only appears for selections within the editor
  const shouldShowSelectionTooltip = () => {
    // Only show if we have a selection
    if (!selectedRange || !selectedText || isTyping || isTypingEffect || showRefinePreview) {
      return false;
    }

    // Check if the selection is within the editor
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const editorNode = editorRef.current;

    // Make sure the editor node exists
    if (!editorNode) return false;

    // Check if the selection is contained within the editor
    return editorNode.contains(range.commonAncestorContainer);
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
    setIsRefining(false);
    // Clear active AI operation
    setActiveAIOperation(null);

    // Clear selection after applying refined text
    clearSelection();

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
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
    // Clear active AI operation
    setActiveAIOperation(null);

    // Clear selection
    clearSelection();

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
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
    // Clear active AI operation
    setActiveAIOperation(null);

    // Clear selection
    clearSelection();

    // Use setTimeout to allow the DOM to update first
    setTimeout(() => {
      // Simulate an input event to trigger handleEditorInput
      if (editorRef.current) {
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
    // First, reset all the typed effect state
    resetTypeEffect();
    setShowRefinePreview(false);
    setIsRefining(false);
    // Clear active AI operation
    setActiveAIOperation(null);

    // When canceling, make sure we're not keeping any generated content
    if (contentType === "complete" || contentType === "hashtags") {
      // Reset any trailing AI-generated content
      if (editorRef.current) {
        // Just keep the original content without the AI suggestion
        editorRef.current.innerHTML = content;

        // Update the content state to ensure it's clean
        onContentChange(content);
        dispatch(setContent(content));
      }
    }

    // Clear DOM selection and reset selection state
    clearSelection();

    // Simulate an input event if there's content
    if (editorRef.current && content.trim()) {
      const inputEvent = new Event("input", { bubbles: true });
      editorRef.current.dispatchEvent(inputEvent);
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

  // Handle "Complete with AI" button click
  const handleCompletionClick = () => {
    setActiveAIOperation("complete");
    handleCompleteWithAI();
  };

  // Handle "Generate Hashtags" button click
  const handleHashtagsClick = () => {
    setActiveAIOperation("hashtags");
    handleGenerateHashtags();
  };

  const hasContent = content.trim().length > 0;

  return (
    <div
      className={`relative max-h-[50dvh] overflow-y-auto ${isRefining ? "is-refining" : ""}`}
      ref={editorContainerRef}
    >
      <ContentEditableWrapper
        editorRef={editorRef}
        content={content}
        isTypingEffect={isTypingEffect}
        showTypeControls={showTypeControls}
        typedContent={typedContent}
        fullContent={fullContent}
        placeholder={placeholder}
        isPostModal={isPostModal}
        hasScrollbar={hasScrollbar}
        isRefining={isRefining}
        disableSelection={
          isTypingEffect || showTypeControls || isPendingContent || isPendingHashTags
        }
        className={className}
        onInput={handleEditorInput}
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
        <GeneratedContentControlsPortal
          targetId="typing-effect-end"
          type="text"
          controls={
            <GeneratedContentControls
              showTypeControls={showTypeControls}
              handleConfirm={handleConfirm}
              handleRegenerate={handleRegenerate}
              handleCancel={handleCancel}
              isPending={isPendingContent || isPendingHashTags}
              isInline={true}
            />
          }
        />
      )}

      {/* Show the Refine with AI button when text is selected */}
      {shouldShowSelectionTooltip() && (
        <SelectionTooltip
          position={getSelectionCoordinates()}
          onRefineClick={handleRefineWithAIClick}
          isPendingContent={isPendingContent}
        />
      )}

      {/* Show AI response preview when requested */}
      {showRefinePreview && generatedRefineContent && selectedRange && (
        <Popover
          open={showRefinePreview}
          onOpenChange={(open) => {
            // Prevent closing if an operation is in progress
            if (!open && isRefining) return;
            setShowRefinePreview(open);

            // If closing the preview, ensure selection is restored
            if (!open) {
              setIsRefining(false);
              setActiveAIOperation(null);
              if (selectedRange) {
                setTimeout(() => {
                  focusAndSelectText(selectedRange);
                }, 10);
              }
            }
          }}
        >
          <PopoverTrigger asChild>
            <div
              className="absolute"
              style={{
                top: `${selectionCoordsRef.current?.top || getSelectionCoordinates()?.top || 0}px`,
                left: `${
                  selectionCoordsRef.current?.left || getSelectionCoordinates()?.left || 0
                }px`,
                width: "1px",
                height: "1px",
                position: "absolute",
                zIndex: -1,
              }}
            />
          </PopoverTrigger>
          <RefinePopover
            generatedRefineContent={generatedRefineContent}
            setShowRefinePreview={setShowRefinePreview}
            handleRefineAction={handleRefineAction}
            handleRegenerateRefinedText={() => {
              // Store current selection coordinates before regenerating
              selectionCoordsRef.current = getSelectionCoordinates() || selectionCoordsRef.current;

              // Explicitly ensure we keep the popover open during regeneration
              setShowRefinePreview(true);
              setIsRefining(true);
              setActiveAIOperation("refine");

              // Restore selection before regenerating
              if (selectedRange) {
                focusAndSelectText(selectedRange);
              }
              handleRegenerateRefinedText(selectedRange);
            }}
            isPendingContent={isPendingContent}
          />
        </Popover>
      )}

      {/* Sparkles icon at the top right */}
      {hasContent && !isTypingEffect && !showTypeControls && (
        <SparkleButton
          onClick={handleSparkleClick}
          isTextSelected={isTextSelected}
          hasScrollbar={hasScrollbar}
          isPostModal={isPostModal}
          isDisabled={isTyping}
        />
      )}

      {/* AI suggestion card */}
      {showAIOptions && underlineType === "completion" && (
        <AIOptions
          underlineType={underlineType}
          onClose={handleCloseOptions}
          handleCompleteWithAI={handleCompletionClick}
          handleGenerateHashtags={handleHashtagsClick}
          isPendingContent={isPendingContent}
          isPendingHashTags={isPendingHashTags}
        />
      )}
    </div>
  );
};

export default AIAssistantTextarea;
