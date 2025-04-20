import React from "react";
import { Button } from "@/components/ui/button";
import { Check, RefreshCcw, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TypeEffectControlsProps {
  typedContent: string;
  onConfirm: () => void;
  onRegenerate: () => void;
  onCancel: () => void;
  isPending: boolean;
}

const TypeEffectControls: React.FC<TypeEffectControlsProps> = ({
  typedContent,
  onConfirm,
  onRegenerate,
  onCancel,
  isPending,
}) => {
  return (
    <div className="absolute bottom-2 left-2 right-2 bg-gray-50 p-2 rounded-md border border-gray-200 flex items-center justify-between">
      <span className="text-sm text-gray-700 mr-2 flex-grow overflow-hidden text-ellipsis">
        {typedContent}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200"
              onClick={onConfirm}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-blue-100 hover:bg-blue-200"
              onClick={onRegenerate}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
              ) : (
                <RefreshCcw className="h-3 w-3 text-blue-600" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
              onClick={onCancel}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1 text-xs">
            <p className="font-medium">Actions:</p>
            <div className="flex items-center space-x-2">
              <Check className="h-3 w-3 text-green-600" />
              <span>Apply the suggestion</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCcw className="h-3 w-3 text-blue-600" />
              <span>Generate a new suggestion</span>
            </div>
            <div className="flex items-center space-x-2">
              <X className="h-3 w-3 text-red-600" />
              <span>Dismiss the suggestion</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TypeEffectControls;
