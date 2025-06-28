import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Link,
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
import { useNavigate } from "react-router-dom";
import PostPreview from "./PostPreview";
import DateTimeSelector from "./DateTimeSelector";
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
  setContentSyncState,
  syncMediaAcrossChannels,
  setIsCreateNewTemplate,
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
import { htmlToText } from "html-to-text";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import TemplatePanel from "./template/TemplatePanel";
import { RootState } from "@/redux/store";
import { setSocialPlatform } from "@/redux/slices/template.slice";
import { isUserAdmin } from "@/api/apiHooks/utils";
import {
  useCreatePostTemplatesCustom,
  useCreatePostTemplatesDefault,
} from "@/api/apiHooks/useTemplate";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export const getSocialIcon = (type: string, size: number = 24) => {
  switch (type) {
    case "facebook":
      return <Facebook size={size} className="text-[#1877F2]" />;
    case "x":
      return <X size={size} className="text-black" />;
    case "instagram":
      return <Instagram size={size} className="text-[#E4405F]" />;
    case "linkedin":
      return <Linkedin size={size} className="text-[#0A66C2]" />;
    case "youtube":
      return <Youtube size={size} className="text-[#FF0000]" />;
    default:
      return <X size={size} className="text-black" />;
  }
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const channels = useSelector(selectChannels);
  const dispatch = useDispatch();
  const postCreation = useSelector(selectPostCreation);
  const selectedChannels = useSelector(selectSelectedChannels);
  const activeChannel = useSelector(selectActiveChannel);
  const contentByChannel = useSelector(selectContentByChannel);
  const mediaByChannel = useSelector(selectMediaByChannel);
  const isContentSynced = useSelector(selectIsContentSynced);
  const isCustomContent = useSelector(selectIsCustomContent);
  const templateSocialPlatform = useSelector((state: RootState) => state.template.socialPlatform);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: addPostMutation, isPending: isAddPostPending } = useAddPost();
  const selectedLabels = useSelector(selectSelectedLabels);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isSyncAlertOpen, setIsSyncAlertOpen] = useState(false);
  const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : new Date(),
  );

  const { mutate: createTemplateDefault, isPending: isPendingDefault } =
    useCreatePostTemplatesDefault();
  const { mutate: createTemplateCustom, isPending: isPendingCustom } =
    useCreatePostTemplatesCustom();

  // Filter channels based on template social platform
  const filteredChannels = useMemo(() => {
    if (!templateSocialPlatform) {
      return channels;
    }
    return channels.filter((channel) => channel.type === templateSocialPlatform);
  }, [channels, templateSocialPlatform]);

  // Initialize content by channel when modal opens
  useEffect(() => {
    if (channels.length > 0) {
      dispatch(initializeChannelContent(channels?.map((channel) => channel.id)));
    }
  }, [channels, dispatch]);

  const handleChannelToggle = (channelId: string) => {
    const channel = getChannelById(channelId);

    // If we have a template social platform and this channel doesn't match, show a toast
    if (templateSocialPlatform && channel && channel.type !== templateSocialPlatform) {
      toast.error(`This template is only for ${templateSocialPlatform} posts`, {
        position: "top-center",
      });
      return;
    }

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

  const handleSchedule = () => {
    if (selectedChannels.length === 0) {
      toast.error("Channel selection required", {
        position: "top-center",
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
      toast.error("Content required", {
        position: "top-center",
      });
      return;
    }

    if (!scheduledDateTime || scheduledDateTime <= new Date()) {
      toast.error("Please select a future time.", {
        position: "top-center",
      });
      return;
    }

    submitPost(selectedChannels, "scheduled", scheduledDateTime);
    setIsScheduleMode(false);
  };

  const handlePostNow = (isSaveTemplate: boolean = false) => {
    if (selectedChannels.length === 0) {
      toast.error("Channel selection required", {
        position: "top-center",
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
      toast.error("Content required", {
        position: "top-center",
      });
      return;
    }

    submitPost(selectedChannels, "postnow", undefined, isSaveTemplate);
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
    isSaveTemplate?: boolean,
  ) => {
    if (selectedChannels?.length !== finalData?.length) return;

    if (isSaveTemplate) {
      if (postCreation.isCreateNewTemplate) {
        if (isUserAdmin()) {
          createTemplateDefault(
            {
              type: "default",
              postCategory: postCreation.selectedTemplateCategory?._id,
              body: finalData,
            },
            {
              onSuccess: () => {
                toast.success("Template saved successfully");
                dispatch(setContent(""));
                dispatch(setMediaUrls([]));
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to save template");
              },
            },
          );
        } else {
          createTemplateCustom(
            {
              type: "custom",
              postCategory: postCreation.selectedTemplateCategory?._id,
              body: finalData,
            },
            {
              onSuccess: (data) => {
                toast.success("Template saved successfully");
              },
              onError: (error: any) => {
                toast.error(error.message || `Failed to save template`);
              },
            },
          );
        }
      }
    } else {
      addPostMutation(finalData, {
        onSuccess: () => {
          const statusText = isDraft
            ? "saved as draft"
            : postCreation.isScheduled
            ? "scheduled"
            : "sent";

          toast(
            isDraft ? "Draft saved" : postCreation.isScheduled ? "Post scheduled" : "Post sent",
            {
              description:
                postCreation.isScheduled && scheduledAt
                  ? `Your post has been scheduled for ${format(scheduledAt, "PPP p")}.`
                  : `Your post has been ${statusText}.`,
              position: "top-center",
            },
          );

          queryClient.invalidateQueries({ queryKey: ["posts"] });
          queryClient.invalidateQueries({ queryKey: ["calendarPosts"] });

          dispatch(unselectAllLabels());

          navigate("/dashboard");
          dispatch(resetPostCreation());
          dispatch(reset());
          onClose();
        },
        onError: () => {
          toast.error("Failed to add post", {
            position: "top-center",
          });
        },
      });
    }
  };

  const submitPost = (
    channelIds: string[],
    status: "postnow" | "scheduled" | "draft",
    scheduledAt?: Date,
    isSaveTemplate?: boolean,
  ) => {
    const finalData = [];

    channelIds.forEach((channelId) => {
      const content = contentByChannel[channelId] || "";
      const finalContent = addHashtagsToContent(content, postCreation.hashtags);
      const mediaUrls = mediaByChannel[channelId]?.map((media) => media.url) || [];
      const socialHandle = channels.find((channel) => channel.id === channelId)?.type;

      console.log(
        "postCreation.selectedTemplateCategory----",
        postCreation.selectedTemplateCategory,
      );

      const postData = {
        channelId: channelId,
        text: finalContent?.includes("<br>")
          ? finalContent.replace(/<br>/g, "")
          : finalContent || "",
        scheduledTime: scheduledAt,
        label: selectedLabels?.map((label) => label.id),
        media: mediaUrls,
        postType: status, // "postnow" | "scheduled" | "draft"
        handle: socialHandle,
        isGrid: postCreation.selectedTemplateCategory?.name === "Grid" ? true : false,
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
    });

    handleCreatePostApiCall(finalData, status === "draft", scheduledAt, channelIds, isSaveTemplate);
  };

  const resetForm = () => {
    dispatch(resetPostCreation());
    dispatch(unselectAllLabels());
    dispatch(reset());
    dispatch(setSocialPlatform(null));
  };

  const handleOpenAlert = () => {
    setIsCloseAlertOpen(true);
  };

  const handleClose = () => {
    if (selectedChannels.length > 0 || postCreation.content || postCreation.mediaUrls.length > 0) {
      setIsCloseAlertOpen(true);
      return;
    }

    resetForm();
    onClose();
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

  const contentToUse = useMemo(() => {
    const removeBreakTags = contentByChannel[activeChannel]?.replace(/<br>/g, "");

    return htmlToText(removeBreakTags);
  }, [contentByChannel, activeChannel]);

  const isLeftPanelOpen = postCreation.isAIAssistantOpen || postCreation.isTemplateSectionOpen;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenAlert}>
        <DialogContent
          className={cn(
            "h-[90vh] flex gap-4 bg-transparent border-none p-1 pt-2",
            isLeftPanelOpen && selectedChannels.length === 0
              ? "max-w-[60dvw]"
              : isLeftPanelOpen && selectedChannels.length !== 0
              ? "max-w-[90dvw]"
              : selectedChannels.length !== 0 && activeChannel
              ? "max-w-[60dvw]"
              : "flex-1",
          )}
          id="create-post-modal-content"
        >
          {/* AI Assistant */}
          {isLeftPanelOpen && (
            <div
              className={cn(
                "h-full overflow-y-auto",
                selectedChannels.length === 0 && !activeChannel ? "w-[40%]" : "w-[30%]",
              )}
            >
              {postCreation.isAIAssistantOpen && <AIAssistantPanel />}

              {postCreation.isTemplateSectionOpen && <TemplatePanel />}
            </div>
          )}

          {/* Post Composer */}
          <div
            className={cn(
              "overflow-y-auto bg-white p-5 rounded h-full",
              isLeftPanelOpen && selectedChannels.length === 0
                ? "w-[60%]"
                : isLeftPanelOpen && selectedChannels.length !== 0
                ? "w-[40%]"
                : selectedChannels.length !== 0 && activeChannel
                ? "w-[60%]"
                : "flex-1",
            )}
          >
            <DialogHeader>
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full justify-between items-center">
                  <DialogTitle>
                    {postCreation.isCreateNewTemplate ? "Create Post Template" : "Create Post"}
                  </DialogTitle>

                  <LabelSelector />
                </div>
                <DialogDescription>
                  Create and scheduled posts for your social media channels
                </DialogDescription>
              </div>
            </DialogHeader>

            {templateSocialPlatform && (
              <div className="flex items-center gap-2 my-2 p-2 bg-blue-50 rounded-md">
                <Info size={16} className="text-blue-500" />
                <span className="text-sm text-blue-700">
                  This template is designed for {templateSocialPlatform} posts only
                </span>
              </div>
            )}

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
                  {filteredChannels?.map((channel) => (
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
                  ))}
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

            {/* Schedule UI */}
            {isScheduleMode && (
              <div className="my-4 p-4 border rounded-md">
                <DateTimeSelector
                  selectedDate={scheduledDateTime}
                  onDateTimeChange={(date) => setScheduledDateTime(date)}
                  setIsScheduleMode={setIsScheduleMode}
                />
              </div>
            )}

            {postCreation.isCreateNewTemplate ? (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setIsCreateNewTemplate(false))}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePostNow(true)}
                  disabled={selectedChannels.length === 0 || !activeChannel}
                >
                  Save Template
                </Button>
              </div>
            ) : (
              <div className="flex justify-between mt-2">
                <Button
                  onClick={handleToggleContentSync}
                  variant="outline"
                  size="sm"
                  disabled={selectedChannels.length === 1 || !activeChannel}
                >
                  {isCustomContent ? (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-2">
                            <p>Un-Customize</p>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs max-w-64 h-fit text-wrap p-2 rounded-md bg-white shadow-md">
                            Sync content across all selected channels
                            <br />
                            Note: first channel content will be consider for syncing content
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          <p>Customize</p>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-64 h-fit text-wrap p-2 rounded-md bg-white shadow-md">
                          Customize for each network
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDraftSave}
                    variant="outline"
                    size="sm"
                    disabled={selectedChannels.length === 0 || !activeChannel}
                    className="flex items-center gap-2"
                  >
                    <Save />
                    <p>Save</p>
                  </Button>

                  <Button
                    onClick={() => {
                      if (isScheduleMode) {
                        handleSchedule();
                      } else {
                        setIsScheduleMode(true);
                      }
                    }}
                    variant={isScheduleMode ? "default" : "outline"}
                    size="sm"
                    disabled={selectedChannels.length === 0 || !activeChannel}
                    className="flex items-center gap-2"
                  >
                    {isScheduleMode ? (
                      <>
                        <CalendarCheck2 />
                        <p>Schedule Post</p>
                      </>
                    ) : (
                      <>
                        <CalendarCheck2 />
                        <p>Schedule</p>
                      </>
                    )}
                  </Button>

                  {!selectedDate && !isScheduleMode && (
                    <Button
                      onClick={() => handlePostNow(false)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={selectedChannels.length === 0 || !activeChannel}
                      size="sm"
                    >
                      Post
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {selectedChannels.length !== 0 && activeChannel && (
            <div
              className={cn(
                "border-l pl-4 hidden md:block bg-white p-5 rounded h-full overflow-y-auto",
                isLeftPanelOpen ? "w-[30%] max-w-[30%]" : "w-[40%] max-w-[40%]",
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
                    content={contentToUse}
                    channel={getChannelById(activeChannel)!}
                    mediaUrls={mediaByChannel[activeChannel]?.map((media) => media.url) || []}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
