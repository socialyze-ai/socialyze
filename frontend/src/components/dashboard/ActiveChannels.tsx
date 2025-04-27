import React from "react";
import { SocialChannel, usePosts } from "@/context/PostsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PostPreview from "@/components/post/PostPreview";

const ActiveChannels: React.FC = () => {
  const { channels, posts } = usePosts();

  const getRecentPostForChannel = (channelId: string) => {
    return posts.find(
      (post) =>
        post.channels.includes(channelId) &&
        (post.status === "scheduled" || post.status === "sent")
    );
  };

  const renderSocialIcon = (type: string) => {
    const iconClass = `absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center 
      text-white text-xs bg-${
        type === "facebook"
          ? "blue-500"
          : type === "twitter"
          ? "sky-400"
          : type === "instagram"
          ? "pink-500"
          : type === "linkedin"
          ? "blue-700"
          : type === "pinterest"
          ? "red-500"
          : type === "tiktok"
          ? "black"
          : "gray-500"
      }`;

    return (
      <div className={iconClass}>
        {type === "twitter" && "X"}
        {type === "facebook" && "f"}
        {type === "instagram" && "IG"}
        {type === "linkedin" && "in"}
        {type === "pinterest" && "P"}
        {type === "tiktok" && "T"}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex gap-3 items-center">
          {channels.map((channel) => (
            <HoverCard key={channel.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="cursor-pointer relative">
                  <Avatar className="h-10 w-10 border-2 hover:border-primary">
                    <AvatarImage
                      src={channel.profileImage}
                      alt={channel.name}
                    />
                    <AvatarFallback>
                      {channel.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {renderSocialIcon(channel.type)}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={channel.profileImage}
                        alt={channel.name}
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {channel.type}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    {getRecentPostForChannel(channel.id) ? (
                      <PostPreview
                        content={
                          getRecentPostForChannel(channel.id)?.content || ""
                        }
                        channel={channel}
                        mediaUrl={
                          getRecentPostForChannel(channel.id)?.mediaUrls?.[0]
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No recent posts
                      </p>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}

          <Link to="/channels">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add channel</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveChannels;
