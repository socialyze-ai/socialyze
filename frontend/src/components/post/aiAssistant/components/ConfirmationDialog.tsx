import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Loader2, RefreshCcw } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
  onConfirm: () => void;
  onRegenerate: () => void;
  isRegenerateLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  content,
  onConfirm,
  onRegenerate,
  isRegenerateLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col gap-2">
        <p className="text-sm">{title}</p>
        <p className="font-semibold text-xs border border-gray-200 rounded-md p-1.5">{content}</p>
        <div className="flex gap-2 justify-end">
          <Button
            onClick={onRegenerate}
            type="button"
            variant="outline"
            className="text-green-600 hover:bg-green-100 text-xs"
            disabled={isRegenerateLoading}
          >
            {isRegenerateLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCcw className="h-3 w-3 mr-1" />
            )}
            Regenerate
          </Button>

          <Button
            onClick={onConfirm}
            type="button"
            variant="outline"
            className="text-green-600 hover:bg-green-100 text-xs"
          >
            <Check className="h-3 w-3 mr-1" /> Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
