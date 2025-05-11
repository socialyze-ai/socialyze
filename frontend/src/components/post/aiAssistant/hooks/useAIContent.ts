import { useDispatch } from "react-redux";
import { useGenerateContent, useGenerateHashTags } from "@/api/apiHooks/useAI";
import {
  setGeneratedContent,
  setGeneratedRefineContent,
  setHashtags,
  setShowAIOptions,
  setSelectedRange,
  setIsTextSelected,
} from "@/redux/slices/aiTextarea.slice";
import { toast } from "sonner";

type ContentType = "refine" | "complete" | "hashtags";

interface UseAIContentParams {
  content: string;
  startTypeEffect: (text: string, type: ContentType) => void;
  focusAndSelectText: (range: { start: number; end: number } | null) => void;
  previousSelectionRef: React.MutableRefObject<{ start: number; end: number } | null>;
}

export const useAIContent = ({
  content,
  startTypeEffect,
  focusAndSelectText,
  previousSelectionRef,
}: UseAIContentParams) => {
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

      // Keep focus on the selected text during the API call
      focusAndSelectText(selectedRange);

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
              focusAndSelectText(previousSelectionRef.current);
            }, 50);
          },
          onError: () => {
            toast.error("Error refining with AI", {
              position: "top-center",
            });

            // Still restore selection on error
            setTimeout(() => {
              focusAndSelectText(previousSelectionRef.current);
            }, 10);
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
          toast.error("Error completing with AI", {
            position: "top-center",
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
          toast.error("Error generating hashtags", {
            position: "top-center",
          });
        },
      },
    );
  };

  // Handler for regenerating refined text
  const handleRegenerateRefinedText = (
    selectedRange: { start: number; end: number } | null,
    e?: React.MouseEvent,
  ) => {
    // If there's an event, prevent default behavior and propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

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

    // Maintain focus and selection during API call
    focusAndSelectText(selRange);

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
            focusAndSelectText(previousSelectionRef.current);
          }, 50);
        },
        onError: () => {
          toast.error("Error regenerating refined text", {
            position: "top-center",
          });

          // Still restore selection on error
          setTimeout(() => {
            focusAndSelectText(previousSelectionRef.current);
          }, 10);
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
          toast.error("Error regenerating content", {
            position: "top-center",
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
          toast.error("Error regenerating hashtags", {
            position: "top-center",
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
