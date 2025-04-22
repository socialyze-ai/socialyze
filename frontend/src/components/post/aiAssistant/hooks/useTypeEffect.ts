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

export const useTypeEffect = (baseTypeSpeed = 20, onComplete?: () => void): UseTypeEffectReturn => {
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>(null);
  const [showTypeControls, setShowTypeControls] = useState(false);

  // Type effect implementation with random speed variation for natural feel
  useEffect(() => {
    if (isTypingEffect && fullContent) {
      if (typedContent.length < fullContent.length) {
        // Add slight randomization to typing speed for a more natural feel
        const randomVariation = Math.random() * 30 - 10; // -10 to +20ms variation
        const currentTypeSpeed = Math.max(10, baseTypeSpeed + randomVariation);

        const timer = setTimeout(() => {
          setTypedContent(fullContent.substring(0, typedContent.length + 1));
        }, currentTypeSpeed);

        return () => clearTimeout(timer);
      } else {
        // Typing is complete
        setIsTypingEffect(false);
        setShowTypeControls(true);
      }
    }
  }, [isTypingEffect, typedContent, fullContent, baseTypeSpeed]);

  const startTypeEffect = (text: string, type: ContentType) => {
    // Clean up any unwanted HTML that might come from content editable
    const cleanedText = text.replace(/<\/?[^>]+(>|$)/g, "");

    setFullContent(cleanedText);
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

    if (onComplete) {
      onComplete();
    }
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
