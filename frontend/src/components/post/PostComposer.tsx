import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LinkEmbed from "./LinkEmbed";
import EmojiPicker from "./EmojiPicker";
import Mentions from "./Mentions";
import MediaUploader, { Media } from "./MediaUploader";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import HashtagModal from "./HashtagModal";
import { cn } from "@/lib/utils";
import AIAssistantTextarea from "./AIAssistantTextarea";

interface PostComposerProps {
  isPostModal?: boolean;
  content: string;
  onContentChange: (content: string) => void;
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  onMediaUrlsChange: (urls: Media[]) => void;
  className?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
  isPostModal = false,
  content,
  onContentChange,
  hashtags,
  onHashtagsChange,
  onMediaUrlsChange,
  className,
}) => {
  const [embeddedLink, setEmbeddedLink] = React.useState<
    { url: string; title: string } | undefined
  >(undefined);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { mediaUrls } = useSelector(selectPostCreation);

  // Handle inserting content
  const handleInsertEmoji = (emoji: string) => {
    onContentChange(content + emoji);
  };

  const handleMention = (username: string) => {
    onContentChange(`${content}@${username} `);
  };

  return (
    <Card className={className}>
      <CardContent className={cn(isPostModal ? "p-3" : "pt-6")}>
        <AIAssistantTextarea
          content={content}
          onContentChange={onContentChange}
          isPostModal={isPostModal}
        />

        {mediaUrls.length > 0 && (
          <div className="mt-4">
            <MediaUploader />
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
          {mediaUrls.length === 0 && <MediaUploader />}

          <HashtagModal />

          {/* {!embeddedLink && (
            <LinkEmbed
              onLinkAdd={(url, title) => setEmbeddedLink({ url, title })}
            />
          )} */}
          <EmojiPicker onEmojiSelect={handleInsertEmoji} />
          <Mentions onMention={handleMention} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
