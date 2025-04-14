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
  const textareaContainerRef = useRef<HTMLDivElement | null>(null);
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
        // Position the AI assistant below the cursor, not at mouse position
        const assistantTop = currentLine * lineHeight + lineHeight; // Position below the current line
        const assistantLeft = currentColumn * charWidth;

        // Calculate the textarea's boundaries
        const textareaRect = textarea.getBoundingClientRect();
        const maxTop = textareaRect.height - 80; // Assuming assistant height is about 80px
        const maxLeft = textareaRect.width - 150; // Assuming assistant width is about 150px

        // Ensure the assistant stays within textarea boundaries
        const boundedTop = Math.min(Math.max(0, assistantTop), maxTop);
        const boundedLeft = Math.min(Math.max(0, assistantLeft), maxLeft);

        setAIAssistantPosition({
          top: boundedTop,
          left: boundedLeft,
        });
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

        // Calculate position ensuring it stays within textarea boundaries
        const selectionTop = rect.bottom - textareaRect.top;
        const selectionLeft = rect.left - textareaRect.left + rect.width / 2;

        // Calculate maximum positions to keep within boundaries
        const maxTop = textareaRect.height - 40; // Assuming button height is about 40px
        const maxLeft = textareaRect.width - 100; // Assuming button width is about 100px

        // Ensure the button stays within textarea boundaries
        const boundedTop = Math.min(Math.max(0, selectionTop), maxTop);
        const boundedLeft = Math.min(Math.max(0, selectionLeft), maxLeft);

        setSelectionPosition({
          top: boundedTop,
          left: boundedLeft,
        });

        setShowRefineOption(true);
        setShowRefineBelow(true);
      } else {
        setShowRefineOption(false);
        setShowRefineBelow(false);
      }
    }
  };

  // Handle right-click to show AI options
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default context menu

    if (textareaRef.current) {
      const textareaRect = textareaRef.current.getBoundingClientRect();

      // Calculate relative position within textarea
      const clickX = e.clientX - textareaRect.left;
      const clickY = e.clientY - textareaRect.top;

      // Ensure position stays within boundaries
      const maxTop = textareaRect.height - 80; // Assuming popup height is about 80px
      const maxLeft = textareaRect.width - 150; // Assuming popup width is about 150px

      const boundedTop = Math.min(Math.max(0, clickY), maxTop);
      const boundedLeft = Math.min(Math.max(0, clickX), maxLeft);

      setAIAssistantPosition({
        top: boundedTop,
        left: boundedLeft,
      });

      setShowAIAssistant(true);
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
      if (
        textareaContainerRef.current &&
        !textareaContainerRef.current.contains(event.target as Node)
      ) {
        setShowRefineBelow(false);
        setShowRefineOption(false);
        setShowAIAssistant(false);
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
    <div className="relative" ref={textareaContainerRef}>
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
        onContextMenu={handleContextMenu}
      />

      {/* Relative container for popups to ensure they stay within textarea */}
      <div className="absolute inset-0 pointer-events-none">
        {/* AI Assistant popup that appears on hover near cursor */}
        {!showRefineOption && showAIAssistant && !isTyping && (
          <div
            className="absolute z-10 bg-white rounded-md shadow-md flex flex-col pointer-events-auto"
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
      </div>

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
