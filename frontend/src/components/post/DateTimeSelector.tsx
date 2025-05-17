import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, addDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Clock, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimeSelectorProps {
  selectedDate: Date | undefined;
  onDateTimeChange: (date: Date) => void;
  className?: string;
  setIsScheduleMode: (isScheduleMode: boolean) => void;
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  selectedDate,
  onDateTimeChange,
  className,
  setIsScheduleMode,
}) => {
  // State initialization with default values
  const now = new Date();
  const defaultDate = selectedDate || new Date();

  const [date, setDate] = useState<Date>(defaultDate);
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [amPm, setAmPm] = useState<"AM" | "PM">("PM");
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [availableMinutes, setAvailableMinutes] = useState<string[]>([]);

  // Initialize time from selectedDate or set a reasonable default (1 hour from now)
  useEffect(() => {
    if (selectedDate) {
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
      setDate(new Date(selectedDate));
    } else {
      // Default to 1 hour from now, rounded to nearest 5 minutes
      const defaultTime = new Date(now);
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(Math.ceil(defaultTime.getMinutes() / 5) * 5);

      const hours = defaultTime.getHours();
      const mins = defaultTime.getMinutes();

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
      setDate(defaultTime);
    }
  }, []);

  // Memoized function to calculate available time options
  const calculateTimeOptions = useCallback(() => {
    const isToday = isSameDay(date, now);

    // Generate all hours (1-12)
    const allHours = Array.from({ length: 12 }, (_, i) =>
      i + 1 < 10 ? `0${i + 1}` : (i + 1).toString(),
    );

    // Generate all minutes (00-59, in 5-minute increments)
    const allMinutes = Array.from({ length: 12 }, (_, i) =>
      i * 5 < 10 ? `0${i * 5}` : (i * 5).toString(),
    );

    // If not today, all times are available
    if (!isToday) {
      return {
        hours: allHours,
        minutes: allMinutes,
      };
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Convert selected hour to 24-hour format for comparison
    let selectedHour24 = parseInt(hour);
    if (amPm === "PM" && selectedHour24 < 12) {
      selectedHour24 += 12;
    } else if (amPm === "AM" && selectedHour24 === 12) {
      selectedHour24 = 0;
    }

    // For AM period
    if (amPm === "AM") {
      if (currentHour >= 12) {
        // If it's already PM, no AM hours are available today
        return { hours: [], minutes: [] };
      }

      // Filter available AM hours
      const availableHrs = allHours.filter((h) => {
        const hr = parseInt(h);
        const hr24 = hr === 12 ? 0 : hr;
        return hr24 >= currentHour;
      });

      // Filter available minutes for the current hour
      let availableMins = [...allMinutes];
      if (selectedHour24 === currentHour) {
        availableMins = allMinutes.filter((m) => parseInt(m) > currentMinute);
      }

      return {
        hours: availableHrs,
        minutes: availableMins,
      };
    }
    // For PM period
    else {
      const currentHourPM = currentHour - 12;
      const minHourPM = currentHourPM < 0 ? 0 : currentHourPM;

      // Filter available PM hours
      const availableHrs = allHours.filter((h) => {
        const hr = parseInt(h);
        const hrPM = hr === 12 ? 0 : hr;
        return hrPM >= minHourPM;
      });

      // Filter available minutes for the current hour
      let availableMins = [...allMinutes];
      if (amPm === "PM" && selectedHour24 === currentHour) {
        availableMins = allMinutes.filter((m) => parseInt(m) > currentMinute);
      }

      return {
        hours: availableHrs,
        minutes: availableMins,
      };
    }
  }, [date, hour, amPm, now]);

  // Update available time options when dependencies change
  useEffect(() => {
    const { hours, minutes } = calculateTimeOptions();

    // Reset hour/minute if current selection is no longer valid
    if (hours.length > 0 && !hours.includes(hour)) {
      setHour(hours[0]);
    }

    if (minutes.length > 0 && !minutes.includes(minute)) {
      setMinute(minutes[0]);
    }

    setAvailableHours(hours);
    setAvailableMinutes(minutes);
  }, [date, amPm, calculateTimeOptions]);

  // Update parent component with new date/time, debounced to prevent excessive updates
  useEffect(() => {
    // Skip initial render
    if (!hour || !minute) return;

    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const newDate = new Date(date);

    // Adjust hours based on AM/PM
    let adjustedHours = hourNum;
    if (amPm === "PM" && hourNum < 12) {
      adjustedHours = hourNum + 12;
    } else if (amPm === "AM" && hourNum === 12) {
      adjustedHours = 0;
    }

    newDate.setHours(adjustedHours, minuteNum, 0, 0);

    // Only update if date is valid and in the future
    const isValid = newDate > now;

    if (isValid) {
      // Debounce the update to prevent flickering
      const timeoutId = setTimeout(() => {
        onDateTimeChange(newDate);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [date, hour, minute, amPm, onDateTimeChange]);

  // Safe handlers for state changes
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      // If selecting today, make sure we adjust time as needed
      if (isSameDay(newDate, now)) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // If selected time would be in the past, adjust it to future
        const selectedHour24 =
          amPm === "PM" && parseInt(hour) < 12
            ? parseInt(hour) + 12
            : amPm === "AM" && parseInt(hour) === 12
            ? 0
            : parseInt(hour);

        if (
          selectedHour24 < currentHour ||
          (selectedHour24 === currentHour && parseInt(minute) <= currentMinute)
        ) {
          // Default to 1 hour from now, rounded to nearest 5 minutes
          const adjustedTime = new Date(now);
          adjustedTime.setHours(adjustedTime.getHours() + 1);
          adjustedTime.setMinutes(Math.ceil(adjustedTime.getMinutes() / 5) * 5);

          const newHours = adjustedTime.getHours();
          const newMins = adjustedTime.getMinutes();

          if (newHours === 0) {
            setHour("12");
            setAmPm("AM");
          } else if (newHours === 12) {
            setHour("12");
            setAmPm("PM");
          } else if (newHours > 12) {
            setHour((newHours - 12).toString());
            setAmPm("PM");
          } else {
            setHour(newHours.toString());
            setAmPm("AM");
          }

          setMinute(newMins < 10 ? `0${newMins}` : newMins.toString());
        }
      }

      setDate(newDate);
    }
  };

  const handleHourChange = (value: string) => {
    setHour(value);
  };

  const handleMinuteChange = (value: string) => {
    setMinute(value);
  };

  const handleAmPmChange = (value: "AM" | "PM") => {
    // When switching AM/PM, check if the time would become invalid
    const hourNum = parseInt(hour);
    let adjustedHour = hourNum;

    if (value === "PM" && hourNum < 12) {
      adjustedHour = hourNum + 12;
    } else if (value === "AM" && hourNum === 12) {
      adjustedHour = 0;
    }

    const testDate = new Date(date);
    testDate.setHours(adjustedHour, parseInt(minute), 0, 0);

    // If this would create a time in the past, adjust to future time
    if (isSameDay(date, now) && testDate < now) {
      // If switching to AM makes time invalid, either switch to tomorrow or reject change
      if (value === "AM") {
        // Option 1: Add a day and keep AM
        const tomorrowDate = addDays(date, 1);
        setDate(tomorrowDate);
      } else {
        // For PM, we can usually find a valid time
        const newHour = now.getHours() - 11 > 0 ? (now.getHours() - 11).toString() : "12";
        setHour(newHour);
      }
    }

    setAmPm(value);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex justify-between relative">
        <Label htmlFor="date">Schedule Date and Time</Label>

        <X
          size={16}
          className="absolute -right-2 -top-2 cursor-pointer"
          onClick={() => setIsScheduleMode(false)}
        />
      </div>
      <div className="w-full flex flex-col md:flex-row justify-start gap-2">
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
              onSelect={handleDateChange}
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
            <SelectContent className="h-52">
              {availableHours.length > 0 ? (
                availableHours.map((hourValue) => (
                  <SelectItem key={hourValue} value={hourValue}>
                    {hourValue}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="12" disabled>
                  No available hours
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <span>:</span>
          <Select value={minute} onValueChange={handleMinuteChange}>
            <SelectTrigger className="border-none flex gap-2 p-1 px-1.5 focus:ring-white w-fit h-fit">
              <SelectValue>{minute}</SelectValue>
            </SelectTrigger>
            <SelectContent className="h-52">
              {availableMinutes.length > 0 ? (
                availableMinutes.map((minuteValue) => (
                  <SelectItem key={minuteValue} value={minuteValue}>
                    {minuteValue}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="00" disabled>
                  No available minutes
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex">
          <Button
            type="button"
            variant={amPm === "AM" ? "default" : "outline"}
            className={cn(
              "rounded-r-none px-3",
              !availableHours.length && amPm === "AM" && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => handleAmPmChange("AM")}
            disabled={!availableHours.length && amPm === "AM"}
          >
            AM
          </Button>
          <Button
            type="button"
            variant={amPm === "PM" ? "default" : "outline"}
            className={cn(
              "rounded-l-none px-3",
              !availableHours.length && amPm === "PM" && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => handleAmPmChange("PM")}
            disabled={!availableHours.length && amPm === "PM"}
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;
