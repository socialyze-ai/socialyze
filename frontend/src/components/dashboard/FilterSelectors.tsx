import React, { useState } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookMarked, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { selectLabels } from "@/redux/slices/labelManager.slice";
import { selectChannels } from "@/redux/slices/posts.slice";
import { RootState } from "@/redux/store";
import { updateFilter } from "@/redux/slices/dashboardPosts.slice";

interface FilterSelectorsProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({ timezone, onTimezoneChange }) => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannels);
  const labels = useSelector(selectLabels);

  // Get filter values from the dashboard slice
  const selectedChannels = useSelector((state: RootState) => state.dashboardPosts.filters.channel);
  const selectedLabels = useSelector((state: RootState) => state.dashboardPosts.filters.label);

  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);

  const timezones = [
    { name: "Kolkata", offset: "(GMT+5:30)" },
    { name: "Niue", offset: "(GMT-11:00)" },
    { name: "Midway", offset: "(GMT-11:00)" },
    { name: "Pago Pago", offset: "(GMT-11:00)" },
    { name: "Rarotonga", offset: "(GMT-10:00)" },
    { name: "Honolulu", offset: "(GMT-10:00)" },
    { name: "Tahiti", offset: "(GMT-10:00)" },
  ];

  const toggleChannel = (channelId: string) => {
    let newChannels: string[];

    if (selectedChannels?.includes(channelId)) {
      newChannels = selectedChannels.filter((id) => id !== channelId);
    } else {
      newChannels = [...selectedChannels, channelId];
    }

    dispatch(
      updateFilter({
        channel: newChannels,
      }),
    );
  };

  const toggleLabel = (label: string) => {
    let newLabels: string[];

    if (selectedLabels?.includes(label)) {
      newLabels = selectedLabels?.filter((l) => l !== label);
    } else {
      newLabels = [...selectedLabels, label];
    }

    dispatch(
      updateFilter({
        label: newLabels,
      }),
    );
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
          <PopoverContent className="w-56 flex flex-col gap-1 p-1.5">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  selectedChannels?.includes(channel.id) && "bg-muted",
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
                  {selectedChannels?.includes(channel.id) && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>
            ))}
          </PopoverContent>
        </Popover>

        <Popover open={isLabelOpen} onOpenChange={setIsLabelOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex gap-1.5 items-center justify-between"
            >
              <BookMarked className="h-4 w-4" />
              <span>Labels</span>
              {selectedLabels.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {selectedLabels.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 flex flex-col gap-1 p-1.5">
            {labels.length > 0 ? (
              labels.map((label) => (
                <Button
                  key={label?.id}
                  variant="ghost"
                  className={cn(
                    "justify-start font-normal",
                    selectedLabels?.includes(label?.id) && "bg-muted",
                  )}
                  onClick={() => toggleLabel(label?.id)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <span>{label?.name}</span>
                    {selectedLabels?.includes(label?.id) && <Check className="h-4 w-4 ml-auto" />}
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-2">No Labels found</div>
            )}
          </PopoverContent>
        </Popover>

        <Popover open={isTimezoneOpen} onOpenChange={setIsTimezoneOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <span>Timezone: {timezone.split("/").pop()?.replace("_", " ") || timezone}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 flex flex-col gap-1 p-1.5">
            {timezones.map((tz) => (
              <Button
                key={tz?.name}
                variant="ghost"
                className={cn("justify-start font-normal", timezone === tz?.name && "bg-muted")}
                onClick={() => {
                  onTimezoneChange(tz?.name);
                  setIsTimezoneOpen(false);
                }}
              >
                <div className="flex items-center space-x-2 w-full">
                  <span>
                    {tz?.name}-{tz?.offset}
                  </span>
                  {timezone === tz?.name && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};

export default FilterSelectors;
