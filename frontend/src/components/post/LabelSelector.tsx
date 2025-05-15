import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, X, Pencil, Trash2, BookMarked } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  removeDeletedLabel,
} from "@/redux/slices/labelManager.slice";
import {
  TagLabelType,
  useCreateTagLabel,
  useDeleteTagLabel,
  useGetTagLabels,
  useUpdateTagLabel,
} from "@/api/apiHooks/useTagLabel";

interface LabelSelectorProps {
  initialLabels?: Label[];
  onLabelsChange?: (selectedLabels: Label[]) => void;
  workspaceId?: string;

  // New props for customization
  buttonClassName?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
  label?: string;

  // Props for external control
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Props for integration with dashboard filters
  externalSelectedLabels?: string[];
  onExternalToggle?: (labelId: string) => void;

  // Content customization
  popoverWidth?: string;
  popoverAlign?: "center" | "start" | "end";
  showSelectedCount?: boolean;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  initialLabels,
  onLabelsChange,
  workspaceId = "default-workspace", // Fallback workspace ID

  // Default values for new props
  buttonClassName = "w-fit justify-between",
  buttonSize,
  buttonVariant = "outline",
  icon = <BookMarked className="h-4 w-4" />,
  label = "Labels",

  // External control props with defaults
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,

  // Dashboard integration props
  externalSelectedLabels,
  onExternalToggle,

