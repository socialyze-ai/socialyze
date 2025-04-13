
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { usePosts } from '@/context/PostsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSchedule: (date: Date, channels: string[]) => void;
  content: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, selectedDate, onSchedule, content }) => {
  const { channels } = usePosts();
  const [time, setTime] = useState('12:00');
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSchedule = () => {
    if (!date || selectedChannels.length === 0) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes);
    
    onSchedule(scheduledDate, selectedChannels);
    onClose();
  };

  // Preview of the first few characters of content
  const contentPreview = content.length > 100 
    ? `${content.substring(0, 100)}...` 
    : content;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Choose when and where to publish your post.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Content Preview</Label>
            <div className="p-3 bg-muted rounded-md text-sm">{contentPreview}</div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date and Time</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{date ? format(date, "PPP") : "Select date"}</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="rounded-md border p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <input
                      type="time"
                      value={time}
                      onChange={handleTimeChange}
                      className="flex w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Social Channels</Label>
            <div className="grid gap-3">
              {channels.map(channel => (
                <div key={channel.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`channel-${channel.id}`}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={() => handleChannelToggle(channel.id)}
                  />
                  <Label
                    htmlFor={`channel-${channel.id}`}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                      <img src={channel.profileImage} alt={channel.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p>{channel.name}</p>
                      <p className={`text-xs social-icon-${channel.type}`}>
                        {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || selectedChannels.length === 0}
          >
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
