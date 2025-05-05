import React, { useCallback, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, addDays, startOfToday, isBefore, startOfDay, differenceInDays } from "date-fns";
import moment from "moment";
import { StatusFilter } from "./PostStatusSelector";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreatePostModal from "@/components/post/CreatePostModal";
import { useSelector } from "react-redux";
import { selectChannels } from "@/redux/slices/posts.slice";
import { RootState } from "@/redux/store";
import GridPostCard from "./GridPostCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Initialize localizer
const localizer = momentLocalizer(moment);

// Using the PostType interface from dashboardPosts slice
interface PostType {
  _id: string;
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "schedule";
  postStatus: "queued" | "sent" | "failed" | "published";
  scheduledTime?: string;
  handle?: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  post: PostType;
  channelId: string;
  channelType: string;
}

const PostCalendarView = () => {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const isMobile = useIsMobile();

  const posts = useSelector((state: RootState) => state.dashboardPosts.posts);
  const channels = useSelector(selectChannels);
  const statusFilter = useSelector((state: RootState) => state.dashboardPosts.filters.postStatus);
  const channelFilter = useSelector((state: RootState) => state.dashboardPosts.filters.channel);
  const tagFilter = useSelector((state: RootState) => state.dashboardPosts.filters.label);

  console.log("posts", posts);

  const getTagsFromContent = (content: string): string[] => {
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches?.map((tag) => tag.substring(1)) : [];
  };

  const filteredPosts = useMemo(() => {
    return (posts || []).filter((post) => {
      if (!post.createdAt) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(post.postStatus)) return false;

      // Check channel filter - posts have a single channelId, not an array of channels
      if (channelFilter.length > 0 && !channelFilter.includes(post.channelId)) return false;

      if (tagFilter.length > 0) {
        const postTags = getTagsFromContent(post.text || "");
        if (!tagFilter.some((tag) => postTags.includes(tag))) return false;
      }

      return true;
    });
  }, [posts, statusFilter, channelFilter, tagFilter]);

  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    filteredPosts.forEach((post) => {
      if (post.createdAt) {
        const channelId = post.channelId;
        const channel = channels.find((c) => c.id === channelId || c.channelId === channelId);

        if (channel) {
          const startDate = new Date(post.createdAt);
          const endDate = new Date(startDate);
          endDate.setMinutes(startDate.getMinutes() + 30);

          calendarEvents.push({
            id: `${post._id}-${channelId}`,
            title: post.text.length > 30 ? post.text.substring(0, 30) + "..." : post.text,
            start: startDate,
            end: endDate,
            post,
            channelId,
            channelType: channel.type,
          });
        }
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
        opacity: 0.8,
        color: "black",
        border: "1px solid lightgray",
        display: "block",
        width: "100%",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontSize: "clamp(0.65rem, 1vw, 0.75rem)", // Responsive font size
      },
    };
  }, []);

  const toggleDateExpansion = (dateStr: string) => {
    setExpandedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr],
    );
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const channel = channels.find(
      (c) => c.id === event.channelId || c.channelId === event.channelId,
    );
    const timeStr = format(event.post.createdAt, "hh:mm a");

    const PostContent = () => (
      <GridPostCard
        key={`${event.post._id}-${channel.id}`}
        platform={channel.type}
        profileImage={channel.profileImage}
        username={channel.username || channel.id}
        displayName={channel.name}
        date={event.post.createdAt}
        content={event.post.text || ""}
        imageUrl={event.post.media && event.post.media.length > 0 ? event.post.media[0] : ""}
        likes={0}
        retweets={0}
        comments={0}
        impressions={0}
        engagementRate={0}
        clicks={0}
        createdDaysAgo={0}
        isCustom={event.post.postType === "schedule"}
      />
    );

    return isMobile ? (
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer w-full">
            {channel && (
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-1 sm:gap-2 items-center">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={channel.profileImage}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="text-[10px] sm:text-xs font-medium">{timeStr}</p>
                </div>

                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={event.post.media && event.post.media.length > 0 ? event.post.media[0] : ""}
                    alt={channel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="w-[90vw] md:w-96 p-0.5">
          <PostContent />
        </DialogContent>
      </Dialog>
    ) : (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-1 cursor-pointer w-full">
            {channel && (
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-1 sm:gap-2 items-center">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={channel.profileImage}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="text-[10px] sm:text-xs font-medium">{timeStr}</p>
                </div>

                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={event.post.media && event.post.media.length > 0 ? event.post.media[0] : ""}
                    alt={channel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent side="right" align="start" className="w-[90vw] sm:w-96 p-0.5">
          <PostContent />
        </PopoverContent>
      </Popover>
    );
  };

  const DateCellWrapper = ({ children, value }: any) => {
    const dateStr = format(value, "yyyy-MM-dd");
    const postsForDate = events.filter((event) => format(event.start, "yyyy-MM-dd") === dateStr);
    const displayEvents = expandedDates.includes(dateStr) ? postsForDate : postsForDate.slice(0, 3);
    const remainingCount = postsForDate.length - 3;

    // Check if the date is current or future
    const today = startOfDay(new Date());
    const cellDate = startOfDay(new Date(value));
    const isCurrentOrFuture = !isBefore(cellDate, today);

    const handleAddPost = (date: Date) => {
      setSelectedDate(date);
      setIsCreateModalOpen(true);
    };

    return (
      <div className="relative group w-full h-full flex flex-col">
        <div className="flex-shrink-0 text-xs sm:text-sm">{children}</div>

        {isCurrentOrFuture && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 sm:right-1 bottom-0 sm:bottom-1 hidden group-hover:flex h-4 w-4 sm:h-6 sm:w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAddPost(value);
            }}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="p-1 sm:p-2 h-[calc(100vh-12rem)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month"]}
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            dateCellWrapper: DateCellWrapper,
          }}
          popup
          className="text-xs sm:text-sm"
        />
      </Card>

      {/* Popover for selected event */}
      {selectedEvent && (
        <Popover open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <PopoverContent
            side="right"
            align="start"
            className="w-[90vw] sm:w-96 p-2"
            sideOffset={5}
          >
            {(() => {
              const channel = channels.find(
                (c) => c.id === selectedEvent.channelId || c.channelId === selectedEvent.channelId,
              );
              if (!channel || !selectedEvent.post) return null;

              return (
                <GridPostCard
                  platform={channel.type}
                  profileImage={channel.profileImage}
                  username={channel.username || channel.id}
                  displayName={channel.name}
                  date={selectedEvent.post.createdAt}
                  content={selectedEvent.post.text || ""}
                  imageUrl={
                    selectedEvent.post.media && selectedEvent.post.media.length > 0
                      ? selectedEvent.post.media[0]
                      : ""
                  }
                  likes={0}
                  retweets={0}
                  comments={0}
                  impressions={0}
                  engagementRate={0}
                  clicks={0}
                  createdDaysAgo={
                    selectedEvent.post.createdAt
                      ? differenceInDays(new Date(), new Date(selectedEvent.post.createdAt))
                      : 0
                  }
                  isCustom={selectedEvent.post.postType === "schedule"}
                />
              );
            })()}
          </PopoverContent>
        </Popover>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        // initialDate={selectedDate}
      />
    </>
  );
};

export default PostCalendarView;