  // Content customization
  popoverWidth = "w-fit max-w-sm",
  popoverAlign = "end",
  showSelectedCount = true,
}) => {
  // Redux hooks
  const dispatch = useDispatch();
  const labels = useSelector(selectLabels);
  const filteredLabels = useSelector(selectFilteredLabels);
  const searchValue = useSelector(selectSearchValue);
  const isCreateDialogOpen = useSelector(selectIsCreateDialogOpen);
  const newLabelName = useSelector(selectNewLabelName);
  const selectedColor = useSelector(selectSelectedColor);
  const selectedLabelsCount = useSelector(selectSelectedLabelsCount);

  // API hooks
  const { data: apiLabels, isLoading: isLoadingLabels } = useGetTagLabels();
  const { mutate: createNewLabel, isPending: isCreatingNewLabel } = useCreateTagLabel();
  const { mutate: updateLabel, isPending: isUpdatingLabel } = useUpdateTagLabel();
  const { mutate: deleteLabel, isPending: isDeletingLabel } = useDeleteTagLabel();

  // Local state
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [editingLabel, setEditingLabel] = useState<TagLabelType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editLabelName, setEditLabelName] = useState<string>("");
  const [editLabelColor, setEditLabelColor] = useState<string>("");

  // Determine if we're using internal or external state for the popover
  const isControlled = externalIsOpen !== undefined && externalOnOpenChange !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? externalOnOpenChange : setInternalIsOpen;

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

  // Sync API labels with Redux state
  useEffect(() => {
    if (apiLabels && apiLabels.length > 0) {
      const formattedLabels: Label[] = apiLabels.map((label) => ({
        id: label._id,
        name: label.name,
        color: label.color,
        selected: externalSelectedLabels
          ? externalSelectedLabels.includes(label._id)
          : initialLabels
          ? initialLabels.some((l) => l.id === label._id)
          : false,
      }));
      dispatch(setInitialLabels(formattedLabels));
    }
  }, [apiLabels, dispatch, initialLabels, externalSelectedLabels]);

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
    if (onExternalToggle) {
      onExternalToggle(labelId);
    } else {
      dispatch(toggleLabel(labelId));
    }
  };

  // Create new label
  const handleCreateLabel = () => {
    if (newLabelName.trim() && !labelExists(newLabelName)) {
      createNewLabel({
        name: newLabelName.trim(),
        color: selectedColor,
        workspace: workspaceId,
      });
      dispatch(setCreateDialogOpen(false));
      dispatch(setNewLabelName(""));
    }
  };

  // Initialize label creation from search
  const handleInitiateLabelCreation = () => {
    dispatch(initiateLabelCreation());
  };

  // Handle editing a label
  const handleEditClick = (e: React.MouseEvent, label: TagLabelType) => {
    e.stopPropagation(); // Prevent label toggle
    setEditingLabel(label);
    setEditLabelName(label.name);
    setEditLabelColor(label.color);
    setIsEditDialogOpen(true);
  };

  // Handle deleting a label
  const handleDeleteClick = (e: React.MouseEvent, labelId: string) => {
    e.stopPropagation(); // Prevent label toggle
    deleteLabel(labelId);
    // After deleting from API, remove the label from Redux state
    dispatch(removeDeletedLabel(labelId));
  };

  // Save edited label
  const handleSaveEdit = () => {
    if (editingLabel && editLabelName.trim()) {
      updateLabel({
        id: editingLabel._id,
        payload: {
          name: editLabelName,
          color: editLabelColor,
        },
      });
      setIsEditDialogOpen(false);
      setEditingLabel(null);
    }
  };

  // Determine if a label is selected
  const isLabelSelected = (labelId: string): boolean => {
    if (externalSelectedLabels) {
      return externalSelectedLabels.includes(labelId);
    }
    const label = labels.find((l) => l.id === labelId);
    return label?.selected || false;
  };

  // Render selected labels up to 3 and show +2 for remaining labels
  const renderSelectedLabels = () => {
    let selectedLabelsArray: Label[];
    let count = 0;

    if (externalSelectedLabels) {
      selectedLabelsArray = labels.filter((label) => externalSelectedLabels.includes(label.id));
      count = externalSelectedLabels.length;
    } else {
      selectedLabelsArray = labels.filter((label) => label.selected);
      count = selectedLabelsCount;
    }

    const displayedLabels = selectedLabelsArray.slice(0, 3);
    const remainingCount = selectedLabelsArray.length - displayedLabels.length;

    if (buttonSize === "sm") {
      // For small buttons, just show icon and count
      return (
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          {showSelectedCount && count > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {count}
            </Badge>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-wrap w-fit">
        {selectedLabelsArray.length > 0 ? (
          <>
            {displayedLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 bg-gray-100 px-1.5 py-0.5 rounded-full"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: label.color }}
                ></span>
                <span className="text-xs truncate w-fit">{label.name}</span>
              </div>
            ))}
            {remainingCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 text-xs">
                +{remainingCount}
              </Badge>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-500">{label}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-fit">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={cn(buttonClassName, "flex items-center justify-between w-fit gap-2")}
            aria-expanded={isOpen}
          >
            {renderSelectedLabels()}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className={cn(popoverWidth, "p-0")} align={popoverAlign}>
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search or create label"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mb-2"
            />

            <ScrollArea className="h-fit max-h-64 pr-4 overflow-y-auto">
              {isLoadingLabels ? (
                <div className="py-6 text-center text-gray-500">Loading labels...</div>
              ) : filteredLabels.length > 0 ? (
                filteredLabels.map((label) => {
                  // Find the corresponding API label to get its full data
                  const apiLabel = apiLabels?.find((l) => l._id === label.id);
                  const isSelected = isLabelSelected(label.id);

                  return (
                    <div
                      key={label.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer group"
                      onClick={() => handleToggleLabel(label.id)}
                    >
                      <Checkbox checked={isSelected} className="data-[state=checked]:bg-blue-600" />
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        ></span>
                        <span className="text-sm flex-grow">{label.name}</span>
                      </div>
                      {apiLabel && (
                        <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-gray-700"
                            onClick={(e) => handleEditClick(e, apiLabel)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-red-600"
                            onClick={(e) => handleDeleteClick(e, apiLabel._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-gray-500">No labels match your search</div>
              )}

              {searchValue && !labelExists(searchValue) && (
                <div
                  className="flex items-center justify-center gap-2 p-2 mt-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer transition-colors"
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
            <Button
              variant="outline"
              onClick={() => dispatch(setCreateDialogOpen(false))}
              disabled={isCreatingNewLabel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLabel}
              disabled={isCreatingNewLabel || !newLabelName.trim()}
            >
              {isCreatingNewLabel ? "Saving..." : "Save Label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingLabel(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editLabelName}
                onChange={(e) => setEditLabelName(e.target.value)}
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
                      editLabelColor === color ? "ring-2 ring-offset-2 ring-blue-600" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditLabelColor(color)}
                  >
                    {editLabelColor === color && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdatingLabel}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdatingLabel || !editLabelName.trim()}>
              {isUpdatingLabel ? "Saving..." : "Update Label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabelSelector;
