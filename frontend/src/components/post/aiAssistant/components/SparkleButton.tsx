import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparkleButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isTextSelected: boolean;
  hasScrollbar: boolean;
  isPostModal: boolean;
  isDisabled?: boolean;
}

const SparkleButton: React.FC<SparkleButtonProps> = ({
  onClick,
  isTextSelected,
  hasScrollbar,
  isPostModal,
  isDisabled = false,
}) => {
  if (isTextSelected) return null;
  return (
    <div
      className={cn(
        "absolute z-10",
        hasScrollbar ? (isPostModal ? "top-1.5 right-3" : "top-1.5 right-4") : "top-1 right-1",
      )}
    >
      <Sparkles
        className={cn(
          "w-6 h-6 cursor-pointer bg-white rounded-full p-0.5 shadow-sm",
          isDisabled ? "text-gray-500" : isTextSelected ? "text-green-500" : "text-blue-500",
        )}
        onClick={(e) => {
          if (isDisabled) return;
          onClick(e);
        }}
      />
    </div>
  );
};

export default SparkleButton;
