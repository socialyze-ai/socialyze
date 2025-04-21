import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, X, Hash, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { setShowAIOptions } from "@/redux/slices/aiTextarea.slice";

interface AIOptionsProps {
  underlineType: string;
  onClose: (e: React.MouseEvent) => void;
  handleCompleteWithAI: () => void;
  handleGenerateHashtags: () => void;
  isPendingContent: boolean;
  isPendingHashTags: boolean;
}

const AIOptions: React.FC<AIOptionsProps> = ({
  underlineType,
  onClose,
  handleCompleteWithAI,
  handleGenerateHashtags,
  isPendingContent,
  isPendingHashTags,
}) => {
  const optionsRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Handle clicks outside the options popover
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        dispatch(setShowAIOptions(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div
      ref={optionsRef}
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
          <Wand2 className={cn("h-4 w-4 mr-1.5", "text-blue-500")} />
          <span className={cn("text-xs font-medium", "text-blue-700")}>AI Suggestions</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Card body */}
      <div className="px-3 py-2">
        <div className="space-y-1">
          <Button
            size="sm"
            onClick={handleButtonClick(handleCompleteWithAI)}
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
            onClick={handleButtonClick(handleGenerateHashtags)}
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
      </div>
    </div>
  );
};

export default AIOptions;
