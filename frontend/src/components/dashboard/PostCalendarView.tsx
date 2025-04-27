import React, { useCallback, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, addDays, startOfToday } from "date-fns";
import moment from "moment";
import { Post, SocialChannel, usePosts } from "@/context/PostsContext";
import { StatusFilter } from "./PostStatusSelector";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import PostPreview from "@/components/post/PostPreview";
import { Plus } from "lucide-react";

// Initialize localizer
const localizer = momentLocalizer(moment);

interface PostCalendarViewProps {
  statusFilter: StatusFilter;
  channelFilter: string[];
  tagFilter: string[];
  timezone: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  post: Post;
  channelId: string;
  channelType: string;
}

const PostCalendarView: React.FC<PostCalendarViewProps> = ({
  statusFilter,
  channelFilter,
  tagFilter,
  timezone,
}) => {
  const { posts, channels } = usePosts();
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  const filteredPosts = posts.filter((post) => {
    if (!post.scheduledAt) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(post.status))
      return false;
    if (
      channelFilter.length > 0 &&
      !post.channels.some((channelId) => channelFilter.includes(channelId))
    )
      return false;

    if (tagFilter.length > 0) {
      const postTags = getTagsFromContent(post.content);
      if (!tagFilter.some((tag) => postTags.includes(tag))) return false;
    }

    return true;
  });

  const getTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches.map((tag) => tag.substring(1)) : [];
  };

  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    filteredPosts.forEach((post) => {
      if (post.scheduledAt) {
        post.channels.forEach((channelId) => {
          const channel = channels.find((c) => c.id === channelId);
          if (channel) {
            const startDate = new Date(post.scheduledAt!);
            const endDate = new Date(startDate);
            endDate.setMinutes(startDate.getMinutes() + 30);

            calendarEvents.push({
              id: `${post.id}-${channelId}`,
              title:
                post.content.length > 30
                  ? post.content.substring(0, 30) + "..."
                  : post.content,
              start: startDate,
              end: endDate,
              post,
              channelId,
              channelType: channel.type,
            });
          }
        });
      }
    });

    return calendarEvents;
  }, [filteredPosts, channels]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor;
    switch (event.channelType) {
      case "twitter":
        backgroundColor = "#1DA1F2";
        break;
      case "facebook":
        backgroundColor = "#4267B2";
        break;
      case "instagram":
        backgroundColor = "#C13584";
        break;
      case "linkedin":
        backgroundColor = "#0077B5";
        break;
      case "pinterest":
        backgroundColor = "#E60023";
        break;
      case "tiktok":
        backgroundColor = "#000000";
        break;
      default:
        backgroundColor = "#6B7280";
    }

    return {
      style: {
        backgroundColor: "transparent",
        borderRadius: "4px",
        opacity: 0.95,
        color: "black",
        border: "0px",
      },
    };
  }, []);

  const toggleDateExpansion = (dateStr: string) => {
    setExpandedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const channel = channels.find((c) => c.id === event.channelId);
    const dateStr = format(event.start, "yyyy-MM-dd");
    const timeStr = format(event.start, "hh:mm a");
    const isExpanded = expandedDates.includes(dateStr);

    const postsForDate = events.filter(
      (e) => format(e.start, "yyyy-MM-dd") === dateStr
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          {channel && (
            <div className="flex justify-between cursor-pointer p-0.5 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={channel.profileImage}
                    alt={channel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="truncate">{timeStr}</div>
              </div>

              <div className="h-5 w-5 rounded overflow-hidden flex-shrink-0">
                <img
                  src={channel.profileImage}
                  alt={channel.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0.5">
          {channel && (
            <PostPreview
              content={event.post.content}
              channel={channel}
              mediaUrl={event.post.mediaUrls?.[0]}
            />
          )}
        </PopoverContent>
      </Popover>
    );
  };

  const DateCellWrapper = ({ children, value }: any) => {
    const dateStr = format(value, "yyyy-MM-dd");
    const postsForDate = events.filter(
      (event) => format(event.start, "yyyy-MM-dd") === dateStr
    );
    const remainingCount = postsForDate.length - 5;

    const handleAddPost = (value: any) => {
      console.log("add post", value);
    };

    return (
      <div className="relative h-full group">
        {children}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleAddPost(value);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {postsForDate.length > 5 && !expandedDates.includes(dateStr) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs mt-1"
            onClick={() => toggleDateExpansion(dateStr)}
          >
            +{remainingCount} more
          </Button>
        )}
        {expandedDates.includes(dateStr) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs mt-1"
            onClick={() => toggleDateExpansion(dateStr)}
          >
            Show less
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="p-2 h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month"]}
        // views={["month", "week", "day"]}
        defaultView="month"
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          dateCellWrapper: DateCellWrapper,
        }}
        popup
      />
    </Card>
  );
};

export default PostCalendarView;
