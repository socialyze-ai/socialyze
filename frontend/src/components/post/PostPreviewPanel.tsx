import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PostPreview from "./PostPreview";
import { SocialChannel } from "@/redux/slices/posts.slice";
import { addHashtagsToContent } from "@/utils/formatContent";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { cn } from "@/lib/utils";
import { htmlToText } from "html-to-text";

interface PostPreviewPanelProps {
  content: string;
  // hashtags: string[];
  selectedChannels: string[];
  channels: SocialChannel[];
  className?: string;
  isPage?: boolean;
}

const PostPreviewPanel: React.FC<PostPreviewPanelProps> = ({
  content,
  // hashtags,
  selectedChannels,
  channels,
  className,
  isPage = false,
}) => {
  const { mediaUrls } = useSelector(selectPostCreation);
  const [currentPreviewTab, setCurrentPreviewTab] = useState<string | undefined>(
    selectedChannels.length > 0 ? selectedChannels[0] : undefined,
  );

  // Update current tab when selected channels change
  React.useEffect(() => {
    if (
      selectedChannels.length > 0 &&
      (!currentPreviewTab || !selectedChannels.includes(currentPreviewTab))
    ) {
      setCurrentPreviewTab(selectedChannels[0]);
    }
  }, [selectedChannels, currentPreviewTab]);

  const getPreviewContent = () => {
    return content;
    // return addHashtagsToContent(content, hashtags);
  };

  if (selectedChannels.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a channel to preview your post</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className={cn(isPage ? "p-2" : "pt-6")}>
        {!isPage && (
          <div className="flex items-center justify-between ">
            <h3 className="font-medium mb-4 w-2/6">Preview</h3>
            <select
              value={currentPreviewTab}
              onChange={(e) => setCurrentPreviewTab(e.target.value)}
              className="mb-4 min-w-fit max-w-4/6 border border-gray-300 rounded-md p-2 text-sm"
            >
              {selectedChannels.map((channelId) => {
                const channel = channels.find((c) => c.id === channelId);
                return channel ? (
                  <option key={channel.id} value={channel.id}>
                    {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                    {channel.username ? ` - ${channel.username}` : ""}
                  </option>
                ) : null;
              })}
            </select>
          </div>
        )}

        {selectedChannels.map((channelId) => {
          const channel = channels.find((c) => c.id === channelId);
          const filterContent = getPreviewContent();
          const removeBreakTags = filterContent?.replace(/<br>/g, "");
          const contentToUse = htmlToText(removeBreakTags);

          return channel && currentPreviewTab === channel.id ? (
            <PostPreview key={channel.id} content={contentToUse} channel={channel} />
          ) : null;
        })}
      </CardContent>
    </Card>
  );
};

export default PostPreviewPanel;
