import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ModalWrapper = ({
  title,
  description,
  children,
  triggerButtonText,
  submitButtonText,
  onSubmit,
  onTrigger,
  submitButtonProps,
  dialogContentClassName,
  triggerButtonProps,
  footerChildren,
  onModalCloseTrigger,
  submitButtonDisabled = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerButtonText: string | React.ReactNode;
  submitButtonText?: string;
  onSubmit?: () => void;
  onTrigger?: () => void;
  submitButtonProps?: React.ComponentProps<typeof Button>;
  dialogContentClassName?: string;
  triggerButtonProps?: React.ComponentProps<typeof Button>;
  footerChildren?: React.ReactNode;
  onModalCloseTrigger?: () => void;
  submitButtonDisabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
        onModalCloseTrigger?.();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" onClick={onTrigger} {...triggerButtonProps}>
          {triggerButtonText}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("max-w-4xl", dialogContentClassName)}
        onCloseAutoFocus={() => {
          setIsOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          {footerChildren ? (
            footerChildren
          ) : (
            <>
              {submitButtonText && (
                <Button
                  type="submit"
                  onClick={() => {
                    setIsOpen(false);
                    onSubmit();
                  }}
                  {...submitButtonProps}
                  disabled={submitButtonDisabled}
                >
                  {submitButtonText}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper;
