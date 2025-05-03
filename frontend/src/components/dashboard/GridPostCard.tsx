import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Repeat,
  MoreVertical,
  LineChart,
  Clock,
  Tags,
  MousePointerClick,
  CircleFadingArrowUp,
  Calendar,
  PenTool,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SocialPlatform } from "./DashboardPostPreview";
import { SocialChannel } from "@/redux/slices/posts.slice";

// Using the exact same props interface as DashboardPostPreview for compatibility
interface GridPostCardProps {
  id?: string;
  platform: SocialPlatform;
  profileImage?: string;
  username: string;
  displayName: string;
  date: string;
  content: string;
  imageUrl?: string;
  storyUrl?: string;
  likes?: number;
  retweets?: number;
  comments?: number;
  impressions?: number;
  engagementRate?: number;
  createdDaysAgo?: number;
  isCustom?: boolean;
  clicks?: number;
}

// Helper function for social icons
const getSocialIcon = (platform: SocialPlatform, size = 18) => {
  switch (platform) {
    case "facebook":
      return <Facebook size={size} className="text-[#1877F2]" />;
    case "twitter":
      return <Twitter size={size} className="text-[#1DA1F2]" />;
    case "instagram":
      return <Instagram size={size} className="text-[#E4405F]" />;
    case "linkedin":
      return <Linkedin size={size} className="text-[#0A66C2]" />;
    default:
      return <Twitter size={size} className="text-[#1DA1F2]" />;
  }
};

const GridPostCard: React.FC<GridPostCardProps> = ({
  platform,
  profileImage,
  username,
  displayName,
  date,
  content,
  imageUrl,
  storyUrl,
  likes = 0,
  retweets = 0,
  comments = 0,
  impressions = 2,
  engagementRate = 0,
  createdDaysAgo = 20,
  clicks = 0,
  isCustom = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentToDisplay =
    isExpanded || content.length <= 150 ? content : `${content.substring(0, 150)}...`;

  const formatPostDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM d, h:mm a");
    } catch (e) {
      return "";
    }
  };

  const getStatusBadge = () => {
    // Determine status based on date and custom flag
    let status = "sent";
    if (isCustom) status = "custom";
    if (new Date(date) > new Date()) status = "scheduled";

    const statusColors = {
      scheduled: "bg-amber-100 text-amber-800",
      sent: "bg-green-100 text-green-800",
      draft: "bg-blue-100 text-blue-800",
      custom: "bg-purple-100 text-purple-800",
    };

    const statusIcons = {
      scheduled: <Calendar className="h-3 w-3 mr-1" />,
      draft: <PenTool className="h-3 w-3 mr-1" />,
      sent: <Clock className="h-3 w-3 mr-1" />,
      custom: <Clock className="h-3 w-3 mr-1" />,
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs flex items-center ${statusColors[status]}`}
      >
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        {/* Header with avatar and platform icon */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="capitalize font-semibold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 rounded-full border border-gray-200 w-4 h-4 flex items-center justify-center bg-white z-10">
                {getSocialIcon(platform, 12)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </div>

          {/* Status badge */}
          {getStatusBadge()}
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap">
            {contentToDisplay}
            {content.length > 150 && (
              <span
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:underline cursor-pointer ml-1"
              >
                {isExpanded ? "see less" : "see more"}
              </span>
            )}
          </p>
        </div>

        {/* Media */}
        {imageUrl && (
          <div className="mb-3 aspect-video w-full rounded-md overflow-hidden bg-muted">
            <img src={imageUrl} alt="Post media" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Date and time */}
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Clock size={12} className="mr-1" />
          <span>{formatPostDate(date)}</span>
          {isCustom && <span className="ml-2 text-xs italic">(Custom)</span>}
        </div>

        {/* Engagement metrics */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart size={12} />
            <span>{likes}</span>
          </div>

          {(platform === "facebook" || platform === "instagram" || platform === "linkedin") && (
            <div className="flex items-center gap-1">
              <MessageCircle size={12} />
              <span>{comments}</span>
            </div>
          )}

          {(platform === "twitter" || platform === "x") && (
            <>
              <div className="flex items-center gap-1">
                <Repeat size={12} />
                <span>{retweets}</span>
              </div>
              {impressions > 0 && (
                <div className="flex items-center gap-1">
                  <CircleFadingArrowUp size={12} />
                  <span>{impressions}</span>
                </div>
              )}
              {clicks > 0 && (
                <div className="flex items-center gap-1">
                  <MousePointerClick size={12} />
                  <span>{clicks}</span>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-1">
            <LineChart size={12} />
            <span>{engagementRate}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 border-t flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{createdDaysAgo} days ago</p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs">Edit Post</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default GridPostCard;
