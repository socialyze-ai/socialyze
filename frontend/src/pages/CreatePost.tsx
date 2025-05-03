import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Info, Unlink, MoveRight } from "lucide-react";
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
  setIsAIAssistantOpen,
  selectSelectedChannels,
  selectActiveChannel,
  selectContentByChannel,
  selectMediaByChannel,
  selectIsContentSynced,
  selectIsCustomContent,
  setContentSyncState,
  syncContentAcrossChannels,
  setMediaForChannel,
  syncMediaAcrossChannels,
  initializeChannelContent,
} from "@/redux/slices/postCreation.slice";
import AIAssistantPanel from "@/components/post/aiAssistant/AIAssistantPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Media } from "@/components/post/MediaUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LabelSelector from "@/components/post/LabelSelector";
import { selectSelectedLabels, unselectAllLabels } from "@/redux/slices/labelManager.slice";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddPost } from "@/api/apiHooks/usePost";
import { addPost, selectChannels } from "@/redux/slices/posts.slice";

const CreatePost = () => {
  const channels = useSelector(selectChannels);
  const dispatch = useDispatch();
  const postCreation = useSelector(selectPostCreation);
  const selectedChannels = useSelector(selectSelectedChannels);
  const activeChannel = useSelector(selectActiveChannel);
  const contentByChannel = useSelector(selectContentByChannel);
  const mediaByChannel = useSelector(selectMediaByChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const isCustomContent = useSelector(selectIsCustomContent);
  const selectedLabels = useSelector(selectSelectedLabels);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSyncAlertOpen, setIsSyncAlertOpen] = React.useState(false);

  const { mutate: addPostMutation, isPending: isAddPostPending } = useAddPost();

  // Initialize content by channel when component mounts
  useEffect(() => {
    if (channels.length > 0) {
      dispatch(initializeChannelContent(channels.map((channel) => channel.id)));
    }
  }, [channels, dispatch]);

  const handleChannelToggle = (channelId: string) => {
    dispatch(toggleChannelSelection(channelId));
  };

  const handleContentChange = (channelId: string, content: string) => {
    if (isContentSynced) {
      // Use the synchronization action for synced mode
      dispatch(syncContentAcrossChannels({ sourceChannelId: channelId, content }));
    } else {
      // Just update the specific channel in unsynced mode
      dispatch(setContentForChannel({ channelId, content }));
    }
  };

  const handleMediaChange = (channelId: string, media: Media[]) => {
    // Always update the specific channel's media
    dispatch(setMediaForChannel({ channelId, media }));

    // If in synced mode, update the global media state
    if (isContentSynced) {
      dispatch(
        syncMediaAcrossChannels({
          sourceChannelId: channelId,
          media,
        }),
      );
    }
    // In unsynced mode, if this is the active channel, also update the display state
    else if (channelId === activeChannel) {
      // Update the mediaUrls state for display purposes only
      // This doesn't propagate to other channels in unsynced mode
      dispatch(setMediaUrls(media));
    }
  };

  const handleToggleContentSync = () => {
    if (isCustomContent) {
      // User wants to sync content (currently unsynced)
      setIsSyncAlertOpen(true);
    } else {
      // User wants to unsync content (currently synced)
      dispatch(setContentSyncState(false));
    }
  };

  const handleConfirmSync = () => {
    dispatch(setContentSyncState(true));
    setIsSyncAlertOpen(false);
  };

  const combineDateTime = () => {
    if (!postCreation.scheduledDate) return undefined;

    const [hours, minutes] = postCreation.scheduledTime.split(":").map(Number);
    const scheduledDate = new Date(postCreation.scheduledDate);
    scheduledDate.setHours(hours, minutes);

    return scheduledDate;
  };

  const handleSubmit = (isDraft: boolean = false) => {
    if (
      selectedChannels.length === 0 ||
      Object.values(contentByChannel).every((content) => content.trim() === "")
    ) {
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

    const finalData = [];

    selectedChannels.forEach((channelId) => {
      const content = contentByChannel[channelId] || "";
      const hasContent = content.trim() !== "" || postCreation.hashtags.length > 0;
      const mediaUrls = mediaByChannel[channelId]?.map((media) => media.url) || [];

      if (!hasContent && mediaUrls.length === 0) {
        toast({
          title: "Content required",
          description: "Please enter some content, hashtags, or add an image for your post.",
          variant: "destructive",
        });
        return;
      }

      const finalContent = addHashtagsToContent(content, postCreation.hashtags);

      const postData = {
        channelId: channelId,
        text: finalContent?.includes("<br>")
          ? finalContent.replace(/<br>/g, "")
          : finalContent || "",
        scheduledTime: scheduledAt,
        label: selectedLabels.map((label) => label.id),
        media: mediaUrls,
        postType: isDraft ? "draft" : postCreation.isScheduled ? "schedule" : "postnow",
        postStatus: "queued",
      };

      finalData.push(postData);

      dispatch(
        addPost({
          content: finalContent,
          channels: [channelId],
          scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
          mediaUrls,
          status: isDraft ? "draft" : postCreation.isScheduled ? "schedule" : "postnow",
        }),
      );
    });

    handleCreatePostApiCall(finalData, isDraft, scheduledAt, selectedChannels);
  };

  const handleCreatePostApiCall = (
    finalData: any,
    isDraft: boolean,
    scheduledAt: Date,
    selectedChannels: string[],
  ) => {
    if (selectedChannels?.length !== finalData?.length) return;

    addPostMutation(finalData, {
      onSuccess: () => {
        const statusText = isDraft
          ? "saved as draft"
          : postCreation.isScheduled
          ? "scheduled"
          : "sent";

        toast({
          title: isDraft
            ? "Draft saved"
            : postCreation.isScheduled
            ? "Post scheduled"
            : "Post sent",
          description:
            postCreation.isScheduled && scheduledAt
              ? `Your post has been scheduled for ${format(scheduledAt, "PPP p")}.`
              : `Your post has been ${statusText}.`,
        });

        dispatch(unselectAllLabels());

        navigate("/dashboard");
        dispatch(resetPostCreation());
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add post",
          variant: "destructive",
        });
      },
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setScheduledTime(e.target.value));
  };

  const handleScheduleFromModal = (scheduledAt: Date, channelIds: string[]) => {
    if (channelIds.length === 0) {
      toast({
        title: "Channel selection required",
        description: "Please select at least one channel for your post.",
        variant: "destructive",
      });
      return;
    }

    const finalData = [];

    channelIds.forEach((channelId) => {
      const content = contentByChannel[channelId] || "";
      const hasContent = content.trim() !== "" || postCreation.hashtags.length > 0;
      const mediaUrls = mediaByChannel[channelId]?.map((media) => media.url) || [];

      if (!hasContent && mediaUrls.length === 0) {
        toast({
          title: "Content required",
          description: "Please enter some content, hashtags, or add an image for your post.",
          variant: "destructive",
        });
        return;
      }

      const finalContent = addHashtagsToContent(content, postCreation.hashtags);

      const postData = {
        channelId: channelId,
        text: finalContent?.includes("<br>")
          ? finalContent.replace(/<br>/g, "")
          : finalContent || "",
        scheduledTime: scheduledAt,
        label: selectedLabels.map((label) => label.id),
        media: mediaUrls,
        postType: "schedule",
        postStatus: "queued",
      };

      finalData.push(postData);

      dispatch(
        addPost({
          content: finalContent,
          channels: [channelId],
          scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
          mediaUrls,
          status: "schedule",
        }),
      );
    });

    handleCreatePostApiCall(finalData, false, scheduledAt, channelIds);

    toast({
      title: "Post scheduled",
      description: `Your post has been scheduled for ${format(scheduledAt, "PPP p")}.`,
    });

    navigate("/dashboard");
    dispatch(resetPostCreation());
  };

  const getSocialIcon = (type: string, size: number = 24) => {
    switch (type) {
      case "facebook":
        return <Facebook size={size} className="text-[#1877F2]" />;
      case "twitter":
        return <Twitter size={size} className="text-[#1DA1F2]" />;
      case "instagram":
        return <Instagram size={size} className="text-[#E4405F]" />;
      case "linkedin":
        return <Linkedin size={size} className="text-[#0A66C2]" />;
      case "youtube":
        return <Youtube size={size} className="text-[#FF0000]" />;
      default:
        return <X size={size} className="text-[#1DA1F2]" />;
    }
  };

  const getChannelById = (id: string) => {
    return channels.find((c) => c.id === id);
  };

  return (
    <MainLayout title="Create Post">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-y-scroll lg:overflow-hidden">
        {/* Left column - Post composer */}
        <div className="flex flex-col gap-5 p-1 md:col-span-7 h-fit lg:h-full lg:overflow-y-scroll">
          <div className="flex gap-2 md:flex-row flex-col-reverse justify-between">
            <div className="flex gap-3 flex-wrap">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  className={`relative rounded-full p-1.5 ${
                    selectedChannels.includes(channel.id)
                      ? "shadow shadow-blue-500"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => handleChannelToggle(channel.id)}
                >
                  <Avatar className="w-10 h-10 rounded-full">
                    <AvatarImage src={channel.profileImage} />
                    <AvatarFallback className="capitalize font-semibold text-xl">
                      {channel.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute bottom-1.5 -right-1 rounded-full overflow-hidden border border-gray-200 w-5 h-5 flex items-center justify-center bg-white z-50",
                      selectedChannels.includes(channel.id) && "shadow-blue-500",
                    )}
                  >
                    {getSocialIcon(channel.type, 16)}
                  </div>
                </button>
              ))}
            </div>
            <div className="self-end md:self-start">
              <LabelSelector />
            </div>
          </div>

          {isCustomContent ? (
            <div className="space-y-2">
              {selectedChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select channels to create your post
                </div>
              ) : (
                selectedChannels.map((channelId) => {
                  const channel = getChannelById(channelId);
                  if (!channel) return null;

                  return (
                    <Accordion type="single" key={channelId} collapsible>
                      <AccordionItem value={channelId}>
                        <AccordionTrigger
                          className={`border rounded-md p-1.5 px-2 transition-all ${
                            channelId === activeChannel
                              ? "ring-1 ring-blue-500"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => dispatch(setActiveChannel(channelId))}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <span className="mr-2">{getSocialIcon(channel.type, 16)}</span>
                              <span className="font-medium">
                                {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}{" "}
                                {channel.username ? `- ${channel.username}` : ""}
                              </span>
                            </div>

                            {channelId === activeChannel && (
                              <Badge className="mx-2 bg-blue-500">Active</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        {channelId === activeChannel && (
                          <AccordionContent>
                            <div className="w-full">
                              <PostComposer
                                content={contentByChannel[channelId] || ""}
                                onContentChange={(content) =>
                                  handleContentChange(channelId, content)
                                }
                                hashtags={postCreation.hashtags}
                                onHashtagsChange={(hashtags) => dispatch(setHashtags(hashtags))}
                                channelMedia={mediaByChannel[channelId]}
                                onMediaUrlsChange={(media) => {
                                  handleMediaChange(channelId, media);
                                }}
                                className="shadow-none border-none p-0"
                                channelId={channelId}
                              />
                            </div>
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    </Accordion>
                  );
                })
              )}
            </div>
          ) : (
            <PostComposer
              content={postCreation.content}
              onContentChange={(content) => {
                dispatch(setContent(content));
              }}
              hashtags={postCreation.hashtags}
              onHashtagsChange={(hashtags) => dispatch(setHashtags(hashtags))}
              onMediaUrlsChange={(urls) => dispatch(setMediaUrls(urls))}
              channelId={activeChannel}
            />
          )}

          {postCreation.isAIAssistantOpen && <AIAssistantPanel />}

          {selectedChannels.length > 0 && (
            <Button
              onClick={handleToggleContentSync}
              className="w-fit self-end text-sm flex justify-center items-center gap-2 ring-1 ring-blue-600"
              variant="outline"
            >
              {isCustomContent ? (
                <>
                  Sync content
                  <Unlink />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs w-64 h-fit text-wrap p-2 rounded-md bg-white">
                        Sync content across all selected channels
                        <br />
                        Note: first channel content will be consider for syncing content
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              ) : (
                <>
                  Customize for each network
                  <MoveRight />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right column - Preview and controls */}
        <div className="md:col-span-5 h-fit lg:h-full lg:overflow-y-scroll flex flex-col gap-3">
          {selectedChannels.length > 0 && activeChannel && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Preview</h3>
                  <select
                    value={activeChannel}
                    onChange={(e) => dispatch(setActiveChannel(e.target.value))}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    {selectedChannels.map((channelId) => {
                      const channel = getChannelById(channelId);
                      return channel ? (
                        <option key={channel.id} value={channel.id}>
                          {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                          {channel.username ? ` - ${channel.username}` : ""}
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>
                {activeChannel && getChannelById(activeChannel) && (
                  <PostPreviewPanel
                    content={contentByChannel[activeChannel] || ""}
                    selectedChannels={[activeChannel]}
                    channels={channels}
                    isPage
                  />
                )}
              </CardContent>
            </Card>
          )}

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
                <div className="mt-4">
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
        content=""
      />

      {/* Alert Dialog for Sync Confirmation */}
      <AlertDialog open={isSyncAlertOpen} onOpenChange={setIsSyncAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Content</AlertDialogTitle>
            <AlertDialogDescription>
              Sync content across all selected channels
              <br />
              Note: first channel content will be considered for syncing content
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSync}>Sync</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default CreatePost;
