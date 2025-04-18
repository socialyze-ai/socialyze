import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Hash, Wand2, Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showAIOptions, setShowAIOptions] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showUnderline, setShowUnderline] = useState(false);
  const [underlinePosition, setUnderlinePosition] = useState({ top: 0, left: 0, width: 0 });
  const [underlineType, setUnderlineType] = useState<"selection" | "completion">("selection");
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  // Calculate the position of the end of text for completion suggestions
  const calculateEndOfTextPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0, width: 0 };

    const textarea = textareaRef.current;
    const mirror = document.createElement("div");

    // Set up mirror element to match textarea styling
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordBreak = "break-word";

    const styles = window.getComputedStyle(textarea);
    ["font-family", "font-size", "line-height", "padding", "width"].forEach((prop) => {
      mirror.style[prop as any] = styles[prop];
    });

    mirror.textContent = content;
    document.body.appendChild(mirror);

    // Calculate position
    const mirrorRect = mirror.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    const lastLine = mirror.offsetHeight - parseInt(styles.lineHeight);
    const left = content.length === 0 ? 2 : mirrorRect.width - textareaRect.left;
    const top = lastLine - textareaRect.top + parseInt(styles.paddingTop);

    document.body.removeChild(mirror);

    return {
      top: Math.max(0, top),
      left: Math.max(0, left),
      width: 20, // Default width for the end of text underline
    };
  };

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
        setSelectedText(selText);
        setSelectedRange({ start: selStart, end: selEnd });
        setUnderlineType("selection");
        setIsTextSelected(true);

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

          setUnderlinePosition({
            top: markerRect.top - textareaRect.top + parseInt(styles.lineHeight),
            left: markerRect.left - textareaRect.left,
            width: textWidth,
          });
        }

        document.body.removeChild(mirror);
        setShowUnderline(true);
      }
    } else if (content.trim().length > 0 && !isTyping) {
      // Show completion suggestion at end of text
      const position = calculateEndOfTextPosition();
      setUnderlinePosition(position);
      setUnderlineType("completion");
      setShowUnderline(true);
      setIsTextSelected(false);
    } else {
      setShowUnderline(false);
      setIsTextSelected(false);
    }
  };

  // Handle hovering over textarea to show AI suggestions
  const handleTextareaMouseEnter = () => {
    if (selectedRange || isTyping || !content.trim().length) return;

    const position = calculateEndOfTextPosition();
    setUnderlinePosition(position);
    setUnderlineType("completion");
    setShowUnderline(true);
  };

  // Handle clicking the sparkle icon
  const handleSparkleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAIOptions(!showAIOptions);

    // Set underline type based on whether text is selected
    setUnderlineType(selectedRange && selectedText.trim().length > 0 ? "selection" : "completion");

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
    setShowAIOptions(false);

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
    setIsTyping(true);
    setShowAIOptions(false);
    setShowUnderline(false);
    setSelectedRange(null);
    setSelectedText("");
    setIsTextSelected(false);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to mark user as not typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      handleTextSelection(); // Check for new selections or completion opportunities
    }, 1000);
  };

  // Handle AI refinement action
  const handleRefineWithAI = () => {
    console.log(`Refining text: ${selectedText}`);
    setShowAIOptions(false);
    focusAndSelectText();
  };

  // Handle AI completion action
  const handleCompleteWithAI = () => {
    console.log("Complete sentence with AI");
    setShowAIOptions(false);
  };

  // Handle hashtag generation
  const handleGenerateHashtags = () => {
    console.log("Generate hashtags with AI");
    setShowAIOptions(false);
  };

  // Handle accepting AI suggestion
  const handleAcceptSuggestion = () => {
    console.log("Accept AI suggestion");
    setShowAIOptions(false);
    setShowUnderline(false);
  };

  // Helper function to focus and select text
  const focusAndSelectText = () => {
    if (selectedRange && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
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
        setShowAIOptions(false);
        setShowUnderline(false);
        setSelectedRange(null);
        setSelectedText("");
        setIsTextSelected(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
      setHasScrollbar(textarea.scrollHeight > textarea.clientHeight);
    }
  }, [content]);

  const hasContent = content.trim().length > 0;

  return (
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
      />

      {/* Sparkles icon at the top right - only show when there is content */}
      {hasContent && (
        <div
          className={cn(
            "absolute z-10",
            hasScrollbar ? (isPostModal ? "top-1.5 right-3" : "top-1.5 right-4") : "top-1 right-1",
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
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-1 mr-2">
                        <Wand2 className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Refine with AI</p>
                        <p className="text-xs text-gray-500">Improve clarity and style</p>
                      </div>
                    </div>
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
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-2">
                        <Wand2 className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Complete with AI</p>
                        <p className="text-xs text-gray-500">Finish your thought</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleGenerateHashtags}
                    className="w-full justify-start text-left rounded-sm hover:bg-blue-50 p-1.5 h-auto"
                    variant="ghost"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-1 mr-2">
                        <Hash className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">Generate Hashtags</p>
                        <p className="text-xs text-gray-500">Add relevant hashtags</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Card footer */}
          {/* <div className="flex justify-end px-3 py-2 bg-gray-50 rounded-b-lg border-t border-gray-100">
            <button
              onClick={handleAcceptSuggestion}
              className="flex items-center justify-center text-xs font-medium text-gray-700 hover:text-gray-900"
            >
              <Check className="h-3 w-3 mr-1 text-gray-500" />
              Apply
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default AIAssistantTextarea;
