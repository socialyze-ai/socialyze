import { useState, useEffect } from "react";

type ContentType = "refine" | "complete" | "hashtags" | null;

interface UseTypeEffectReturn {
  isTypingEffect: boolean;
  typedContent: string;
  fullContent: string;
  contentType: ContentType;
  showTypeControls: boolean;
  startTypeEffect: (text: string, type: ContentType) => void;
  resetTypeEffect: () => void;
}

export const useTypeEffect = (typeSpeed = 20): UseTypeEffectReturn => {
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>(null);
  const [showTypeControls, setShowTypeControls] = useState(false);

  // Type effect implementation
  useEffect(() => {
    if (isTypingEffect && fullContent) {
      if (typedContent.length < fullContent.length) {
        const timer = setTimeout(() => {
          setTypedContent(fullContent.substring(0, typedContent.length + 1));
        }, typeSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsTypingEffect(false);
        setShowTypeControls(true);
      }
    }
  }, [isTypingEffect, typedContent, fullContent, typeSpeed]);

  const startTypeEffect = (text: string, type: ContentType) => {
    setFullContent(text);
    setTypedContent("");
    setIsTypingEffect(true);
    setContentType(type);
    setShowTypeControls(false);
  };

  const resetTypeEffect = () => {
    setIsTypingEffect(false);
    setTypedContent("");
    setFullContent("");
    setContentType(null);
    setShowTypeControls(false);
  };

  return {
    isTypingEffect,
    typedContent,
    fullContent,
    contentType,
    showTypeControls,
    startTypeEffect,
    resetTypeEffect,
  };
};
