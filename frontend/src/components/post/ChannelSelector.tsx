import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SocialChannel } from "@/context/PostsContext";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
// import { TiktokIcon } from "@/components/icons";
import PostPreview from "./PostPreview";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { useSelector } from "react-redux";

interface ChannelSelectorProps {
  channels: SocialChannel[];
  selectedChannels: string[];
  onChannelToggle: (channelId: string) => void;
  className?: string;
  content?: string;
}

// Get social media icon by type
export const getSocialIcon = (type: string) => {
  switch (type) {
    case "facebook":
      return <Facebook className="text-[#1877F2]" />;
    case "twitter":
      return <Twitter className="text-[#1DA1F2]" />;
    case "instagram":
      return <Instagram className="text-[#E4405F]" />;
    case "linkedin":
      return <Linkedin className="text-[#0A66C2]" />;
    // case "tiktok":
    //   return <TiktokIcon />;
    default:
      return <Twitter className="text-[#1DA1F2]" />;
  }
};

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannels,
  onChannelToggle,
  className,
  content,
}) => {
  const { mediaUrls } = useSelector(selectPostCreation);

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-wrap">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer m-2 ${
                selectedChannels.includes(channel.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onChannelToggle(channel.id)}
            >
              {getSocialIcon(channel.type)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelSelector;
