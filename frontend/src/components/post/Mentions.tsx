
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AtSign, Check, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface MentionsProps {
  onMention: (user: string) => void;
}

// Mock user data
const USERS = [
  { id: '1', name: 'John Smith', username: 'johnsmith', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Sarah Johnson', username: 'sarahj', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '3', name: 'Michael Brown', username: 'mike_brown', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '4', name: 'Emma Wilson', username: 'emmaw', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '5', name: 'David Lee', username: 'davidlee', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
];

const Mentions: React.FC<MentionsProps> = ({ onMention }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelect = (username: string) => {
    onMention(username);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <AtSign className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-72" align="start">
        <Command>
          <CommandInput 
            placeholder="Search people..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No people found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {USERS.filter(user => 
                user.name.toLowerCase().includes(search.toLowerCase()) || 
                user.username.toLowerCase().includes(search.toLowerCase())
              ).map(user => (
                <CommandItem 
                  key={user.id} 
                  onSelect={() => handleSelect(user.username)}
                  className="flex items-center space-x-2 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <Check
                    className={`h-4 w-4 opacity-0`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Mentions;
