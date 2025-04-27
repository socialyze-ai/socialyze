import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Check, Filter, Clock } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

interface FilterSelectorsProps {
  selectedChannels: string[];
  onChannelFilterChange: (channels: string[]) => void;
  selectedTags: string[];
  onTagFilterChange: (tags: string[]) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const timezones = [
  { name: 'Kolkata', offset: '(GMT+5:30)' },
  { name: 'Niue', offset: '(GMT-11:00)' },
  { name: 'Midway', offset: '(GMT-11:00)' },
  { name: 'Pago Pago', offset: '(GMT-11:00)' },
  { name: 'Rarotonga', offset: '(GMT-10:00)' },
  { name: 'Honolulu', offset: '(GMT-10:00)' },
  { name: 'Tahiti', offset: '(GMT-10:00)' },
];

const tagColors: { [key: string]: string } = {
  hello: 'bg-purple-100 text-purple-800',
  important: 'bg-red-100 text-red-800',
  top: 'bg-cyan-100 text-cyan-800',
  tags: 'bg-green-100 text-green-800',
  test: 'bg-pink-100 text-pink-800',
};

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  selectedChannels,
  onChannelFilterChange,
  selectedTags,
  onTagFilterChange,
  timezone,
  onTimezoneChange,
}) => {
  const { channels, posts } = usePosts();
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  
  // Extract all unique hashtags from posts
  const allTags = Array.from(new Set(
    posts.flatMap(post => {
      // Extract hashtags from content
      const regex = /#(\w+)/g;
      const matches = post.content.match(regex);
      return matches ? matches.map(tag => tag.substring(1)) : [];
    })
  ));
  
  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      onChannelFilterChange(selectedChannels.filter(id => id !== channelId));
    } else {
      onChannelFilterChange([...selectedChannels, channelId]);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagFilterChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagFilterChange([...selectedTags, tag]);
    }
  };
  
  return (
    <div className="flex gap-2 flex-wrap md:flex-nowrap">
      <Popover open={isChannelOpen} onOpenChange={setIsChannelOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full md:w-auto justify-between">
            <span>Channels</span>
            {selectedChannels.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedChannels.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            <Label>Filter by channel</Label>
            <div className="grid gap-1.5 mt-2">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={cn(
                    "justify-start font-normal",
                    selectedChannels.includes(channel.id) && "bg-muted"
                  )}
                  onClick={() => toggleChannel(channel.id)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <div className="h-5 w-5 rounded-full overflow-hidden">
                      <img
                        src={channel.profileImage}
                        alt={channel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span>{channel.name}</span>
                    {selectedChannels.includes(channel.id) && (
                      <Check className="h-4 w-4 ml-auto" />
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
          <Button variant="outline" className="w-full md:w-auto justify-between">
            <span>Tags</span>
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-2">{selectedTags.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
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
                      className="flex items-center gap-2"
                    >
                      <div className={cn(
                        'px-2 py-1 rounded text-sm',
                        tagColors[tag] || 'bg-gray-100 text-gray-800'
                      )}>
                        #{tag}
                      </div>
                      {selectedTags.includes(tag) && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
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
          <Button variant="outline" className="w-full md:w-auto">
            <Clock className="h-4 w-4 mr-2" />
            <span>{timezone.split('/').pop()?.replace('_', ' ') || timezone}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput 
              placeholder="Search cities or timezones" 
              value={timezoneSearch}
              onValueChange={setTimezoneSearch}
            />
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {timezones
                .filter(tz => 
                  tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                  tz.offset.toLowerCase().includes(timezoneSearch.toLowerCase())
                )
                .map((tz) => (
                  <CommandItem
                    key={tz.name}
                    onSelect={() => {
                      onTimezoneChange(tz.name);
                      setIsTimezoneOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span>{tz.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {tz.offset}
                      </span>
                    </div>
                    {timezone === tz.name && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterSelectors;
