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
import { format, isSameDay } from "date-fns";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SelectedChannels from "./SelectedChannels";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [availableMinutes, setAvailableMinutes] = useState<string[]>([]);

  const { selectedChannels } = useSelector(selectPostCreation);
  const now = new Date();

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

  // Update available time options when date changes
  useEffect(() => {
    updateAvailableTimeOptions();
  }, [date, hour, amPm]);

  const updateAvailableTimeOptions = () => {
    const isToday = date && isSameDay(date, now);

    // Generate all hours (1-12)
    const allHours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    // Generate all minutes (00-59)
    const allMinutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : i.toString()));

    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (amPm === "AM" && currentHour >= 12) {
        // If it's PM already, no AM hours are available
        setAvailableHours([]);
        setAvailableMinutes([]);
      } else if (amPm === "PM" && currentHour >= 23) {
        // If it's almost midnight, no PM hours are available
        setAvailableHours([]);
        setAvailableMinutes([]);
      } else {
        let availableHrs = [...allHours];

        // Filter available hours
        if (isToday) {
          if (amPm === "AM") {
            // For AM, filter hours before current time
            if (currentHour < 12) {
              const minHour = currentHour === 0 ? 12 : currentHour;
              availableHrs = availableHrs.filter((h) => parseInt(h) >= minHour);
            }
          } else {
            // For PM
            const pmHour = currentHour - 12;
            if (pmHour >= 0) {
              const minHour = pmHour === 0 ? 12 : pmHour;
              availableHrs = availableHrs.filter((h) => parseInt(h) >= minHour);
            }
          }
        }

        setAvailableHours(availableHrs);

        // Filter available minutes for the current hour
        if (isToday) {
          const selectedHourNum = parseInt(hour);
          let convertedCurrentHour = currentHour;
          let convertedSelectedHour = selectedHourNum;

          // Convert to 24-hour format for comparison
          if (amPm === "PM" && selectedHourNum < 12) {
            convertedSelectedHour += 12;
          } else if (amPm === "AM" && selectedHourNum === 12) {
            convertedSelectedHour = 0;
          }

          if (convertedSelectedHour === convertedCurrentHour) {
            // Only filter minutes if we're in the current hour
            setAvailableMinutes(allMinutes.filter((m) => parseInt(m) > currentMinute));
          } else {
            setAvailableMinutes(allMinutes);
          }
        } else {
          setAvailableMinutes(allMinutes);
        }
      }
    } else {
      // If not today, all hours and minutes are available
      setAvailableHours(allHours);
      setAvailableMinutes(allMinutes);
    }
  };

  const handleHourChange = (value: string) => {
    setHour(value);
  };

  const handleMinuteChange = (value: string) => {
    setMinute(value);
  };

  const handleAmPmChange = (value: "AM" | "PM") => {
    setAmPm(value);
  };

  const resetSchedule = () => {
    const defaultDate = new Date();
    setDate(defaultDate);

    // Set default time to current time + 1 hour
    const nextHour = defaultDate.getHours() + 1;
    if (nextHour === 0) {
      setHour("12");
      setAmPm("AM");
    } else if (nextHour === 12) {
      setHour("12");
      setAmPm("PM");
    } else if (nextHour > 12) {
      setHour((nextHour - 12).toString());
      setAmPm("PM");
    } else {
      setHour(nextHour.toString());
      setAmPm("AM");
    }

    setMinute("00");
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

    // Ensure the scheduled date is in the future
    if (scheduledDate <= now) {
      toast.error("Please select a future time.", {
        position: "top-center",
      });
      return;
    }

    onSchedule(scheduledDate, selectedChannels);
    onClose();
    resetSchedule();
  };

  // Generate hours options based on available hours
  const hoursOptions = availableHours.map((hourValue) => (
    <SelectItem key={hourValue} value={hourValue}>
      {hourValue}
    </SelectItem>
  ));

  // Generate minutes options based on available minutes
  const minutesOptions = availableMinutes.map((minuteValue) => (
    <SelectItem key={minuteValue} value={minuteValue}>
      {minuteValue}
    </SelectItem>
  ));

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
                    disabled={(date) => date < new Date(now.setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-1 border rounded-md p-1 px-2">
                <Clock className="h-4 w-4 mr-1" />
                <Select value={hour} onValueChange={handleHourChange}>
                  <SelectTrigger className="border-none flex gap-2 p-1 px-1.5 focus:ring-white w-fit h-fit">
                    <SelectValue>{hour}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="h-52">{hoursOptions}</SelectContent>
                </Select>
                <span>:</span>
                <Select value={minute} onValueChange={handleMinuteChange}>
                  <SelectTrigger className="border-none flex gap-2 p-1 px-1.5 focus:ring-white w-fit h-fit">
                    <SelectValue>{minute}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="h-52">{minutesOptions}</SelectContent>
                </Select>
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
          <Button
            onClick={handleSchedule}
            disabled={
              !date ||
              selectedChannels.length === 0 ||
              availableHours.length === 0 ||
              availableMinutes.length === 0
            }
          >
            Schedule Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
