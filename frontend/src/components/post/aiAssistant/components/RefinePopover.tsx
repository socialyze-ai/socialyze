import React from "react";
import ActionButtons from "./ActionButtons";
import { Popover, PopoverContent } from "@/components/ui/popover";

const RefinePopover = ({
  generatedRefineContent,
  setShowRefinePreview,
  handleRefineAction,
  handleRegenerateRefinedText,
  isPendingContent,
}: {
  generatedRefineContent: string;
  setShowRefinePreview: (show: boolean) => void;
  handleRefineAction: () => void;
  handleRegenerateRefinedText: () => void;
  isPendingContent: boolean;
}) => {
  // Prevent clicks inside the popover from bubbling and affecting selection
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Only allow closing if no operations are in progress
  const handleCancel = () => {
    if (!isPendingContent) {
      setShowRefinePreview(false);
    }
  };

  return (
    <PopoverContent
      className="flex flex-col gap-2 p-1.5 px-2 max-w-sm"
      side="top"
      onClick={handlePopoverClick}
      align="start"
      avoidCollisions={true}
    >
      {isPendingContent ? (
        <p className="text-xs text-gray-600 mt-1">Refining...</p>
      ) : (
        <p className="text-xs text-green-600 mt-1">{generatedRefineContent}</p>
      )}
      <div className="flex justify-end">
        <ActionButtons
          handleConfirm={handleRefineAction}
          handleRegenerate={handleRegenerateRefinedText}
          handleCancel={handleCancel}
          isPending={isPendingContent}
        />
      </div>
    </PopoverContent>
  );
};

export default RefinePopover;
