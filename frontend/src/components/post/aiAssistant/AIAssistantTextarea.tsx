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
    generatedRefineContent: generateRefineWithAI,
  } = useSelector(selectAITextarea);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showEditor, setShowEditor] = useState(true);
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  const [contentHighlight, setContentHighlight] = useState(false);
  const [showRefineOption, setShowRefineOption] = useState(false);
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

  // Update Redux store with initial content
  useEffect(() => {
    dispatch(setContent(content));
  }, [dispatch, content]);

  // Toggle editor and div based on typing effect
  useEffect(() => {
    if (isTypingEffect) {
      setShowEditor(false);
    }
  }, [isTypingEffect]);

  // Show brief highlight after typing effect completes
  useEffect(() => {
    if (showTypeControls && !contentHighlight) {
      setContentHighlight(true);

      // After 1 second, remove the highlight
      const highlightTimeout = setTimeout(() => {
        setContentHighlight(false);
      }, 1500);

      return () => clearTimeout(highlightTimeout);
    }
  }, [showTypeControls, contentHighlight]);

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

    // Maintain text selection when opening AI options
    if (selectedRange && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();

            // Find the text node
            const textNodes = getTextNodesIn(editorRef.current);
            if (textNodes.length > 0) {
              // Simple approach - assuming all text is in one text node
              const textNode = textNodes[0];
              range.setStart(textNode, selectedRange.start);
              range.setEnd(textNode, selectedRange.end);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }, 0);
    }
  };

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

  // Handle closing the AI options popup
  const handleCloseOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowAIOptions(false));

    // Restore text selection if we have a selected range
    if (selectedRange && editorRef.current && underlineType === "selection") {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            const textNodes = getTextNodesIn(editorRef.current);
            if (textNodes.length > 0) {
              const textNode = textNodes[0];
              range.setStart(textNode, selectedRange.start);
              range.setEnd(textNode, selectedRange.end);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }, 0);
    }
  };

  // Update how refine with AI works
  const handleInlineRefineWithAI = () => {
    setShowRefineOption(false);
    setShowSelectionMode(false);
    // Instead of starting a type effect, just show the preview
    handleRefineWithAI(selectedRange);
    setShowRefinePreview(true);
  };

  // Handle refine action directly
  const handleRefineAction = (selectedRange: { start: number; end: number } | null) => {
    if (!selectedRange) return;

    const selRange = selectedRange || previousSelectionRef.current;
    if (!selRange) return;

    const beforeText = content.substring(0, selRange.start);
    const afterText = content.substring(selRange.end);
    const newContent = beforeText + generateRefineWithAI + afterText;

    onContentChange(newContent);
    dispatch(setContent(newContent));
    setShowRefinePreview(false);
    setShowSelectionMode(false);

    // Reset text selection after replacing the text
    dispatch(resetTextState());
    previousSelectionRef.current = null;
    setShowEditor(true);
  };

  // Update the handleSelectionChange function to clear selection when clicking elsewhere
  const handleSelectionChange = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Get current selection
    const selection = window.getSelection();

    // If there's no selection or it's empty, and we had a previous selection
    // This means user clicked elsewhere after selecting text
    if ((!selection || selection.toString().trim() === "") && selectedText) {
      // Clear the selection in Redux
      dispatch(resetTextState());

      // Hide popover if showing
      setShowRefinePreview(false);
    }

    // Proceed with the existing selection handling
    if (editorRef.current) {
      setTimeout(() => {
        hookHandleSelectionChange();
      }, 0);
    }
  };

  // Update the handleEditorInput to also clear any selection
  const handleEditorInput = (e: React.FormEvent<HTMLElement>) => {
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent); // Use the ContentEditable innerHTML property
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
      hookHandleSelectionChange(); // Check for new selections or completion opportunities
    }, 1000);
  };

  // Also add a click handler to the editor to clear selection when clicking outside of selected text
  const handleEditorClick = (e: React.MouseEvent) => {
    // Only handle if we have a selection
    if (selectedRange && selectedText) {
      const selection = window.getSelection();

      // If clicked outside the current selection
      if (!selection || selection.toString().trim() === "") {
        dispatch(resetTextState());
        setShowRefinePreview(false);
      }
    }

    // Call the existing selection change handler
    handleSelectionChange(e);
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
        setShowRefineOption(false);
        setShowRefinePreview(false);
        setShowSelectionMode(false);
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

  // Focus and restore selection after components update
  useEffect(() => {
    if (selectedRange && editorRef.current && !isTyping && showEditor && !showSelectionMode) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        const textNodes = getTextNodesIn(editorRef.current);
        if (textNodes.length > 0) {
          const textNode = textNodes[0];
          range.setStart(textNode, selectedRange.start);
          range.setEnd(textNode, selectedRange.end);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [selectedRange, isTyping, showEditor, showSelectionMode]);

  // Maintain selection when AI options are shown
  useEffect(() => {
    if (showAIOptions && selectedRange && editorRef.current && showEditor && !showSelectionMode) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        const textNodes = getTextNodesIn(editorRef.current);
        if (textNodes.length > 0) {
          const textNode = textNodes[0];
          range.setStart(textNode, selectedRange.start);
          range.setEnd(textNode, selectedRange.end);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [showAIOptions, selectedRange, showEditor, showSelectionMode]);

  // Check if editor has scrollbar
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      dispatch(setHasScrollbar(editor.scrollHeight > editor.clientHeight));
    }
  }, [content, dispatch]);

  // Maintain selection when confirmation dialog is shown
  useEffect(() => {
    if (showConfirmation && generateRefineWithAI.length > 0) {
      // When showing confirmation for refined text, ensure selection is maintained
      focusAndSelectText(selectedRange);
    }
  }, [showConfirmation, generateRefineWithAI]);

  const confirmHashtags = () => {
    // Add the hashtags to the existing content
    const newContent = content + "\n" + fullContent;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    resetTypeEffect();
    dispatch(resetTextState());
  };

  const confirmGeneratedContent = () => {
    // Add the generated content to the existing content
    const newContent = content + " " + fullContent;
    onContentChange(newContent);
    dispatch(setContent(newContent));
    resetTypeEffect();
    dispatch(resetTextState());
  };

  const handleConfirm = () => {
    if (contentType === "hashtags") {
      confirmHashtags();
    } else if (contentType === "complete") {
      confirmGeneratedContent();
    } else if (contentType === "refine") {
      if (selectedRange) {
        handleRefineAction(selectedRange);
      }
    }
  };

  const handleRegenerate = () => {
    if (contentType === "hashtags") {
      handleRegenerateHashtags();
    } else if (contentType === "complete") {
      handleRegenerateCompletion();
    } else if (contentType === "refine") {
      handleRegenerateRefinedText(selectedRange);
    }
  };

  const handleCancel = () => {
    // Just reset the typing effect without changing the content
    resetTypeEffect();
    dispatch(resetTextState());
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
    // Only hide options if click was outside the editor container
    // We handle this in the click outside listener
  };

  const hasContent = content.trim().length > 0;

  // Handle clicking anywhere in selection mode to return to editor
  const handleSelectionModeClick = (e: React.MouseEvent) => {
    // Don't exit selection mode if clicking on the refine button
    if ((e.target as HTMLElement).closest(".refine-button")) {
      return;
    }

    setShowSelectionMode(false);
    setShowEditor(true);
    // Focus the editor and restore selection
    if (editorRef.current && selectedRange) {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            const textNodes = getTextNodesIn(editorRef.current);
            if (textNodes.length > 0) {
              const textNode = textNodes[0];
              range.setStart(textNode, selectedRange.start);
              range.setEnd(textNode, selectedRange.end);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }, 0);
    }
  };

  // Paste as plain text handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

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
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          onClick={handleEditorClick}
          onKeyDown={handleSelectionChange}
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
              isPendingContent={isPendingContent}
              isPendingHashTags={isPendingHashTags}
            />
          </div>
        )}

        {/* Show the Refine with AI button when text is selected */}
        {selectedRange && selectedText && !isTyping && !isTypingEffect && (
          <div
            className="absolute z-50"
            style={{
              top: `${getSelectionCoordinates()?.bottom || 0}px`,
              left: `${getSelectionCoordinates()?.left || 0}px`,
            }}
          >
            <Button
              onClick={handleInlineRefineWithAI}
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
        {showRefinePreview && generateRefineWithAI && (
          <div
            className="absolute z-50 bg-white rounded-md shadow-lg max-w-sm border border-gray-200"
            style={{
              top: `${getSelectionCoordinates()?.top || 0}px`,
              left: `${getSelectionCoordinates()?.left || 0}px`,
              transform: "translateY(-100%)",
            }}
          >
            <RefinePopover
              selectedRange={selectedRange}
              generateRefineWithAI={generateRefineWithAI}
              setShowRefinePreview={setShowRefinePreview}
              handleRefineAction={handleRefineAction}
              handleRegenerateRefinedText={handleRegenerateRefinedText}
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

const ActionButtons = ({
  handleConfirm,
  handleRegenerate,
  handleCancel,
  isPendingContent,
  isPendingHashTags,
}: {
  handleConfirm: () => void;
  handleRegenerate: () => void;
  handleCancel: () => void;
  isPendingContent: boolean;
  isPendingHashTags?: boolean;
}) => {
  return (
    <span className="inline-flex space-x-1.5 ml-1 align-middle">
      <button
        className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center"
        onClick={handleConfirm}
      >
        <Check size={16} className="text-green-600" />
      </button>
      <button
        className="h-6 w-6 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
        onClick={handleRegenerate}
        disabled={isPendingContent || isPendingHashTags}
      >
        {isPendingContent || isPendingHashTags ? (
          <RefreshCcw size={16} className="text-blue-600 animate-spin" />
        ) : (
          <RefreshCcw size={16} className="text-blue-600" />
        )}
      </button>
      <button
        className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
        onClick={handleCancel}
      >
        <X size={16} className="text-red-600" />
      </button>
    </span>
  );
};

const RefinePopover = ({
  selectedRange,
  generateRefineWithAI,
  setShowRefinePreview,
  handleRefineAction,
  handleRegenerateRefinedText,
  isPendingContent,
}: {
  selectedRange: { start: number; end: number };
  generateRefineWithAI: string;
  setShowRefinePreview: (show: boolean) => void;
  handleRefineAction: (selectedRange: { start: number; end: number }) => void;
  handleRegenerateRefinedText: (selectedRange: { start: number; end: number }) => void;
  isPendingContent: boolean;
}) => {
  return (
    <div className="flex flex-col gap-2 bg-white z-40 p-1.5 px-2 max-w-sm">
      {isPendingContent ? (
        <p className="text-xs text-gray-600 mt-1">Refining...</p>
      ) : (
        <p className="text-xs text-green-600 mt-1">{generateRefineWithAI}</p>
      )}
      <div className="flex justify-end">
        <ActionButtons
          handleConfirm={() => handleRefineAction(selectedRange)}
          handleRegenerate={() => handleRegenerateRefinedText(selectedRange)}
          handleCancel={() => {
            setShowRefinePreview(false);
          }}
          isPendingContent={isPendingContent}
        />
      </div>
    </div>
  );
};
