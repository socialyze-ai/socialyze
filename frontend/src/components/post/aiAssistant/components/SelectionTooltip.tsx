import React from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface SelectionTooltipProps {
  position: { top: number; left: number; bottom: number; right: number } | null;
  onRefineClick: () => void;
}

const SelectionTooltip: React.FC<SelectionTooltipProps> = ({ position, onRefineClick }) => {
  if (!position) return null;

  return (
    <div
      className="absolute z-50"
      style={{
        top: `${position.bottom || 0}px`,
        left: `${position.left || 0}px`,
      }}
    >
      <Button
        onClick={onRefineClick}
        className="refine-button flex items-center gap-1.5 px-2 py-1 mt-1 bg-green-50 border border-green-200 hover:bg-green-100 text-xs rounded-md shadow-sm"
        variant="ghost"
        size="sm"
      >
        <Wand2 className="h-3.5 w-3.5 text-green-600" />
        <span className="text-green-700 font-medium">Refine with AI</span>
      </Button>
    </div>
  );
};

export default SelectionTooltip;
