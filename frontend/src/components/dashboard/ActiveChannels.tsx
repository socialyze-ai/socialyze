import React from "react";
import { usePosts } from "@/context/PostsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getSocialIcon } from "../post/CreatePostModal";

const ActiveChannels: React.FC = () => {
  const { channels, posts } = usePosts();

  const getRecentPostForChannel = (channelId: string) => {
    return posts.find(
      (post) =>
        post.channels.includes(channelId) &&
        (post.status === "scheduled" || post.status === "sent"),
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
            <div key={channel.id} className={"relative rounded-full p-1.5"}>
              <Avatar className="w-10 h-10 rounded-full">
                <AvatarImage src={channel.profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xl">
                  {channel.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute bottom-1.5 -right-1 rounded-full overflow-hidden border border-gray-200 w-5 h-5 p-0.5 flex items-center justify-center bg-white z-50",
                )}
              >
                {getSocialIcon(channel.type, 16)}
              </div>
            </div>
          ))}

          <Link to="/channels">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
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
