import React, { useState, useEffect } from "react";
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
  selectedDate: Date | undefined;
  onSchedule: (date: Date, channels: string[]) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSchedule,
}) => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : new Date(),
  );
  const [amPm, setAmPm] = useState<"AM" | "PM">("PM");

  const { selectedChannels } = useSelector(selectPostCreation);

  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
      const hours = selectedDate.getHours();
      const mins = selectedDate.getMinutes();

      // Convert 24hr to 12hr format
      if (hours === 0) {
        setHour("12");
        setAmPm("AM");
      } else if (hours === 12) {
        setHour("12");
        setAmPm("PM");
      } else if (hours > 12) {
        setHour((hours - 12).toString());
        setAmPm("PM");
      } else {
        setHour(hours.toString());
        setAmPm("AM");
      }

      setMinute(mins < 10 ? `0${mins}` : mins.toString());
    }
  }, [selectedDate]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(e.target.value);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(e.target.value);
  };

  const handleAmPmChange = (value: "AM" | "PM") => {
    setAmPm(value);
  };

  const resetSchedule = () => {
    setDate(new Date());
    setHour("12");
    setMinute("00");
    setAmPm("PM");
  };

  const handleSchedule = () => {
    if (!date || selectedChannels.length === 0) return;

    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const scheduledDate = new Date(date);

    // Adjust hours based on AM/PM
    let adjustedHours = hourNum;
    if (amPm === "PM" && hourNum < 12) {
      adjustedHours = hourNum + 12;
    } else if (amPm === "AM" && hourNum === 12) {
      adjustedHours = 0;
    }

    scheduledDate.setHours(adjustedHours, minuteNum);

    onSchedule(scheduledDate, selectedChannels);
    onClose();
    resetSchedule();
  };

  // Generate hours options (1-12)
  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const hourValue = (i + 1).toString();
    return (
      <option key={hourValue} value={hourValue}>
        {hourValue}
      </option>
    );
  });

  // Generate minutes options (00-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const minuteValue = i < 10 ? `0${i}` : i.toString();
    return (
      <option key={minuteValue} value={minuteValue}>
        {minuteValue}
      </option>
    );
  });

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
            <div className="w-full flex flex-col md:flex-row justify-evenly gap-2">
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
                      <span>{date ? format(date, "MMMM d, yyyy") : "Select date"}</span>
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

              <div className="flex items-center gap-1 border rounded-md p-2 w-fit">
                <Clock className="h-4 w-4 mr-2" />
                <select
                  value={hour}
                  onChange={handleHourChange}
                  className="bg-transparent focus:outline-none w-12"
                >
                  {hoursOptions}
                </select>
                <span>:</span>
                <select
                  value={minute}
                  onChange={handleMinuteChange}
                  className="bg-transparent focus:outline-none w-12"
                >
                  {minutesOptions}
                </select>
              </div>

              <div className="flex">
                <Button
                  type="button"
                  variant={amPm === "AM" ? "default" : "outline"}
                  className="rounded-r-none px-3"
                  onClick={() => handleAmPmChange("AM")}
                >
                  AM
                </Button>
                <Button
                  type="button"
                  variant={amPm === "PM" ? "default" : "outline"}
                  className="rounded-l-none px-3"
                  onClick={() => handleAmPmChange("PM")}
                >
                  PM
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
