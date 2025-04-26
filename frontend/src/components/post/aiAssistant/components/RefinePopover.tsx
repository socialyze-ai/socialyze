import ActionButtons from "./ActionButtons";

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
  return (
    <div className="flex flex-col gap-2 bg-white z-40 p-1.5 px-2 max-w-sm">
      {isPendingContent ? (
        <p className="text-xs text-gray-600 mt-1">Refining...</p>
      ) : (
        <p className="text-xs text-green-600 mt-1">{generatedRefineContent}</p>
      )}
      <div className="flex justify-end">
        <ActionButtons
          handleConfirm={handleRefineAction}
          handleRegenerate={handleRegenerateRefinedText}
          handleCancel={() => setShowRefinePreview(false)}
          isPending={isPendingContent}
        />
      </div>
    </div>
  );
};

export default RefinePopover;
