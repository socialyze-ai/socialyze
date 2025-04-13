import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePosts } from "@/context/PostsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ScheduleModal from "@/components/post/ScheduleModal";
import { addHashtagsToContent } from "@/utils/formatContent";
import PostComposer from "@/components/post/PostComposer";
import PostPreviewPanel from "@/components/post/PostPreviewPanel";
import ChannelSelector from "@/components/post/ChannelSelector";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPostCreation,
  setContent,
  setHashtags,
  toggleChannelSelection,
  setActiveChannel,
  setIsScheduled,
  setScheduledDate,
  setScheduledTime,
  setScheduleModalOpen,
  resetPostCreation,
  setContentForChannel,
  setMediaUrls,
} from "@/redux/slices/postCreation.slice";

const CreatePost = () => {
  const { channels, addPost } = usePosts();
  const dispatch = useDispatch();
  const postCreation = useSelector(selectPostCreation);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChannelToggle = (channelId: string) => {
    dispatch(toggleChannelSelection(channelId));
  };

  const combineDateTime = () => {
    if (!postCreation.scheduledDate) return undefined;

    const [hours, minutes] = postCreation.scheduledTime.split(":").map(Number);
    const scheduledDate = new Date(postCreation.scheduledDate);
    scheduledDate.setHours(hours, minutes);

    return scheduledDate;
  };

  const handleSubmit = (isDraft: boolean = false) => {
    if (postCreation.content.trim() === "" && postCreation.hashtags.length === 0) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (postCreation.selectedChannels.length === 0) {
      toast({
        title: "Channel selection required",
        description: "Please select at least one channel for your post.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = postCreation.isScheduled ? combineDateTime() : undefined;

    if (postCreation.isScheduled && !scheduledAt) {
      toast({
        title: "Schedule time required",
        description: "Please select a date and time to schedule your post.",
        variant: "destructive",
      });
      return;
    }

    const finalContent = addHashtagsToContent(postCreation.content, postCreation.hashtags);

    addPost({
      content: finalContent,
      channels: postCreation.selectedChannels,
      scheduledAt,
      mediaUrls: postCreation.mediaUrls.map((media) => media.url),
      status: isDraft ? "draft" : postCreation.isScheduled ? "scheduled" : "sent",
    });

    toast({
      title: isDraft ? "Draft saved" : postCreation.isScheduled ? "Post scheduled" : "Post sent",
      description: isDraft
        ? "Your draft has been saved."
        : postCreation.isScheduled
        ? `Your post has been scheduled for ${format(scheduledAt!, "PPP p")}.`
        : "Your post has been sent to the selected channels.",
    });

    navigate("/dashboard");
    dispatch(resetPostCreation());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setScheduledTime(e.target.value));
  };

  const handleScheduleFromModal = (scheduledAt: Date, channelIds: string[]) => {
    const finalContent = addHashtagsToContent(postCreation.content, postCreation.hashtags);

    addPost({
      content: finalContent,
      channels: channelIds,
      scheduledAt,
      mediaUrls: postCreation.mediaUrls.map((media) => media.url),
      status: "scheduled",
    });

    toast({
      title: "Post scheduled",
      description: `Your post has been scheduled for ${format(scheduledAt, "PPP p")}.`,
    });

    navigate("/dashboard");
    dispatch(resetPostCreation());
  };

  const finalContent = addHashtagsToContent(postCreation.content, postCreation.hashtags);

  return (
    <MainLayout title="Create Post">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Post composer */}
        <div className="lg:col-span-7">
          <PostComposer
            content={postCreation.content}
            onContentChange={(content) => {
              dispatch(setContent(content));

              // Also update content for all selected channels
              postCreation.selectedChannels.forEach((channelId) => {
                dispatch(setContentForChannel({ channelId, content }));
              });
            }}
            hashtags={postCreation.hashtags}
            onHashtagsChange={(hashtags) => dispatch(setHashtags(hashtags))}
            onMediaUrlsChange={(urls) => dispatch(setMediaUrls(urls))}
          />
        </div>

        {/* Right   column - Preview and controls */}
        <div className="lg:col-span-5 space-y-6">
          <ChannelSelector
            channels={channels}
            selectedChannels={postCreation.selectedChannels}
            onChannelToggle={handleChannelToggle}
            content={finalContent}
          />

          <PostPreviewPanel
            content={postCreation.content}
            // hashtags={postCreation.hashtags}
            selectedChannels={postCreation.selectedChannels}
            channels={channels}
          />

          {/* Scheduler */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Schedule</h3>
                <Checkbox
                  id="schedule-toggle"
                  checked={postCreation.isScheduled}
                  onCheckedChange={(checked) => dispatch(setIsScheduled(checked as boolean))}
                />
              </div>

              {postCreation.isScheduled && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !postCreation.scheduledDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {postCreation.scheduledDate
                            ? format(postCreation.scheduledDate, "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={postCreation.scheduledDate}
                          onSelect={(date) => dispatch(setScheduledDate(date))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Time</Label>
                    <input
                      id="time"
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={postCreation.scheduledTime}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-5">
            {/* <Button
              variant="outline"
              onClick={() => dispatch(setScheduleModalOpen(true))}
              className="flex items-center space-x-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Open Calendar</span>
            </Button> */}

            <Button variant="outline" onClick={() => handleSubmit(true)}>
              Save as Draft
            </Button>

            {postCreation.isScheduled ? (
              <Button onClick={() => handleSubmit(false)}>Schedule Post</Button>
            ) : (
              <Button onClick={() => handleSubmit(false)}>Post Now</Button>
            )}
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={postCreation.isScheduleModalOpen}
        onClose={() => dispatch(setScheduleModalOpen(false))}
        selectedDate={postCreation.scheduledDate || new Date()}
        onSchedule={handleScheduleFromModal}
        content={addHashtagsToContent(postCreation.content, postCreation.hashtags)}
      />
    </MainLayout>
  );
};

export default CreatePost;
