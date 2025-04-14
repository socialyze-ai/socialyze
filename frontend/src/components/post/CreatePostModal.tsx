import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck2,
  Facebook,
  Instagram,
  Linkedin,
  Save,
  Twitter,
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
import ChannelPostInput from "./ChannelPostInput";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPostCreation,
  selectSelectedChannels,
  selectActiveChannel,
  selectContentByChannel,
  setContentForChannel,
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
} from "@/redux/slices/postCreation.slice";
import { Media } from "./MediaUploader";
import ImageEditor from "./editor/ImageEditor";
import PostComposer from "./PostComposer";
import { cn } from "@/lib/utils";
import AIAssistantPanel from "./aiAssistant/AIAssistantPanel";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCustomContent, setIsCustomContent] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Initialize content by channel when modal opens
  useEffect(() => {
    if (channels.length > 0) {
      dispatch(initializeChannelContent(channels.map((channel) => channel.id)));
    }
  }, [channels, dispatch]);

  const handleChannelToggle = (channelId: string) => {
    dispatch(toggleChannelSelection(channelId));
  };

  const handleContentChange = (channelId: string, content: string) => {
    // Use the new synchronization action instead of the single channel update
    dispatch(syncContentAcrossChannels({ sourceChannelId: channelId, content }));
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

    if (!hasContent && postCreation.mediaUrls.length === 0) {
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

    if (!hasContent && postCreation.mediaUrls.length === 0) {
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

      addPost({
        content: finalContent,
        channels: [channelId],
        mediaUrls: postCreation.mediaUrls.map((media) => media.url),
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
    const updatedMediaUrls = postCreation.mediaUrls.map((media) =>
      media.id === editedMediaId ? { ...media, url: editedMediaUrl } : media,
    );
    dispatch(setMediaUrls(updatedMediaUrls));
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
              <DialogTitle>Create Post</DialogTitle>
              <DialogDescription>
                Create and schedule posts for your social media channels
              </DialogDescription>
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
                        <ChannelPostInput
                          key={channelId}
                          channel={channel}
                          content={contentByChannel[channelId] || ""}
                          onContentChange={(content) => handleContentChange(channelId, content)}
                          mediaUrls={postCreation.mediaUrls}
                          postType={postCreation.postTypeByChannel[channelId] || "post"}
                          onPostTypeChange={(type) => handlePostTypeChange(channelId, type)}
                          activeChannel={activeChannel || ""}
                          onChannelSelect={(channelId) => dispatch(setActiveChannel(channelId))}
                        />
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
            )}

            {selectedChannels.length !== 0 && activeChannel && (
              <div className="flex justify-between">
                <Button onClick={() => setIsCustomContent((prev) => !prev)}>Custom Content</Button>

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
          {postCreation.mediaUrls && postCreation.mediaUrls?.length > 0 && (
            <ImageEditor
              selectedImage={selectedMedia}
              onSave={handleSaveEditedMedia}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePostModal;
