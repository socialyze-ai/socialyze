import React, { useRef, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
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
import { Check, CircleX, RefreshCcw, X } from "lucide-react";

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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showTextarea, setShowTextarea] = useState(true);
  const [contentHighlight, setContentHighlight] = useState(false);

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

  const { handleTextSelection, handleSelectionChange, focusAndSelectText, previousSelectionRef } =
    useTextSelection({
      textareaRef,
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

  // Toggle textarea and div based on typing effect
  useEffect(() => {
    if (isTypingEffect) {
      setShowTextarea(false);
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

  // Handle hovering over textarea to show AI suggestions
  const handleTextareaMouseEnter = () => {
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
    if (selectedRange && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
        }
      }, 0);
    }
  };

  // Handle closing the AI options popup
  const handleCloseOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setShowAIOptions(false));

    // Restore text selection if we have a selected range
    if (selectedRange && textareaRef.current && underlineType === "selection") {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
        }
      }, 0);
    }
  };

  // Track typing state
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
    dispatch(setContent(e.target.value));
    dispatch(setIsTyping(true));
    dispatch(setShowAIOptions(false));
    dispatch(resetTextState());

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to mark user as not typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      dispatch(setIsTyping(false));
      handleTextSelection(); // Check for new selections or completion opportunities
    }, 1000);
  };

  // When clicking outside textarea, hide all popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textareaContainerRef.current &&
        !textareaContainerRef.current.contains(event.target as Node)
      ) {
        dispatch(setShowAIOptions(false));
        dispatch(resetTextState());
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
    if (selectedRange && textareaRef.current && !isTyping && showTextarea) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
    }
  }, [selectedRange, isTyping, showTextarea]);

  // Maintain selection when AI options are shown
  useEffect(() => {
    if (showAIOptions && selectedRange && textareaRef.current && showTextarea) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
    }
  }, [showAIOptions, selectedRange, showTextarea]);

  // Check if textarea has scrollbar
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      dispatch(setHasScrollbar(textarea.scrollHeight > textarea.clientHeight));
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
    onContentChange(content + "\n" + fullContent);
    dispatch(setContent(content + "\n" + fullContent));
    resetTypeEffect();
    dispatch(resetTextState());
    setShowTextarea(true);
  };

  const confirmGeneratedContent = () => {
    onContentChange(content + " " + fullContent);
    dispatch(setContent(content + " " + fullContent));
    resetTypeEffect();
    dispatch(resetTextState());
    setShowTextarea(true);
  };

  const confirmRefineWithAI = () => {
    // Use previousSelectionRef as a fallback if selectedRange is somehow lost
    const selRange = selectedRange || previousSelectionRef.current;
    if (!selRange) return;

    const beforeText = content.substring(0, selRange.start);
    const afterText = content.substring(selRange.end);
    const newContent = beforeText + fullContent + afterText;

    onContentChange(newContent);
    dispatch(setContent(newContent));
    resetTypeEffect();

    // Reset text selection after replacing the text
    dispatch(resetTextState());
    previousSelectionRef.current = null;
    setShowTextarea(true);
  };

  const handleConfirm = () => {
    if (contentType === "hashtags") {
      confirmHashtags();
    } else if (contentType === "complete") {
      confirmGeneratedContent();
    } else if (contentType === "refine") {
      confirmRefineWithAI();
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
    resetTypeEffect();
    setShowTextarea(true);
  };

  const hasContent = content.trim().length > 0;

  return (
    <>
      <div className="relative" ref={textareaContainerRef}>
        {showTextarea ? (
          <Textarea
            placeholder={placeholder}
            className={cn(
              "resize-none border-0 focus-visible:ring-0 focus-visible:ring-transparent",
              isPostModal ? "text-sm min-h-[300px]" : "text-base min-h-[200px]",
              hasScrollbar ? "pr-5" : "pr-6",
              className,
            )}
            value={content}
            onChange={handleTyping}
            ref={textareaRef}
            onMouseEnter={handleTextareaMouseEnter}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onClick={handleSelectionChange}
            onKeyDown={handleSelectionChange}
          />
        ) : (
          <div
            className={cn(
              "border-0 p-3 overflow-y-auto whitespace-pre-wrap bg-[#f9fafb]",
              isPostModal ? "text-sm min-h-[300px]" : "text-base min-h-[200px]",
              hasScrollbar ? "pr-5" : "pr-6",
              className,
            )}
          >
            <div className="text-gray-800 text-wrap">
              {contentType === "refine" && isTypingEffect ? (
                <>
                  {content.substring(0, selectedRange?.start || 0)}
                  <span className="line-through text-red-600 inline">{selectedText}</span>
                  <span
                    className="bg-yellow-200 inline"
                    style={{ animation: "pulse-bg 1.5s ease-in-out" }}
                  >
                    {typedContent}
                  </span>
                  {content.substring(selectedRange?.end || 0)}
                </>
              ) : contentType === "refine" && showTypeControls ? (
                <>
                  {content.substring(0, selectedRange?.start || 0)}
                  <span className="line-through text-red-600 inline">{selectedText}</span>
                  <span
                    className={cn("inline", contentHighlight ? "bg-yellow-200" : "")}
                    style={
                      contentHighlight
                        ? {
                            animation: "pulse-bg 1.5s ease-in-out",
                          }
                        : undefined
                    }
                  >
                    {fullContent}
                  </span>
                  {content.substring(selectedRange?.end || 0)}
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
                </>
              ) : isTypingEffect ? (
                <>
                  {content}
                  <span
                    className="bg-yellow-200 inline"
                    style={{ animation: "pulse-bg 1.5s ease-in-out" }}
                  >
                    {typedContent}
                  </span>
                </>
              ) : showTypeControls ? (
                <>
                  {content}
                  <span
                    className={cn("inline", contentHighlight ? "bg-yellow-200" : "")}
                    style={
                      contentHighlight
                        ? {
                            animation: "pulse-bg 1.5s ease-in-out",
                          }
                        : undefined
                    }
                  >
                    {fullContent}
                  </span>
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
                </>
              ) : (
                content
              )}
            </div>

            {/* AI suggestion card below typed content when showing div instead of textarea */}
            {showAIOptions && !showTextarea && (
              <div className="mt-4">
                <AIOptions
                  underlineType={underlineType}
                  onClose={handleCloseOptions}
                  handleRefineWithAI={() => handleRefineWithAI(selectedRange)}
                  handleCompleteWithAI={handleCompleteWithAI}
                  handleGenerateHashtags={handleGenerateHashtags}
                  isPendingContent={isPendingContent}
                  isPendingHashTags={isPendingHashTags}
                />
              </div>
            )}
          </div>
        )}

        <style>
          {`
            @keyframes pulse-bg {
              0%, 100% { background-color: rgba(254, 240, 138, 0.5); }
              50% { background-color: rgba(254, 240, 138, 1); }
            }
          `}
        </style>

        {/* Sparkles icon at the top right - only show when there is content */}
        {hasContent && showTextarea && (
          <SparkleButton
            onClick={handleSparkleClick}
            isTextSelected={isTextSelected}
            hasScrollbar={hasScrollbar}
            isPostModal={isPostModal}
          />
        )}

        {/* AI suggestion card inside the textarea */}
        {showAIOptions && showTextarea && (
          <AIOptions
            underlineType={underlineType}
            onClose={handleCloseOptions}
            handleRefineWithAI={() => handleRefineWithAI(selectedRange)}
            handleCompleteWithAI={handleCompleteWithAI}
            handleGenerateHashtags={handleGenerateHashtags}
            isPendingContent={isPendingContent}
            isPendingHashTags={isPendingHashTags}
          />
        )}
      </div>

      <ConfirmationDialog
        open={showConfirmation && hashtags.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            dispatch(resetConfirmation());
          }
        }}
        title="Do you want to add the following hashtags?"
        content={hashtags}
        onConfirm={confirmHashtags}
        onRegenerate={handleRegenerateHashtags}
        isRegenerateLoading={isPendingHashTags}
      />

      <ConfirmationDialog
        open={showConfirmation && generatedContent.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            dispatch(resetConfirmation());
          }
        }}
        title="Do you want to add the following content?"
        content={generatedContent}
        onConfirm={confirmGeneratedContent}
        onRegenerate={handleRegenerateCompletion}
        isRegenerateLoading={isPendingContent}
      />

      <ConfirmationDialog
        open={showConfirmation && generateRefineWithAI.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            dispatch(resetConfirmation());
          }
        }}
        title="Do you want to replace the following text?"
        content={
          <div>
            <p className="font-semibold text-xs line-through text-red-600">{selectedText}</p>
            <br />
            <p className="font-semibold text-xs text-green-600">{generateRefineWithAI}</p>
          </div>
        }
        onConfirm={confirmRefineWithAI}
        onRegenerate={() => handleRegenerateRefinedText(selectedRange)}
        isRegenerateLoading={isPendingContent}
      />
    </>
  );
};

export default AIAssistantTextarea;
