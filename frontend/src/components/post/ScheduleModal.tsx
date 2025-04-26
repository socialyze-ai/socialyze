import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SelectedChannels from "./SelectedChannels";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { useSelector } from "react-redux";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSchedule: (date: Date, channels: string[]) => void;
  content: string;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSchedule,
  content,
}) => {
  const [time, setTime] = useState("12:00");
  const [date, setDate] = useState<Date | undefined>(selectedDate);

  const { selectedChannels } = useSelector(selectPostCreation);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const handleSchedule = () => {
    if (!date || selectedChannels.length === 0) return;

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes);

    onSchedule(scheduledDate, selectedChannels);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>Choose when and where to publish your post.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <SelectedChannels />

          <div className="grid gap-2">
            <Label htmlFor="date">Date and Time</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
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
                <Button variant="outline" className="w-full justify-start text-left font-normal">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date || selectedChannels.length === 0}>
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
