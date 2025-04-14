import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Hash, Wand2 } from "lucide-react";
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantPosition, setAIAssistantPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [showRefineOption, setShowRefineOption] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showRefineBelow, setShowRefineBelow] = useState(false);

  // Track cursor position and show AI assistant when user hovers near cursor
  const handleTextareaMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (isTyping) return;

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionEnd;

      // Get coordinates of cursor position
      const textBeforeCursor = content.substring(0, cursorPosition);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length;

      // Calculate approximate pixel position
      // This is a simplification - exact positioning would need more complex calculations
      const lineHeight = 20; // Estimated line height
      const charWidth = 8; // Estimated character width

      const rect = textarea.getBoundingClientRect();
      const top = rect.top + currentLine * lineHeight;
      const left = rect.left + currentColumn * charWidth;

      // Check if mouse is near cursor position
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const distance = Math.sqrt(Math.pow(mouseX - left, 2) + Math.pow(mouseY - top, 2));

      // Show AI assistant if mouse is within 30px of cursor
      if (distance < 30) {
        setAIAssistantPosition({ top: mouseY - rect.top, left: mouseX - rect.left });
        setShowAIAssistant(true);
      } else {
        setShowAIAssistant(false);
      }
    }
  };

  // Handle text selection to show "Refine with AI" button
  const handleTextSelection = () => {
    if (textareaRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selText = selection.toString();
        setSelectedText(selText);

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const textareaRect = textareaRef.current.getBoundingClientRect();

        setSelectionPosition({
          top: rect.bottom - textareaRect.top,
          left: rect.left - textareaRect.left + rect.width / 2,
        });

        setShowRefineOption(true);
        setShowRefineBelow(true);
      } else {
        setShowRefineOption(false);
        setShowRefineBelow(false);
      }
    }
  };

  // Track typing state
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
    setIsTyping(true);
    setShowAIAssistant(false);
    setShowRefineBelow(false);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to mark user as not typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Handle AI refinement action
  const handleRefineWithAI = () => {
    // Implement your AI refinement logic here
    console.log(`Refining text: ${selectedText}`);
    // You would typically call your AI service here
    setShowRefineOption(false);
    setShowRefineBelow(false);
  };

  // When clicking outside textarea, hide the refine button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowRefineBelow(false);
        setShowRefineOption(false);
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

  return (
    <div className="relative">
      <Textarea
        placeholder={placeholder}
        className={cn(
          "min-h-[150px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-transparent",
          isPostModal ? "text-sm" : "text-base",
          className,
        )}
        value={content}
        onChange={handleTyping}
        ref={textareaRef}
        onMouseMove={handleTextareaMouseMove}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
      />

      {/* AI Assistant popup that appears on hover near cursor */}
      {!showRefineOption && showAIAssistant && !isTyping && (
        <div
          className="absolute z-10 bg-white rounded-md shadow-md flex flex-col"
          style={{
            top: `${aiAssistantPosition.top}px`,
            left: `${aiAssistantPosition.left}px`,
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => console.log("Complete with AI")}
            className="text-sm"
          >
            <Wand2 className="h-4 w-4 mr-0.5" />
            <span className="text-xs">Complete Sentence</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => console.log("Generate Hashtags")}
            className="text-sm"
          >
            <Hash className="h-4 w-4 mr-0.5" />
            <span className="text-xs">Generate Hashtags</span>
          </Button>
        </div>
      )}

      {/* Refine with AI option when text is selected - floating near selection */}
      {showRefineOption && (
        <div
          className="absolute z-10 bg-white rounded-md shadow-md p-1"
          style={{
            top: `${selectionPosition.top}px`,
            left: `${selectionPosition.left}px`,
            // transform: "translateX(-50%)",
          }}
        >
          <Button size="sm" variant="secondary" onClick={handleRefineWithAI}>
            <Wand2 className="h-4 w-4 mr-1" />
            Refine with AI
          </Button>
        </div>
      )}

      {/* Refine with AI button below textarea when text is selected */}
      {showRefineBelow && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefineWithAI}
            className="flex items-center gap-1 text-sm shadow-sm border border-gray-200"
          >
            <Wand2 className="h-4 w-4" />
            Refine with AI
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIAssistantTextarea;
