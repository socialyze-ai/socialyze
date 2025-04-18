import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Hash, Wand2, Check, Sparkles, X, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateContent, useGenerateHashTags } from "@/api/apiHooks/useAI";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAITextarea,
  setContent,
  setSelectedText,
  setSelectedRange,
  setIsTyping,
  setUnderlineType,
  setIsTextSelected,
  setHasScrollbar,
  setShowAIOptions,
  setShowConfirmation,
  setHashtags,
  setGeneratedContent,
  setGeneratedRefineContent,
  resetTextState,
  resetConfirmation,
} from "@/redux/slices/aiTextarea.slice";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
  const previousSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Update Redux store with initial content
  useEffect(() => {
    dispatch(setContent(content));
  }, [dispatch, content]);

  const { mutate: generateHashTags, isPending: isPendingHashTags } = useGenerateHashTags();
  const { mutate: generateContent, isPending: isPendingContent } = useGenerateContent();

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
  const focusAndSelectText = () => {
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
    if (selectedRange && textareaRef.current && !isTyping) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
    }
  }, [selectedRange, isTyping]);

  // Maintain selection when AI options are shown
  useEffect(() => {
    if (showAIOptions && selectedRange && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
    }
  }, [showAIOptions, selectedRange]);

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
      focusAndSelectText();
    }
  }, [showConfirmation, generateRefineWithAI]);

  const hasContent = content.trim().length > 0;

  // handle api calls
  const handleRefineWithAI = () => {
    if (selectedRange) {
      const selStart = selectedRange.start;
      const selEnd = selectedRange.end;
      const selText = content.substring(selStart, selEnd);

      // Store the current selection in a ref to ensure we can access it later
      previousSelectionRef.current = { start: selStart, end: selEnd };

      // Wrap selected text in <focus> tags
      const wholeText =
        content.substring(0, selStart) + `<focus>${selText}</focus>` + content.substring(selEnd);

      generateContent(
        {
          text: wholeText,
          action: "refine",
        },
        {
          onSuccess: (data) => {
            dispatch(setGeneratedRefineContent(data.text));
            dispatch(setShowConfirmation(true));
            dispatch(setShowAIOptions(false));
            // Make sure we keep the selection range active for the confirmation
            if (!selectedRange || previousSelectionRef.current) {
              dispatch(setSelectedRange(previousSelectionRef.current));
            }
            focusAndSelectText();
          },
          onError: () => {
            toast({
              title: "Error refining with AI",
              description: "Please try again.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };

  const handleCompleteWithAI = () => {
    generateContent(
      {
        text: content,
        action: "complete",
      },
      {
        onSuccess: (data) => {
          dispatch(setGeneratedContent(data.text));
          dispatch(setShowConfirmation(true));
          dispatch(setShowAIOptions(false));
        },
        onError: () => {
          toast({
            title: "Error completing with AI",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleGenerateHashtags = () => {
    generateHashTags(
      {
        text: content,
      },
      {
        onSuccess: (data) => {
          dispatch(setHashtags(data.text));
          dispatch(setShowConfirmation(true));
        },
        onError: () => {
          toast({
            title: "Error generating hashtags",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const confirmHashtags = () => {
    onContentChange(content + "\n" + hashtags);
    dispatch(setContent(content + "\n" + hashtags));
    dispatch(resetConfirmation());
    dispatch(resetTextState());
  };

  const confirmGeneratedContent = () => {
    onContentChange(content + " " + generatedContent);
    dispatch(setContent(content + " " + generatedContent));
    dispatch(resetConfirmation());
    dispatch(resetTextState());
  };

  const confirmRefineWithAI = () => {
    // Use previousSelectionRef as a fallback if selectedRange is somehow lost
    const selRange = selectedRange || previousSelectionRef.current;
    if (!selRange) return;

    const beforeText = content.substring(0, selRange.start);
    const afterText = content.substring(selRange.end);
    const newContent = beforeText + generateRefineWithAI + afterText;

    onContentChange(newContent);
    dispatch(setContent(newContent));
    dispatch(resetConfirmation());

    // Reset text selection after replacing the text
    dispatch(resetTextState());
    previousSelectionRef.current = null;
  };

  // Handler for regenerating refined text while keeping the dialog open
  const handleRegenerateRefinedText = () => {
    // Use previousSelectionRef as a fallback if selectedRange is somehow lost
    const selRange = selectedRange || previousSelectionRef.current;
    if (!selRange) return;

    const selStart = selRange.start;
    const selEnd = selRange.end;
    const selText = content.substring(selStart, selEnd);

    // Wrap selected text in <focus> tags
    const wholeText =
      content.substring(0, selStart) + `<focus>${selText}</focus>` + content.substring(selEnd);

    generateContent(
      {
        text: wholeText,
        action: "refine",
      },
      {
        onSuccess: (data) => {
          dispatch(setGeneratedRefineContent(data.text));
          // No need to set showConfirmation to true as it's already open
          // Keep the selection range active
          if (!selectedRange || previousSelectionRef.current) {
            dispatch(setSelectedRange(previousSelectionRef.current));
          }
          focusAndSelectText();
        },
        onError: () => {
          toast({
            title: "Error regenerating refined text",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  // Handler for regenerating content completion
  const handleRegenerateCompletion = () => {
    generateContent(
      {
        text: content,
        action: "complete",
      },
      {
        onSuccess: (data) => {
          dispatch(setGeneratedContent(data.text));
          // Dialog already open, so no need to set showConfirmation
        },
        onError: () => {
          toast({
            title: "Error regenerating content",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  // Handler for regenerating hashtags
  const handleRegenerateHashtags = () => {
    generateHashTags(
      {
        text: content,
      },
      {
        onSuccess: (data) => {
          dispatch(setHashtags(data.text));
          // Dialog already open, so no need to set showConfirmation
        },
        onError: () => {
          toast({
            title: "Error regenerating hashtags",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <>
      <div className="relative" ref={textareaContainerRef}>
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

        {/* Sparkles icon at the top right - only show when there is content */}
        {hasContent && (
          <div
            className={cn(
              "absolute z-10",
              hasScrollbar
                ? isPostModal
                  ? "top-1.5 right-3"
                  : "top-1.5 right-4"
                : "top-1 right-1",
            )}
          >
            <Sparkles
              className={cn(
                "w-5 h-5 cursor-pointer bg-white rounded-full p-0.5 shadow-sm",
                isTextSelected ? "text-green-500" : "text-blue-500",
              )}
              onClick={handleSparkleClick}
            />
          </div>
        )}

        {/* AI suggestion card inside the textarea */}
        {showAIOptions && (
          <div
            className="absolute z-20 bg-white rounded-lg shadow-lg pointer-events-auto w-64 border border-gray-100"
            style={{
              top: "40px",
              right: "10px",
              maxHeight: "calc(100% - 50px)",
              overflow: "auto",
            }}
          >
            {/* Card header */}
            <div className="flex justify-between items-center w-full px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-100">
              <div className="flex items-center">
                <Wand2
                  className={cn(
                    "h-4 w-4 mr-1.5",
                    underlineType === "selection" ? "text-green-500" : "text-blue-500",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    underlineType === "selection" ? "text-green-700" : "text-blue-700",
                  )}
                >
                  {underlineType === "selection" ? "Improve Selection" : "AI Suggestions"}
                </span>
              </div>
              <button onClick={handleCloseOptions} className="text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card body */}
            <div className="px-3 py-2">
              {underlineType === "selection" ? (
                <>
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      onClick={handleRefineWithAI}
                      className="w-full justify-start text-left rounded-sm hover:bg-green-50 p-1.5 h-auto"
                      variant="ghost"
                      disabled={isPendingContent}
                    >
                      {isPendingContent ? (
                        <Loader2 className="h-3 w-3 text-green-600 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center">
                          <div className="bg-green-100 rounded-full p-1 mr-2">
                            <Wand2 className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">Refine with AI</p>
                            <p className="text-xs text-gray-500">Improve clarity and style</p>
                          </div>
                        </div>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      onClick={handleCompleteWithAI}
                      className="w-full justify-start text-left rounded-sm hover:bg-blue-50 p-1.5 h-auto"
                      variant="ghost"
                      disabled={isPendingContent}
                    >
                      {isPendingContent ? (
                        <Loader2 className="h-3 w-3 text-blue-600 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-1 mr-2">
                            <Wand2 className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">Complete with AI</p>
                            <p className="text-xs text-gray-500">Finish your thought</p>
                          </div>
                        </div>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleGenerateHashtags}
                      className="w-full justify-start text-left rounded-sm hover:bg-blue-50 p-1.5 h-auto"
                      variant="ghost"
                      disabled={isPendingHashTags}
                    >
                      {isPendingHashTags ? (
                        <Loader2 className="h-3 w-3 text-blue-600 animate-spin mx-auto" />
                      ) : (
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-1 mr-2">
                            <Hash className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">Generate Hashtags</p>
                            <p className="text-xs text-gray-500">Add relevant hashtags</p>
                          </div>
                        </div>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
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
        onRegenerate={handleRegenerateRefinedText}
        isRegenerateLoading={isPendingContent}
      />
    </>
  );
};

export default AIAssistantTextarea;

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  content,
  onConfirm,
  onRegenerate,
  isRegenerateLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col gap-2">
        <p className="text-sm">{title}</p>
        <p className="font-semibold text-xs border border-gray-200 rounded-md p-1.5">{content}</p>
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onRegenerate}
            type="button"
            variant="outline"
            className="text-green-600 hover:bg-green-100 text-xs"
            disabled={isRegenerateLoading}
          >
            {isRegenerateLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCcw className="h-3 w-3 mr-1" />
            )}
            Regenerate
          </Button>

          <Button
            onClick={onConfirm}
            type="button"
            variant="outline"
            className="text-green-600 hover:bg-green-100 text-xs"
          >
            <Check className="h-3 w-3 mr-1" /> Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
