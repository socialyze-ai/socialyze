import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookMarked, Check, Users, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { selectLabels } from "@/redux/slices/labelManager.slice";
import { selectChannels } from "@/redux/slices/posts.slice";
import { RootState } from "@/redux/store";
import { updateFilter } from "@/redux/slices/dashboardPosts.slice";
import LayoutSelector, { LayoutType } from "./LayoutSelector";

interface FilterSelectorsProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  setActiveLayout: (layout: LayoutType) => void;
  activeLayout: LayoutType;
}

const FilterSelectors: React.FC<FilterSelectorsProps> = ({
  timezone,
  onTimezoneChange,
  setActiveLayout,
  activeLayout,
}) => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannels);
  const labels = useSelector(selectLabels);
  const posts = useSelector((state: RootState) => state.dashboardPosts.posts);

  // Get filter values from the dashboard slice
  const selectedChannels = useSelector((state: RootState) => state.dashboardPosts.filters.channel);
  const selectedLabels = useSelector((state: RootState) => state.dashboardPosts.filters.label);
  const selectedStatuses = useSelector(
    (state: RootState) => state.dashboardPosts.filters.postStatus,
  );

  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Count posts by status
  const postCounts = {
    published: (posts || []).filter((post) => post.postStatus === "published").length,
    queued: (posts || []).filter((post) => post.postStatus === "queued").length,
    draft: (posts || []).filter((post) => post.postStatus === "draft").length,
    failed: (posts || []).filter((post) => post.postStatus === "failed").length,
  };

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

  const toggleStatus = (status: string) => {
    let newStatuses: string[];

    if (selectedStatuses?.includes(status)) {
      newStatuses = selectedStatuses.filter((s) => s !== status);
    } else {
      newStatuses = [...selectedStatuses, status];
    }

    dispatch(
      updateFilter({
        postStatus: newStatuses,
      }),
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between p-2 bg-white rounded-md shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-center gap-2 w-full mb-2 sm:mb-0">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Popover open={isChannelOpen} onOpenChange={setIsChannelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex gap-1.5 items-center justify-between w-full sm:w-auto"
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
                    {selectedChannels?.includes(channel.id) && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
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
                className="h-9 flex gap-1.5 items-center justify-between w-full sm:w-auto"
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

          <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex gap-1.5 items-center justify-between w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" />
                <span>Post Status</span>
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 flex flex-col gap-1 p-1.5">
              <Button
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  selectedStatuses?.includes("draft") && "bg-muted",
                )}
                onClick={() => toggleStatus("draft")}
              >
                <div className="flex items-center space-x-2 w-full">
                  <Clock className="h-4 w-4" />
                  <span>Draft ({postCounts.draft})</span>
                  {selectedStatuses?.includes("draft") && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  selectedStatuses?.includes("published") && "bg-muted",
                )}
                onClick={() => toggleStatus("published")}
              >
                <div className="flex items-center space-x-2 w-full">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Published ({postCounts.published})</span>
                  {selectedStatuses?.includes("published") && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  selectedStatuses?.includes("queued") && "bg-muted",
                )}
                onClick={() => toggleStatus("queued")}
              >
                <div className="flex items-center space-x-2 w-full">
                  <FileText className="h-4 w-4" />
                  <span>Queued ({postCounts.queued})</span>
                  {selectedStatuses?.includes("queued") && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  selectedStatuses?.includes("failed") && "bg-muted",
                )}
                onClick={() => toggleStatus("failed")}
              >
                <div className="flex items-center space-x-2 w-full">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed ({postCounts.failed})</span>
                  {selectedStatuses?.includes("failed") && <Check className="h-4 w-4 ml-auto" />}
                </div>
              </Button>
            </PopoverContent>
          </Popover>

          <Popover open={isTimezoneOpen} onOpenChange={setIsTimezoneOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <span className="truncate">
                  Timezone: {timezone.split("/").pop()?.replace("_", " ") || timezone}
                </span>
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
        </div>
      </div>

      <div className="flex justify-center sm:justify-end items-center w-full sm:w-auto">
        <LayoutSelector activeLayout={activeLayout} onLayoutChange={setActiveLayout} />
      </div>
    </div>
  );
};

export default FilterSelectors;
