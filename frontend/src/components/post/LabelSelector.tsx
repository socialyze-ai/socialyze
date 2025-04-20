import React, { useEffect, useRef } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDispatch, useSelector } from "react-redux";
import {
  Label,
  selectLabels,
  selectFilteredLabels,
  selectSearchValue,
  selectIsCreateDialogOpen,
  selectNewLabelName,
  selectSelectedColor,
  selectSelectedLabelsCount,
  setInitialLabels,
  setSearchValue,
  toggleLabel,
  setCreateDialogOpen,
  setNewLabelName,
  setSelectedColor,
  createLabel,
  initiateLabelCreation,
} from "@/redux/slices/labelManager.slice";

interface LabelSelectorProps {
  initialLabels?: Label[];
  onLabelsChange?: (selectedLabels: Label[]) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({ initialLabels, onLabelsChange }) => {
  // Redux hooks
  const dispatch = useDispatch();
  const labels = useSelector(selectLabels);
  const filteredLabels = useSelector(selectFilteredLabels);
  const searchValue = useSelector(selectSearchValue);
  const isCreateDialogOpen = useSelector(selectIsCreateDialogOpen);
  const newLabelName = useSelector(selectNewLabelName);
  const selectedColor = useSelector(selectSelectedColor);
  const selectedLabelsCount = useSelector(selectSelectedLabelsCount);

  // Local state for popover
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Colors for label selection
  const colors: string[] = [
    "#9c27b0",
    "#e91e63",
    "#e74c3c",
    "#ff9800",
    "#ffeb3b",
    "#8bc34a",
    "#1abc9c",
    "#3f51b5",
    "#000000",
    "#ce93d8",
    "#f8bbd0",
    "#ffcdd2",
    "#ffe0b2",
    "#fff9c4",
    "#c8e6c9",
    "#b2ebf2",
    "#bbdefb",
    "#e0e0e0",
  ];

  // Initialize with initial labels if provided
  useEffect(() => {
    if (initialLabels) {
      dispatch(setInitialLabels(initialLabels));
    }
  }, [initialLabels, dispatch]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Notify parent component when selected labels change
  useEffect(() => {
    if (onLabelsChange) {
      const selectedLabels = labels.filter((label) => label.selected);
      onLabelsChange(selectedLabels);
    }
  }, [labels, onLabelsChange]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    dispatch(setSearchValue(value));
  };

  // Check if label already exists
  const labelExists = (name: string): boolean => {
    return labels.some((label) => label.name.toLowerCase() === name.toLowerCase());
  };

  // Handle label toggle
  const handleToggleLabel = (labelId: string) => {
    dispatch(toggleLabel(labelId));
  };

  // Create new label
  const handleCreateLabel = () => {
    dispatch(createLabel());
  };

  // Initialize label creation from search
  const handleInitiateLabelCreation = () => {
    dispatch(initiateLabelCreation());
  };

  // Render selected labels up to 3 and show +2 for remaining labels
  const renderSelectedLabels = () => {
    const selectedLabels = labels.filter((label) => label.selected);
    const displayedLabels = selectedLabels.slice(0, 3);
    const remainingCount = selectedLabels.length - displayedLabels.length;

    return (
      <div className="flex items-center space-x-2">
        {selectedLabels.length > 0 ? (
          <>
            {displayedLabels.map((label) => (
              <div key={label.id} className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: label.color }}
                ></span>
                <span className="text-sm flex-grow">{label.name}</span>
              </div>
            ))}
            {remainingCount > 0 && <span>+{remainingCount}</span>}
          </>
        ) : (
          <span className="text-sm">Add Labels</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-fit">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit justify-between" aria-expanded={isOpen}>
            {renderSelectedLabels()}
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-fit p-0" align="end">
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search or create label"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mb-2"
            />

            <ScrollArea className="h-fit max-h-64 pr-4 overflow-y-scroll">
              {filteredLabels.length > 0 ? (
                filteredLabels.map((label) => (
                  <div
                    key={label.id}
                    className={
                      "flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    }
                    onClick={() => handleToggleLabel(label.id)}
                  >
                    <Checkbox
                      checked={label.selected}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    ></span>
                    <span className="text-sm flex-grow">{label.name}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">No labels match your search</div>
              )}

              {searchValue && !labelExists(searchValue) && (
                <div
                  className="flex items-center justify-center space-x-2 p-2 mt-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  onClick={handleInitiateLabelCreation}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Create "{searchValue}"</span>
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* New Label Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => dispatch(setCreateDialogOpen(open))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Label</DialogTitle>
          </DialogHeader>

          <Alert className="bg-gray-50 border-gray-200 mb-4">
            <AlertDescription className="text-sm">
              Labels are visible to everyone in your organization.
              <a href="#" className="text-blue-600 ml-1">
                Learn more
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newLabelName}
                onChange={(e) => dispatch(setNewLabelName(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="grid grid-cols-9 gap-2 mt-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-blue-600" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => dispatch(setSelectedColor(color))}
                  >
                    {selectedColor === color && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch(setCreateDialogOpen(false))}>
              Cancel
            </Button>
            <Button onClick={handleCreateLabel}>Save Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabelSelector;
