import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Check, Filter, Clock, Hash, Users } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface FilterSelectorsProps {
  selectedChannels: string[];
  onChannelFilterChange: (channels: string[]) => void;
  selectedTags: string[];
  onTagFilterChange: (tags: string[]) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const timezones = [
  { name: "Kolkata", offset: "(GMT+5:30)" },
  { name: "Niue", offset: "(GMT-11:00)" },
  { name: "Midway", offset: "(GMT-11:00)" },
  { name: "Pago Pago", offset: "(GMT-11:00)" },
  { name: "Rarotonga", offset: "(GMT-10:00)" },
  { name: "Honolulu", offset: "(GMT-10:00)" },
  { name: "Tahiti", offset: "(GMT-10:00)" },
];

const tagColors: { [key: string]: string } = {
  hello: "bg-purple-100 text-purple-800",
  important: "bg-red-100 text-red-800",
  top: "bg-cyan-100 text-cyan-800",
  tags: "bg-green-100 text-green-800",
  test: "bg-pink-100 text-pink-800",
};

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  selectedChannels,
  onChannelFilterChange,
  selectedTags,
  onTagFilterChange,
  timezone,
  onTimezoneChange,
}) => {
  const { channels, posts = [] } = usePosts();
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  // Extract all unique hashtags from posts
  const allTags = Array.from(
    new Set(
      (posts || []).flatMap((post) => {
        // Extract hashtags from content
        const regex = /#(\w+)/g;
        const matches = post.content ? post.content.match(regex) : null;
        return matches ? matches.map((tag) => tag.substring(1)) : [];
      }),
    ),
  );

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      onChannelFilterChange(selectedChannels.filter((id) => id !== channelId));
    } else {
      onChannelFilterChange([...selectedChannels, channelId]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagFilterChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagFilterChange([...selectedTags, tag]);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-3 py-2 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2 p-3 pt-2">
        <Popover open={isChannelOpen} onOpenChange={setIsChannelOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex gap-1.5 items-center justify-between"
            >
              <Users className="h-4 w-4" />
              <span>Channels</span>
              {selectedChannels.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedChannels.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by channel</div>
              <div className="grid gap-1.5">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start font-normal h-8 px-2",
                      selectedChannels.includes(channel.id) && "bg-muted",
                    )}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <div className="h-5 w-5 rounded-full overflow-hidden shrink-0">
                        <img
                          src={channel.profileImage}
                          alt={channel.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate">{channel.name}</span>
                      {selectedChannels.includes(channel.id) && (
                        <Check className="h-4 w-4 ml-auto shrink-0" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={isTagOpen} onOpenChange={setIsTagOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex gap-1.5 items-center justify-between"
            >
              <Hash className="h-4 w-4" />
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags" className="h-9" />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  <div className="p-2 space-y-1">
                    {allTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => toggleTag(tag)}
                        className="flex items-center gap-2 h-8 cursor-pointer"
                      >
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            tagColors[tag] || "bg-gray-100 text-gray-800",
                          )}
                        >
                          #{tag}
                        </div>
                        {selectedTags.includes(tag) && <Check className="h-4 w-4 ml-auto" />}
                      </CommandItem>
                    ))}
                  </div>
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={isTimezoneOpen} onOpenChange={setIsTimezoneOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 flex gap-1.5 items-center">
              <Clock className="h-4 w-4" />
              <span className="truncate">
                {timezone.split("/").pop()?.replace("_", " ") || timezone}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search cities or timezones"
                value={timezoneSearch}
                onValueChange={setTimezoneSearch}
              />
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {timezones
                  .filter(
                    (tz) =>
                      tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                      tz.offset.toLowerCase().includes(timezoneSearch.toLowerCase()),
                  )
                  .map((tz) => (
                    <CommandItem
                      key={tz.name}
                      onSelect={() => {
                        onTimezoneChange(tz.name);
                        setIsTimezoneOpen(false);
                      }}
                      className="flex items-center justify-between h-9 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>{tz.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{tz.offset}</span>
                      </div>
                      {timezone === tz.name && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default FilterSelectors;
