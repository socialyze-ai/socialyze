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
  Tag,
  selectTags,
  selectFilteredTags,
  selectSearchValue,
  selectIsCreateDialogOpen,
  selectNewTagName,
  selectSelectedColor,
  selectSelectedTagsCount,
  setInitialTags,
  setSearchValue,
  toggleTag,
  setCreateDialogOpen,
  setNewTagName,
  setSelectedColor,
  createTag,
  initiateTagCreation,
} from "@/redux/slices/tagManager.slice";

interface TagSelectorProps {
  initialTags?: Tag[];
  onTagsChange?: (selectedTags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ initialTags, onTagsChange }) => {
  // Redux hooks
  const dispatch = useDispatch();
  const tags = useSelector(selectTags);
  const filteredTags = useSelector(selectFilteredTags);
  const searchValue = useSelector(selectSearchValue);
  const isCreateDialogOpen = useSelector(selectIsCreateDialogOpen);
  const newTagName = useSelector(selectNewTagName);
  const selectedColor = useSelector(selectSelectedColor);
  const selectedTagsCount = useSelector(selectSelectedTagsCount);

  // Local state for popover
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Colors for tag selection
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

  // Initialize with initial tags if provided
  useEffect(() => {
    if (initialTags) {
      dispatch(setInitialTags(initialTags));
    }
  }, [initialTags, dispatch]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Notify parent component when selected tags change
  useEffect(() => {
    if (onTagsChange) {
      const selectedTags = tags.filter((tag) => tag.selected);
      onTagsChange(selectedTags);
    }
  }, [tags, onTagsChange]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    dispatch(setSearchValue(value));
  };

  // Check if tag already exists
  const tagExists = (name: string): boolean => {
    return tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase());
  };

  // Handle tag toggle
  const handleToggleTag = (tagId: string) => {
    dispatch(toggleTag(tagId));
  };

  // Create new tag
  const handleCreateTag = () => {
    dispatch(createTag());
  };

  // Initialize tag creation from search
  const handleInitiateTagCreation = () => {
    dispatch(initiateTagCreation());
  };

  // Render button text based on selection
  const getButtonText = (): string => {
    if (selectedTagsCount === 0) return "Add Tags";
    return `${selectedTagsCount} Tag${selectedTagsCount > 1 ? "s" : ""} Selected`;
  };

  return (
    <div className="w-fit">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit justify-between" aria-expanded={isOpen}>
            <span className="text-sm">{getButtonText()}</span>
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-fit p-0" align="end">
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search or create tag"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mb-2"
            />

            <ScrollArea className="h-fit max-h-64 pr-4 overflow-y-scroll">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={
                      "flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    }
                    onClick={() => handleToggleTag(tag.id)}
                  >
                    <Checkbox checked={tag.selected} className="data-[state=checked]:bg-blue-600" />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></span>
                    <span className="text-sm flex-grow">{tag.name}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500">No tags match your search</div>
              )}

              {searchValue && !tagExists(searchValue) && (
                <div
                  className="flex items-center justify-center space-x-2 p-2 mt-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  onClick={handleInitiateTagCreation}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Create "{searchValue}"</span>
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* New Tag Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => dispatch(setCreateDialogOpen(open))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Tag</DialogTitle>
          </DialogHeader>

          <Alert className="bg-gray-50 border-gray-200 mb-4">
            <AlertDescription className="text-sm">
              Tags are visible to everyone in your organization.
              <a href="#" className="text-blue-600 ml-1">
                Learn more
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newTagName}
                onChange={(e) => dispatch(setNewTagName(e.target.value))}
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
            <Button onClick={handleCreateTag}>Save Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagSelector;
