import React from "react";
import ContentEditable from "react-contenteditable";
import { cn } from "@/lib/utils";

interface ContentEditableWrapperProps {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  isTypingEffect: boolean;
  showTypeControls: boolean;
  typedContent: string;
  fullContent: string;
  placeholder: string;
  isPostModal: boolean;
  hasScrollbar: boolean;
  disableSelection?: boolean;
  className?: string;
  onInput: (e: React.FormEvent<HTMLElement>) => void;
  onMouseEnter: () => void;
  onMouseUp: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onKeyUp: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

const ContentEditableWrapper: React.FC<ContentEditableWrapperProps> = ({
  editorRef,
  content,
  isTypingEffect,
  showTypeControls,
  typedContent,
  fullContent,
  placeholder,
  isPostModal,
  hasScrollbar,
  disableSelection = false,
  className,
  onInput,
  onMouseEnter,
  onMouseUp,
  onKeyUp,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  onPaste,
}) => {
  const hasContent = content.trim().length > 0;

  return (
    <div className="relative">
      <ContentEditable
        innerRef={editorRef}
        html={
          content +
          (isTypingEffect || showTypeControls
            ? '<span class="ai-generated">' +
              (isTypingEffect ? typedContent : fullContent) +
              '<span id="typing-effect-end" class="typing-effect-end"></span>' +
              "</span>"
            : "")
        }
        disabled={isTypingEffect || showTypeControls}
        className={cn(
          "resize-none border-0 outline-none focus:outline-none p-3 bg-gray-50 rounded overflow-y-auto whitespace-pre-wrap",
          isPostModal ? "text-sm h-[300px]" : "text-base h-[200px]",
          hasScrollbar ? "pr-5" : "pr-6",
          disableSelection ? "disable-selection" : "",
          className,
        )}
        data-placeholder={placeholder}
        onChange={onInput}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onPaste={onPaste}
      />

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
          .typing-effect-end {
            display: inline;
            position: relative;
            white-space: nowrap;
            width: 0;
            height: 0;
            pointer-events: none;
          }
          .disable-selection {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            cursor: default;
          }
          /* Enhanced selection styling */
          [contenteditable=true]::selection {
            background-color: rgba(16, 185, 129, 0.3) !important; /* Green highlight */
            color: inherit;
          }
          [contenteditable=true]::-moz-selection {
            background-color: rgba(16, 185, 129, 0.3) !important;
            color: inherit;
          }
          .is-refining [contenteditable=true]::selection {
            background-color: rgba(16, 185, 129, 0.5) !important; /* Stronger green highlight during refining */
          }
          .is-refining [contenteditable=true]::-moz-selection {
            background-color: rgba(16, 185, 129, 0.5) !important;
          }
        `}
      </style>
    </div>
  );
};

export default ContentEditableWrapper;
