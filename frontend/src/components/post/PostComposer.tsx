import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LinkEmbed from "./LinkEmbed";
import EmojiPicker from "./EmojiPicker";
import Mentions from "./Mentions";
import MediaUploader, { Media } from "./MediaUploader";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPostCreation,
  setIsAIAssistantOpen,
  setIsTemplateSectionOpen,
} from "@/redux/slices/postCreation.slice";
import HashtagModal from "./HashtagModal";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Book, Wand2 } from "lucide-react";
import AIAssistantTextarea from "./aiAssistant/AIAssistantTextarea";
import ThirdPartyContentGenerator from "./ThirdPartyContentGenerator";

interface PostComposerProps {
  isPostModal?: boolean;
  content: string;
  onContentChange: (content: string) => void;
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  onMediaUrlsChange: (urls: Media[]) => void;
  channelMedia?: Media[];
  className?: string;
  channelId?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
  isPostModal = false,
  content,
  onContentChange,
  hashtags,
  onHashtagsChange,
  onMediaUrlsChange,
  channelMedia,
  className,
  channelId,
}) => {
  const [embeddedLink, setEmbeddedLink] = React.useState<
    { url: string; title: string } | undefined
  >(undefined);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dispatch = useDispatch();
  const { mediaUrls, isAIAssistantOpen, isTemplateSectionOpen } = useSelector(selectPostCreation);

  // Use channelMedia if provided, otherwise use global mediaUrls
  const mediaToUse = channelMedia || mediaUrls;

  // Handle inserting content
  const handleInsertEmoji = (emoji: string) => {
    onContentChange(content + emoji);
  };

  const handleMention = (username: string) => {
    onContentChange(`${content}@${username} `);
  };

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <AIAssistantTextarea
          content={content}
          onContentChange={onContentChange}
          isPostModal={isPostModal}
        />

        {mediaToUse.length > 0 && (
          <div className="mt-4">
            <MediaUploader
              mediaUrls={mediaToUse}
              onMediaChange={onMediaUrlsChange}
              channelId={channelId}
            />
          </div>
        )}

        {/* {embeddedLink && (
          <div className="mt-4">
            <LinkEmbed
              onLinkAdd={(url, title) => setEmbeddedLink({ url, title })}
              embeddedLink={embeddedLink}
              onClearLink={() => setEmbeddedLink(undefined)}
            />
          </div>
        )} */}

        <div className="flex items-center mt-4 space-x-2 border-t pt-4">
          {mediaToUse.length === 0 && (
            <MediaUploader onMediaChange={onMediaUrlsChange} channelId={channelId} />
          )}

          <HashtagModal />

          {/* {!embeddedLink && (
            <LinkEmbed
              onLinkAdd={(url, title) => setEmbeddedLink({ url, title })}
            />
          )} */}

          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(setIsAIAssistantOpen(!isAIAssistantOpen))}
            className={cn(
              isAIAssistantOpen && "bg-blue-600 text-white hover:bg-blue-400 hover:text-white",
            )}
          >
            <Wand2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(setIsTemplateSectionOpen(!isTemplateSectionOpen))}
            className={cn(
              isTemplateSectionOpen && "bg-blue-600 text-white hover:bg-blue-400 hover:text-white",
            )}
          >
            <Book className="h-4 w-4" />
          </Button>

          <EmojiPicker onEmojiSelect={handleInsertEmoji} />

          <Mentions onMention={handleMention} />

          <ThirdPartyContentGenerator />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
