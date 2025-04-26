import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useGenerateContent, useGenerateHashTags } from "@/api/apiHooks/useAI";
import {
  setGeneratedContent,
  setGeneratedRefineContent,
  setHashtags,
  setShowAIOptions,
  setSelectedRange,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";

type ContentType = "refine" | "complete" | "hashtags";

interface UseAIContentParams {
  content: string;
  startTypeEffect: (text: string, type: ContentType) => void;
  focusAndSelectText: () => void;
  previousSelectionRef: React.MutableRefObject<{ start: number; end: number } | null>;
}

export const useAIContent = ({
  content,
  startTypeEffect,
  focusAndSelectText,
  previousSelectionRef,
}: UseAIContentParams) => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  const { mutate: generateHashTags, isPending: isPendingHashTags } = useGenerateHashTags();
  const { mutate: generateContent, isPending: isPendingContent } = useGenerateContent();

  // Helper function to clean content
  const cleanContent = (text: string): string => {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  };

  // Handle refine with AI (for selected text)
  const handleRefineWithAI = (selectedRange: { start: number; end: number } | null) => {
    if (selectedRange) {
      const selStart = selectedRange.start;
      const selEnd = selectedRange.end;
      const selText = content.substring(selStart, selEnd);

      // Clean selected text from any HTML
      const cleanSelectedText = cleanContent(selText);

      // Store the current selection in a ref to ensure we can access it later
      previousSelectionRef.current = { start: selStart, end: selEnd };

      // Wrap selected text in <focus> tags
      const wholeText =
        content.substring(0, selStart) +
        `<focus>${cleanSelectedText}</focus>` +
        content.substring(selEnd);

      generateContent(
        {
          text: cleanSelectedText, // send only selected text
          action: "refine",
        },
        {
          onSuccess: (data: { text: string }) => {
            dispatch(setGeneratedRefineContent(data.text));
            dispatch(setShowAIOptions(false));

            // Make sure we keep the selection range active
            if (previousSelectionRef.current) {
              dispatch(setSelectedRange(previousSelectionRef.current));
              dispatch(setIsTextSelected(true));
            }

            // Always ensure the selection is preserved
            setTimeout(() => {
              focusAndSelectText();
            }, 50);
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

  // Handle complete with AI
  const handleCompleteWithAI = () => {
    // Clean content from any HTML
    const cleanedContent = cleanContent(content);

    generateContent(
      {
        text: cleanedContent,
        action: "complete",
      },
      {
        onSuccess: (data: { text: string }) => {
          dispatch(setGeneratedContent(data.text));
          dispatch(setShowAIOptions(false));
          startTypeEffect(data.text, "complete");
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

  // Handle generate hashtags
  const handleGenerateHashtags = () => {
    // Clean content from any HTML
    const cleanedContent = cleanContent(content);

    generateHashTags(
      {
        text: cleanedContent,
      },
      {
        onSuccess: (data) => {
          dispatch(setHashtags(data.text));
          dispatch(setShowAIOptions(false));
          startTypeEffect(data.text, "hashtags");
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

  // Handler for regenerating refined text
  const handleRegenerateRefinedText = (selectedRange: { start: number; end: number } | null) => {
    // Use previousSelectionRef as a fallback if selectedRange is somehow lost
    const selRange = selectedRange || previousSelectionRef.current;
    if (!selRange) return;

    const selStart = selRange.start;
    const selEnd = selRange.end;
    const selText = content.substring(selStart, selEnd);

    // Clean selected text
    const cleanSelectedText = cleanContent(selText);

    // Store the current selection to preserve it
    previousSelectionRef.current = selRange;

    // Wrap selected text in <focus> tags
    const wholeText =
      content.substring(0, selStart) +
      `<focus>${cleanSelectedText}</focus>` +
      content.substring(selEnd);

    generateContent(
      {
        text: cleanSelectedText,
        action: "refine",
      },
      {
        onSuccess: (data: { text: string }) => {
          dispatch(setGeneratedRefineContent(data.text));

          // Keep the selection range active
          dispatch(setSelectedRange(previousSelectionRef.current));
          dispatch(setIsTextSelected(true));

          // Ensure focus is maintained
          setTimeout(() => {
            focusAndSelectText();
          }, 50);
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
    // Clean content from any HTML
    const cleanedContent = cleanContent(content);

    generateContent(
      {
        text: cleanedContent,
        action: "complete",
      },
      {
        onSuccess: (data: { text: string }) => {
          dispatch(setGeneratedContent(data.text));
          startTypeEffect(data.text, "complete");
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
    // Clean content from any HTML
    const cleanedContent = cleanContent(content);

    generateHashTags(
      {
        text: cleanedContent,
      },
      {
        onSuccess: (data) => {
          dispatch(setHashtags(data.text));
          startTypeEffect(data.text, "hashtags");
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

  return {
    handleRefineWithAI,
    handleCompleteWithAI,
    handleGenerateHashtags,
    handleRegenerateRefinedText,
    handleRegenerateCompletion,
    handleRegenerateHashtags,
    isPendingHashTags,
    isPendingContent,
  };
};
