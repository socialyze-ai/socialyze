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
  Facebook,
  Info,
  Instagram,
  Linkedin,
  MoveRight,
  Save,
  Twitter,
  Unlink,
  Wand2,
  X,
  Youtube,
} from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PostPreview from "./PostPreview";
import ScheduleModal from "./ScheduleModal";
import HashtagInput from "./HashtagInput";
import { addHashtagsToContent } from "@/utils/formatContent";
import { SocialChannel } from "@/context/PostsContext";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPostCreation,
  selectSelectedChannels,
  selectActiveChannel,
  selectContentByChannel,
  selectMediaByChannel,
  selectIsContentSynced,
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
import TagSelector from "./TagSelector";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";
import ImageEditor from "./editor/ImageEditor";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { channels, addPost } = usePosts();
  const dispatch = useDispatch();
  const postCreation = useSelector(selectPostCreation);
  const selectedChannels = useSelector(selectSelectedChannels);
  const activeChannel = useSelector(selectActiveChannel);
  const contentByChannel = useSelector(selectContentByChannel);
  const mediaByChannel = useSelector(selectMediaByChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCustomContent, setIsCustomContent] = useState(!isContentSynced);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isSyncAlertOpen, setIsSyncAlertOpen] = useState(false);

  // Initialize content by channel when modal opens
  useEffect(() => {
    if (channels.length > 0) {
      dispatch(initializeChannelContent(channels.map((channel) => channel.id)));
    }
  }, [channels, dispatch]);

  // Update isCustomContent when isContentSynced changes
  useEffect(() => {
    setIsCustomContent(!isContentSynced);
  }, [isContentSynced]);

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

    submitPost(channels, "scheduled", scheduledAt);
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

    submitPost(selectedChannels, "sent");
  };

  const handleDraftSave = () => {
    const channelsToUse = selectedChannels.length > 0 ? selectedChannels : [channels[0].id];

    submitPost(channelsToUse, "draft");
  };

  const submitPost = (
    channelIds: string[],
    status: "sent" | "scheduled" | "draft",
    scheduledAt?: Date,
  ) => {
    channelIds.forEach((channelId) => {
      const content = contentByChannel[channelId] || "";
      const finalContent = addHashtagsToContent(content, postCreation.hashtags);
      const mediaUrls = mediaByChannel[channelId]?.map((media) => media.url) || [];

      addPost({
        content: finalContent,
        channels: [channelId],
        mediaUrls: mediaUrls,
        status,
        scheduledAt,
      });
    });

    const statusText =
      status === "sent" ? "sent" : status === "scheduled" ? "scheduled" : "saved as draft";

    toast({
      title:
        status === "sent" ? "Post sent" : status === "scheduled" ? "Post scheduled" : "Draft saved",
      description: `Your post has been ${statusText}.`,
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    dispatch(resetPostCreation());
  };

  const handleOpenAdvanced = () => {
    onClose();
    resetForm();
    navigate("/create");
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
      const updatedChannelMedia = channelMedia.map((media) =>
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            "max-h-[90vh] flex gap-4 bg-transparent border-none p-0",
            postCreation.isAIAssistantOpen && selectedChannels.length === 0
              ? "max-w-[60dvw]"
              : postCreation.isAIAssistantOpen && selectedChannels.length !== 0
              ? "max-w-[90dvw]"
              : selectedChannels.length !== 0 && activeChannel
              ? "max-w-[60dvw]"
              : "flex-1",
          )}
        >
          {postCreation.isAIAssistantOpen && (
            <div
              className={cn(
                "h-full overflow-y-auto max-h-[90vh]",
                selectedChannels.length === 0 && !activeChannel ? "w-[40%]" : "w-[30%]",
              )}
            >
              <AIAssistantPanel />
            </div>
          )}

          <div
            className={cn(
              "overflow-y-scroll bg-white p-5 rounded h-full max-h-[90vh]",
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

                  <TagSelector />
                </div>
                <DialogDescription>
                  Create and schedule posts for your social media channels
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex justify-between items-center my-4">
              <div className="flex gap-2 flex-wrap">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    className={`rounded-full p-1.5 ${
                      selectedChannels.includes(channel.id)
                        ? "ring-2 ring-primary"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => handleChannelToggle(channel.id)}
                  >
                    <div className="rounded-full overflow-hidden border border-gray-200 w-10 h-10 flex items-center justify-center bg-white">
                      {getSocialIcon(channel.type)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isCustomContent ? (
              <>
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
                        <div
                          key={channelId}
                          className={`border rounded-md p-3 mb-2 transition-all ${
                            channelId === activeChannel
                              ? "ring-2 ring-blue-500"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => dispatch(setActiveChannel(channelId))}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="mr-2">{getSocialIcon(channel.type, 16)}</span>
                              <span className="capitalize font-medium">
                                {channel.type} {channel.name ? `- ${channel.name}` : ""}
                              </span>
                              {channelId === activeChannel && (
                                <Badge className="ml-2 bg-blue-500">Active</Badge>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {/* Post type selector */}
                              {(channel.type === "instagram" || channel.type === "facebook") && (
                                <div className="flex items-center">
                                  <select
                                    className="text-xs border rounded p-1"
                                    value={postCreation.postTypeByChannel[channelId] || "post"}
                                    onChange={(e) =>
                                      handlePostTypeChange(
                                        channelId,
                                        e.target.value as "post" | "reel" | "story",
                                      )
                                    }
                                  >
                                    <option value="post">Post</option>
                                    <option value="story">Story</option>
                                    <option value="reel">Reel</option>
                                  </select>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info size={16} className="ml-1 text-gray-500" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Select the type of {channel.type} post
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Using PostComposer instead of ChannelPostInput */}
                          <div className="w-full">
                            {/* Show media from this channel if any */}
                            {/* {mediaByChannel[channelId] && mediaByChannel[channelId].length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                  {mediaByChannel[channelId].map((media) => (
                                    <div key={media.id} className="relative">
                                      {media.type === "video" ? (
                                        <video
                                          src={media.url}
                                          className="h-20 w-20 rounded object-cover"
                                          controls
                                        />
                                      ) : (
                                        <img
                                          src={media.url}
                                          alt=""
                                          className="h-20 w-20 rounded object-cover"
                                        />
                                      )}
                                      <button
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const updatedMedia = mediaByChannel[channelId].filter(
                                            (m) => m.id !== media.id,
                                          );
                                          handleMediaChange(channelId, updatedMedia);
                                        }}
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )} */}

                            <PostComposer
                              isPostModal
                              content={contentByChannel[channelId] || ""}
                              onContentChange={(content) => handleContentChange(channelId, content)}
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
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="lg:col-span-7 mb-3">
                {/* Display media in synced mode */}
                {/* {postCreation.mediaUrls.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {postCreation.mediaUrls.map((media) => (
                        <div key={media.id} className="relative">
                          {media.type === "video" ? (
                            <video
                              src={media.url}
                              className="h-20 w-20 rounded object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt=""
                              className="h-20 w-20 rounded object-cover"
                            />
                          )}
                          <button
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={() => {
                              const updatedMedia = postCreation.mediaUrls.filter(
                                (m) => m.id !== media.id,
                              );
                              dispatch(setMediaUrls(updatedMedia));
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

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

            {selectedChannels.length !== 0 && activeChannel && (
              <div className="flex justify-between mt-2">
                <Button
                  onClick={handleToggleContentSync}
                  className="text-sm flex justify-center items-center gap-2 ring-1 ring-blue-600"
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

                <div className="flex gap-2">
                  <Button onClick={handleDraftSave} variant="outline" size="icon">
                    <Save />
                  </Button>

                  <Button
                    onClick={() => dispatch(setScheduleModalOpen(true))}
                    variant="outline"
                    size="icon"
                  >
                    <CalendarCheck2 />
                  </Button>

                  <Button onClick={handlePostNow} className="bg-blue-600 hover:bg-blue-700">
                    Post
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {selectedChannels.length !== 0 && activeChannel && (
            <div
              className={cn(
                "border-l pl-4 hidden md:block bg-white p-5 rounded h-full max-h-[90vh] overflow-y-scroll",
                postCreation.isAIAssistantOpen ? "w-[30%] max-w-[30%]" : "w-[40%] max-w-[40%]",
              )}
            >
              <div className="flex justify-between mb-2 w-full">
                <select
                  value={activeChannel}
                  onChange={(e) => dispatch(setActiveChannel(e.target.value))}
                  className="border border-gray-300 rounded-md p-2 w-full mt-5"
                >
                  {selectedChannels.map((channelId) => {
                    const channel = getChannelById(channelId);
                    return channel ? (
                      <option key={channel.id} value={channel.id}>
                        {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
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

              <div className="h-full">
                {activeChannel && getChannelById(activeChannel) && (
                  <PostPreview
                    content={contentByChannel[activeChannel] || ""}
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
    </>
  );
};

export default CreatePostModal;
