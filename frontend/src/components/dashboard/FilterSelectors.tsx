import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BookMarked,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { selectLabels } from "@/redux/slices/labelManager.slice";
import { selectChannels } from "@/redux/slices/posts.slice";
import { RootState } from "@/redux/store";
import { updateFilter } from "@/redux/slices/dashboardPosts.slice";
import LayoutSelector, { LayoutType } from "./LayoutSelector";
import { Checkbox } from "@/components/ui/checkbox";
import AddChannelDialog from "../generic/AddChannelDialog";
import LabelSelector from "../post/LabelSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const toggleLabel = (labelId: string) => {
    let newLabels: string[];

    if (selectedLabels?.includes(labelId)) {
      newLabels = selectedLabels?.filter((l) => l !== labelId);
    } else {
      newLabels = [...selectedLabels, labelId];
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
        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
          <AddChannelDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

          <Popover open={isChannelOpen} onOpenChange={setIsChannelOpen}>
            <PopoverTrigger
              asChild
              className="rounded border-none bg-transparent hover:bg-gray-100"
            >
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
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 flex flex-col gap-1 p-1.5">
              {channels.length > 0 ? (
                channels.map((channel) => (
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
                      <Checkbox checked={selectedChannels?.includes(channel.id)} />
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={channel.profileImage} alt={channel.name} />
                        <AvatarFallback className="capitalize font-semibold text-xs bg-primary/10 text-primary">
                          {channel.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{channel.name}</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground p-2 text-center">
                    No Channels found
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                    Add Channel
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <LabelSelector
            buttonClassName="h-9 flex gap-1.5 items-center justify-between w-full sm:w-auto rounded border-none bg-transparent hover:bg-gray-100"
            buttonSize="sm"
            buttonVariant="outline"
            icon={<BookMarked className="h-4 w-4" />}
            label="Labels"
            isOpen={isLabelOpen}
            onOpenChange={setIsLabelOpen}
            externalSelectedLabels={selectedLabels}
            onExternalToggle={toggleLabel}
            popoverWidth="w-64"
            popoverAlign="start"
            showSelectedCount={true}
            workspaceId="default-workspace"
          />

          <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
            <PopoverTrigger
              asChild
              className="rounded border-none bg-transparent hover:bg-gray-100"
            >
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
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
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
                  <Checkbox checked={selectedStatuses?.includes("draft")} />
                  <Clock className="h-4 w-4" />
                  <span>Draft</span>
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
                  <Checkbox checked={selectedStatuses?.includes("published")} />
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Published</span>
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
                  <Checkbox checked={selectedStatuses?.includes("queued")} />
                  <FileText className="h-4 w-4" />
                  <span>Queued</span>
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
                  <Checkbox checked={selectedStatuses?.includes("failed")} />
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed</span>
                </div>
              </Button>
            </PopoverContent>
          </Popover>

          <Popover open={isTimezoneOpen} onOpenChange={setIsTimezoneOpen}>
            <PopoverTrigger
              asChild
              className="rounded border-none bg-transparent hover:bg-gray-100"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <span className="truncate">
                  Timezone: {timezone.split("/").pop()?.replace("_", " ") || timezone}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
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
                    <Checkbox checked={timezone === tz?.name} />
                    <span>
                      {tz?.name}-{tz?.offset}
                    </span>
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
