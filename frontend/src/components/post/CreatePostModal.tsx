import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  CalendarCheck2,
  ChevronRight,
  Facebook,
  Info,
  Instagram,
  Linkedin,
  MoveRight,
  Plus,
  Save,
  Twitter,
  Unlink,
  Wand2,
  X,
  Youtube,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PostPreview from "./PostPreview";
import ScheduleModal from "./ScheduleModal";
import HashtagInput from "./HashtagInput";
import { addHashtagsToContent } from "@/utils/formatContent";
import { useDispatch, useSelector } from "react-redux";
import { SocialChannel, addPost, selectChannels } from "@/redux/slices/posts.slice";
import {
  selectPostCreation,
  selectSelectedChannels,
  selectActiveChannel,
  selectContentByChannel,
  selectMediaByChannel,
  selectIsContentSynced,
  selectIsCustomContent,
  setContentForChannel,
  setMediaForChannel,
  setMediaUrls,
  setPostTypeForChannel,
  toggleChannelSelection,
  setActiveChannel,
  setHashtags,
  resetPostCreation,
  initializeChannelContent,
  syncContentAcrossChannels,
  setContent,
  setScheduleModalOpen,
  setContentSyncState,
  syncMediaAcrossChannels,
} from "@/redux/slices/postCreation.slice";
import { Media } from "./MediaUploader";
import PostComposer from "./PostComposer";
import { cn } from "@/lib/utils";
import AIAssistantPanel from "./aiAssistant/AIAssistantPanel";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import ImageEditor from "./editor/ImageEditor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { selectSelectedLabels, unselectAllLabels } from "@/redux/slices/labelManager.slice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAddPost } from "@/api/apiHooks/usePost";
import { format } from "date-fns";
import LabelSelector from "./LabelSelector";
import { reset } from "@/redux/slices/aiAssistant.slice";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const getSocialIcon = (type: string, size: number = 24) => {
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

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const channels = useSelector(selectChannels);
  const dispatch = useDispatch();
  const postCreation = useSelector(selectPostCreation);
  const selectedChannels = useSelector(selectSelectedChannels);
  const activeChannel = useSelector(selectActiveChannel);
  const contentByChannel = useSelector(selectContentByChannel);
  const mediaByChannel = useSelector(selectMediaByChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const isCustomContent = useSelector(selectIsCustomContent);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { mutate: addPostMutation, isPending: isAddPostPending } = useAddPost();
  const selectedLabels = useSelector(selectSelectedLabels);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isSyncAlertOpen, setIsSyncAlertOpen] = useState(false);
  const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false);

  // Initialize content by channel when modal opens
  useEffect(() => {
    if (channels.length > 0) {
      dispatch(initializeChannelContent(channels?.map((channel) => channel.id)));
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
    // The media array passed here is already the complete array including previous media
    // The child components (MediaUploader, etc.) are responsible for preserving existing media
    // by spreading the previous arrays and adding new media

    // Always update the specific channel's media
    dispatch(setMediaForChannel({ channelId, media }));

    // If in synced mode, update the global media state
    if (isContentSynced) {
      dispatch(setMediaUrls(media));
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

  const handlePostTypeChange = (channelId: string, type: "post" | "reel" | "story") => {
    dispatch(setPostTypeForChannel({ channelId, postType: type }));
  };

  const handleSchedule = (scheduledAt: Date, channels: string[]) => {
    if (channels.length === 0) {
      toast({
        title: "Channel selection required",
        description: "Please select at least one channel for your post.",
        variant: "destructive",
      });
      return;
    }

    const hasContent = channels.some(
      (channelId) => contentByChannel[channelId]?.trim() !== "" || postCreation.hashtags.length > 0,
    );

    if (
      !hasContent &&
      channels.some(
        (channelId) => !mediaByChannel[channelId] || mediaByChannel[channelId].length === 0,
      )
    ) {
      toast({
        title: "Content required",
        description: "Please enter some content, hashtags, or add an image for your post.",
        variant: "destructive",
      });
      return;
    }

    submitPost(channels, "schedule", scheduledAt);
  };

  const handlePostNow = () => {
    if (selectedChannels.length === 0) {
      toast({
        title: "Channel selection required",
        description: "Please select at least one channel for your post.",
        variant: "destructive",
      });
      return;
    }

    const hasContent = selectedChannels.some(
      (channelId) => contentByChannel[channelId]?.trim() !== "" || postCreation.hashtags.length > 0,
    );

    if (
      !hasContent &&
      selectedChannels.some(
        (channelId) => !mediaByChannel[channelId] || mediaByChannel[channelId].length === 0,
      )
    ) {
      toast({
        title: "Content required",
        description: "Please enter some content, hashtags, or add an image for your post.",
        variant: "destructive",
      });
      return;
    }

    submitPost(selectedChannels, "postnow");
  };

  const handleDraftSave = () => {
    const channelsToUse = selectedChannels.length > 0 ? selectedChannels : [channels[0].id];

    submitPost(channelsToUse, "draft");
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
        dispatch(reset());
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

  const submitPost = (
    channelIds: string[],
    status: "postnow" | "schedule" | "draft",
    scheduledAt?: Date,
  ) => {
    const finalData = [];

    channelIds.forEach((channelId) => {
      const content = contentByChannel[channelId] || "";
      const finalContent = addHashtagsToContent(content, postCreation.hashtags);
      const mediaUrls = mediaByChannel[channelId]?.map((media) => media.url) || [];
      const socialHandle = channels.find((channel) => channel.id === channelId)?.type;

      const postData = {
        channelId: channelId,
        text: finalContent?.includes("<br>")
          ? finalContent.replace(/<br>/g, "")
          : finalContent || "",
        scheduledTime: scheduledAt,
        label: selectedLabels?.map((label) => label.id),
        media: mediaUrls,
        postType: status, // "postnow" | "schedule" | "draft"
        postStatus: "queued",
        handle: socialHandle,
      };

      finalData.push(postData);

      dispatch(
        addPost({
          content: finalContent,
          channels: [channelId],
          mediaUrls: mediaUrls,
          status,
          scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
        }),
      );

      handleCreatePostApiCall(finalData, status === "draft", scheduledAt, channelIds);
    });

    console.log("finalData", finalData);

    const statusText =
      status === "postnow" ? "sent" : status === "schedule" ? "scheduled" : "saved as draft";

    toast({
      title:
        status === "postnow"
          ? "Post sent"
          : status === "schedule"
          ? "Post scheduled"
          : "Draft saved",
      description: `Your post has been ${statusText}.`,
    });

    onClose();
  };

  const resetForm = () => {
    dispatch(resetPostCreation());
  };

  const handleOpenAlert = () => {
    setIsCloseAlertOpen(true);
  };

  const handleClose = () => {
    // Check if there's content or media before closing
    const hasContent = selectedChannels.some(
      (channelId) =>
        contentByChannel[channelId]?.trim() !== "" ||
        (mediaByChannel[channelId] && mediaByChannel[channelId].length > 0),
    );

    if (hasContent) {
      setIsCloseAlertOpen(true);
    } else {
      onClose();
      resetForm();
      setIsCloseAlertOpen(false);
    }
  };

  const getChannelById = (id: string): SocialChannel | undefined => {
    return channels.find((c) => c.id === id);
  };

  const handleEditMedia = (media: Media) => {
    // Open edit dialog for specific media
    setSelectedMedia(media);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedMedia = (editedMediaUrl: string, selectedImage: Media) => {
    const editedMediaId = selectedImage?.id;

    if (activeChannel) {
      // Update media for the active channel
      const channelMedia = [...(mediaByChannel[activeChannel] || [])];
      const updatedChannelMedia = channelMedia?.map((media) =>
        media.id === editedMediaId ? { ...media, url: editedMediaUrl } : media,
      );
      dispatch(setMediaForChannel({ channelId: activeChannel, media: updatedChannelMedia }));

      // Update common media if in synced mode
      if (isContentSynced) {
        // In synced mode, we update all channels with the edited media
        dispatch(
          syncMediaAcrossChannels({
            sourceChannelId: activeChannel,
            media: updatedChannelMedia,
          }),
        );
      } else {
        // In unsynced mode, only update the display state for the UI
        // This doesn't affect other channels
        dispatch(setMediaUrls(updatedChannelMedia));
      }
    }

    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenAlert}>
        <DialogContent
          className={cn(
            "h-[90vh] flex gap-4 bg-transparent border-none p-1 pt-2",
            postCreation.isAIAssistantOpen && selectedChannels.length === 0
              ? "max-w-[60dvw]"
              : postCreation.isAIAssistantOpen && selectedChannels.length !== 0
              ? "max-w-[90dvw]"
              : selectedChannels.length !== 0 && activeChannel
              ? "max-w-[60dvw]"
              : "flex-1 h-fit",
          )}
        >
          {/* AI Assistant */}
          {postCreation.isAIAssistantOpen && (
            <div
              className={cn(
                "h-full overflow-y-auto",
                selectedChannels.length === 0 && !activeChannel ? "w-[40%]" : "w-[30%]",
              )}
            >
              <AIAssistantPanel />
            </div>
          )}

          {/* Post Composer */}
          <div
            className={cn(
              "overflow-y-scroll bg-white p-5 rounded h-full",
              postCreation.isAIAssistantOpen && selectedChannels.length === 0
                ? "w-[60%]"
                : postCreation.isAIAssistantOpen && selectedChannels.length !== 0
                ? "w-[40%]"
                : selectedChannels.length !== 0 && activeChannel
                ? "w-[60%]"
                : "flex-1",
            )}
          >
            <DialogHeader>
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full justify-between items-center">
                  <DialogTitle>Create Post</DialogTitle>

                  <LabelSelector />
                </div>
                <DialogDescription>
                  Create and schedule posts for your social media channels
                </DialogDescription>
              </div>
            </DialogHeader>

            {channels.length === 0 ? (
              <div
                className="flex items-center justify-between my-2 p-2 border border-gray-400 text-gray-600 text-sm rounded hover:bg-blue-600 hover:text-white hover:font-semibold hover:cursor-pointer"
                onClick={() => {
                  handleOpenAlert();
                  navigate("/channels");
                }}
              >
                <span>No channels available. Please add channels to create a post.</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full text-blue-500 w-6 h-6"
                >
                  <ChevronRight />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center my-4">
                <div className="flex gap-3 flex-wrap">
                  {channels?.map((channel) => {
                    console.log("selectedChannels", channel);

                    return (
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
                            "absolute bottom-1.5 -right-1 rounded-full overflow-hidden border border-gray-200 w-5 h-5 p-0.5 flex items-center justify-center bg-white z-50",
                            selectedChannels.includes(channel.id) && "shadow-blue-500",
                          )}
                        >
                          {getSocialIcon(channel.type, 16)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isCustomContent ? (
              <>
                <div className="space-y-2">
                  {selectedChannels.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Select channels to create your post
                    </div>
                  ) : (
                    selectedChannels?.map((channelId) => {
                      const channel = getChannelById(channelId);
                      if (!channel) return null;

                      return (
                        <Accordion type="single" key={channelId}>
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
                                    isPostModal
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
              </>
            ) : (
              <div className="lg:col-span-7 mb-3">
                <PostComposer
                  isPostModal
                  content={postCreation.content}
                  onContentChange={(content) => {
                    dispatch(setContent(content));
                  }}
                  hashtags={postCreation.hashtags}
                  onHashtagsChange={(hashtags) => dispatch(setHashtags(hashtags))}
                  onMediaUrlsChange={(urls) => dispatch(setMediaUrls(urls))}
                  channelId={activeChannel}
                />
              </div>
            )}

            <div className="flex justify-between mt-2">
              <Button
                onClick={handleToggleContentSync}
                className="text-sm flex justify-center items-center gap-2 ring-1 ring-blue-600"
                variant="outline"
                disabled={selectedChannels.length === 0 || !activeChannel}
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

              <div className="flex gap-2">
                <Button
                  onClick={handleDraftSave}
                  variant="outline"
                  size="icon"
                  disabled={selectedChannels.length === 0 || !activeChannel}
                >
                  <Save />
                </Button>

                <Button
                  onClick={() => dispatch(setScheduleModalOpen(true))}
                  variant="outline"
                  size="icon"
                  disabled={selectedChannels.length === 0 || !activeChannel}
                >
                  <CalendarCheck2 />
                </Button>

                <Button
                  onClick={handlePostNow}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={selectedChannels.length === 0 || !activeChannel}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {selectedChannels.length !== 0 && activeChannel && (
            <div
              className={cn(
                "border-l pl-4 hidden md:block bg-white p-5 rounded h-full overflow-y-scroll",
                postCreation.isAIAssistantOpen ? "w-[30%] max-w-[30%]" : "w-[40%] max-w-[40%]",
              )}
            >
              <div className="flex justify-between mb-2 w-full">
                <select
                  value={activeChannel}
                  onChange={(e) => dispatch(setActiveChannel(e.target.value))}
                  className="border border-gray-300 rounded-md p-2 w-full mt-5 text-sm"
                >
                  {selectedChannels?.map((channelId) => {
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

              <div className="mb-2 font-medium flex items-center">
                {activeChannel && getChannelById(activeChannel) && (
                  <>
                    {getSocialIcon(getChannelById(activeChannel)!.type, 16)}
                    <span className="ml-2">
                      {getChannelById(activeChannel)!.type.charAt(0).toUpperCase() +
                        getChannelById(activeChannel)!.type.slice(1)}{" "}
                      Preview
                    </span>
                  </>
                )}
              </div>

              <div className="h-fit">
                {activeChannel && getChannelById(activeChannel) && (
                  <PostPreview
                    content={
                      contentByChannel[activeChannel]?.includes("<br>")
                        ? contentByChannel[activeChannel].replace(/<br>/g, "")
                        : contentByChannel[activeChannel] || ""
                    }
                    channel={getChannelById(activeChannel)!}
                    mediaUrls={mediaByChannel[activeChannel]?.map((media) => media.url) || []}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ScheduleModal
        isOpen={postCreation.isScheduleModalOpen}
        onClose={() => dispatch(setScheduleModalOpen(false))}
        selectedDate={postCreation.scheduledDate || new Date()}
        onSchedule={handleSchedule}
        content=""
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          {activeChannel &&
            mediaByChannel[activeChannel] &&
            mediaByChannel[activeChannel].length > 0 && (
              <ImageEditor
                selectedImage={selectedMedia}
                onSave={handleSaveEditedMedia}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
        </DialogContent>
      </Dialog>

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

      {/* Alert Dialog for Close Confirmation */}
      <AlertDialog open={isCloseAlertOpen} onOpenChange={setIsCloseAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close? Your unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCloseAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClose();
                resetForm();
                dispatch(reset());
                setIsCloseAlertOpen(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreatePostModal;
