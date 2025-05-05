import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "./EmojiPicker";
import { SocialChannel } from "@/redux/slices/posts.slice";
import { Facebook, Instagram, Linkedin, Pencil, Twitter, X } from "lucide-react";
import { DialogContent } from "../ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import MediaUploader, { Media } from "./MediaUploader";
import { Button } from "../ui/button";
import { setMediaUrls } from "@/redux/slices/postCreation.slice";
import { useDispatch } from "react-redux";
import HashtagModal from "./HashtagModal";

interface ChannelPostInputProps {
  channel: SocialChannel;
  content: string;
  onContentChange: (content: string) => void;
  mediaUrls: Media[];
  postType: "post" | "reel" | "story";
  onPostTypeChange: (type: "post" | "reel" | "story") => void;
  activeChannel: string;
  onChannelSelect: (channelType: string) => void;
  handleEditMedia?: (media: Media) => void;
}

const ChannelPostInput: React.FC<ChannelPostInputProps> = ({
  channel,
  content,
  onContentChange,
  mediaUrls,
  postType,
  onPostTypeChange,
  activeChannel,
  onChannelSelect,
  handleEditMedia,
}) => {
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const dispatch = useDispatch();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Character limits by platform
  const getCharacterLimit = () => {
    switch (channel.type) {
      case "x":
        return 280;
      case "linkedin":
        return 3000;
      case "instagram":
        return 2200;
      case "facebook":
        return 63206;
      default:
        return 2000;
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    onContentChange(content + emoji);
    textareaRef?.focus();
  };

  // Get social media icon by type
  const getSocialIcon = (type: string) => {
    switch (type) {
      case "facebook":
        return <Facebook size={20} className="text-[#1877F2]" />;
      case "x":
        return <X size={20} className="text-[#1DA1F2]" />;
      case "instagram":
        return <Instagram size={20} className="text-[#E4405F]" />;
      case "linkedin":
        return <Linkedin size={20} className="text-[#0A66C2]" />;
      default:
        return <X size={20} className="text-[#1DA1F2]" />;
    }
  };

  const characterCount = content.length;
  const characterLimit = getCharacterLimit();

  return (
    <>
      <div className={`border rounded-md ${activeChannel === channel.id ? "bg-gray-100" : ""}`}>
        <div
          className="p-3 flex items-center gap-2 border-b cursor-pointer"
          onClick={() => onChannelSelect(channel.id)}
        >
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getSocialIcon(channel.type)}
          </div>
          <span className="font-medium">{channel.name}</span>
        </div>

        {activeChannel === channel.id && (
          <div className="p-3 flex flex-col gap-2">
            <Textarea
              placeholder="Start writing or use the AI Assistant"
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-transparent"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              ref={setTextareaRef}
            />

            <div className="flex flex-wrap">
              {mediaUrls.map((media) => (
                <div key={media.id} className="relative m-1">
                  {media.type === "video" ? (
                    <video src={media.url} controls className="h-20 w-20 rounded object-cover" />
                  ) : (
                    <img
                      src={media.url}
                      alt={`Selected ${media.id}`}
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}
                  <div className="absolute top-0 right-0 flex space-x-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
                      onClick={() => handleEditMedia(media)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() =>
                        dispatch(setMediaUrls(mediaUrls.filter((m) => m.id !== media.id)))
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 border-t pt-2">
              <div className="flex items-center space-x-3">
                <MediaUploader onlyTriggerButton />

                <HashtagModal />
                <EmojiPicker onEmojiSelect={handleInsertEmoji} />
              </div>

              {characterLimit && (
                <div
                  className={`text-xs ${
                    characterCount > characterLimit ? "text-red-500 font-medium" : "text-gray-500"
                  }`}
                >
                  {characterCount} / {characterLimit}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          {mediaUrls.map((mediaUrl) => (
            <MediaUploader key={mediaUrl.id} />
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChannelPostInput;
