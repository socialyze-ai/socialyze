import React from "react";
import ActionButtons from "./ActionButtons";

interface GeneratedContentControlsProps {
  showTypeControls: boolean;
  handleConfirm: () => void;
  handleRegenerate: () => void;
  handleCancel: () => void;
  isPending: boolean;
}

const GeneratedContentControls: React.FC<GeneratedContentControlsProps> = ({
  showTypeControls,
  handleConfirm,
  handleRegenerate,
  handleCancel,
  isPending,
}) => {
  if (!showTypeControls) return null;

  return (
    <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-sm border border-gray-100 p-1 flex items-center gap-1.5">
      <span className="text-xs text-gray-500 mr-1">AI generated:</span>
      <ActionButtons
        handleConfirm={handleConfirm}
        handleRegenerate={handleRegenerate}
        handleCancel={handleCancel}
        isPending={isPending}
      />
    </div>
  );
};

export default GeneratedContentControls;
