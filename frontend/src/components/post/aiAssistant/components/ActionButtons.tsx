import { Check, RefreshCcw, X } from "lucide-react";

const ActionButtons = ({
  handleConfirm,
  handleRegenerate,
  handleCancel,
  isPending,
}: {
  handleConfirm: () => void;
  handleRegenerate: () => void;
  handleCancel: () => void;
  isPending: boolean;
}) => {
  return (
    <span className="inline-flex space-x-1.5 ml-1 align-middle">
      <button
        className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center"
        onClick={handleConfirm}
        disabled={isPending}
      >
        <Check size={16} className="text-green-600" />
      </button>
      <button
        className="h-6 w-6 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
        onClick={handleRegenerate}
        disabled={isPending}
      >
        {isPending ? (
          <RefreshCcw size={16} className="text-blue-600 animate-spin" />
        ) : (
          <RefreshCcw size={16} className="text-blue-600" />
        )}
      </button>
      <button
        className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
        onClick={handleCancel}
      >
        <X size={16} className="text-red-600" />
      </button>
    </span>
  );
};

export default ActionButtons;
