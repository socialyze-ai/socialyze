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
} from "@/redux/slices/aiTextarea.slice";

// Import components
import ContentEditableWrapper from "./components/ContentEditableWrapper";
import AIOptions from "./components/AIOptions";
import SelectionTooltip from "./components/SelectionTooltip";
import SparkleButton from "./components/SparkleButton";
import RefinePopover from "./components/RefinePopover";
import GeneratedContentControls from "./components/GeneratedContentControls";
import GeneratedContentControlsPortal from "./components/GeneratedContentControlsPortal";

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

  const { getSelectionCoordinates } = useSelectionCoordinates(editorRef);
  const { detectTextSelection, clearSelection: originalClearSelection } = useSelectionDetector({
    editorRef,
    isTyping,
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
    originalClearSelection();
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

  // When clicking outside editor, hide all popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        dispatch(setShowAIOptions(false));
        dispatch(resetTextState());

        // Explicitly reset refine preview state
        if (showRefinePreview) {
          setShowRefinePreview(false);
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
  }, [dispatch, showRefinePreview]);

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

  // Handle text selection with the corrected approach
  const handleUpdatedTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!editorRef.current || isTyping) return;

    // If there's an active refine preview, close it first
    if (showRefinePreview) {
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

  const hasContent = content.trim().length > 0;

  return (
    <div className="relative" ref={editorContainerRef}>
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
      {selectedRange && selectedText && !isTyping && !isTypingEffect && !showRefinePreview && (
        <SelectionTooltip
          position={getSelectionCoordinates()}
          onRefineClick={handleRefineWithAIClick}
        />
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
              // selectedRange &&
              handleRegenerateRefinedText(selectedRange)
            }
            isPendingContent={isPendingContent}
          />
        </div>
      )}

      {/* Sparkles icon at the top right */}
      {hasContent && !isTyping && !isTypingEffect && !showTypeControls && (
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
  );
};

export default AIAssistantTextarea;
