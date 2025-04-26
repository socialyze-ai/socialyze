import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

interface HashtagInputProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  groupName?: string;
  onGroupNameChange?: (name: string) => void;
  showGroupNameInput?: boolean;
}

const HashtagInput: React.FC<HashtagInputProps> = ({
  hashtags,
  onHashtagsChange,
  groupName = "",
  onGroupNameChange,
  showGroupNameInput = true,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddHashtag = () => {
    if (!inputValue.trim()) return;

    // Remove # if user included it
    let hashtag = inputValue.trim();
    if (hashtag.startsWith("#")) {
      hashtag = hashtag.substring(1);
    }

    // Don't add if empty or already exists
    if (hashtag && !hashtags.includes(hashtag)) {
      onHashtagsChange([...hashtags, hashtag]);
    }

    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleRemoveHashtag = (index: number) => {
    const newHashtags = [...hashtags];
    newHashtags.splice(index, 1);
    onHashtagsChange(newHashtags);
  };

  return (
    <div className="space-y-2">
      {showGroupNameInput && onGroupNameChange && (
        <>
          <Label htmlFor="group-name-input">Hashtag Group Name</Label>
          <Input
            id="group-name-input"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            placeholder="Enter group name"
            className="mb-2"
          />
        </>
      )}
      <Label htmlFor="hashtag-input">Add Hashtags</Label>
      <div className="flex space-x-2">
        <Input
          id="hashtag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type hashtag and press Enter"
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleAddHashtag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {hashtags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              #{tag}
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => handleRemoveHashtag(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Press Enter, Space, or Comma to add a hashtag
      </p>
    </div>
  );
};

export default HashtagInput;
