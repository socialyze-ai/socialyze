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
  Link,
  Copy,
  Share,
  SquareArrowOutUpRight,
  AlignVerticalJustifyStartIcon,
  X,
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
  isGrid?: boolean;
  clicks?: number;
}

// Helper function for social icons
const getSocialIcon = (platform: SocialPlatform, size = 18) => {
  switch (platform) {
    case "facebook":
      return <Facebook size={size} className="text-[#1877F2]" />;
    case "x":
      return <X size={size} className="text-black" />;
    case "instagram":
      return <Instagram size={size} className="text-[#E4405F]" />;
    case "linkedin":
      return <Linkedin size={size} className="text-[#0A66C2]" />;
    default:
      return <X size={size} className="text-black" />;
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
  isGrid = false,
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
        className={`px-2 py-0.5 rounded-full text-xs flex items-center ${statusColors[status]} whitespace-nowrap`}
      >
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEngagementRatings = () => {
    // Common metrics for all platforms
    const commonMetrics = [
      {
        id: 1,
        name: "Likes",
        value: likes,
        icon: <Heart size={16} />,
      },
      {
        id: 5,
        name: "Eng. Rate",
        value: engagementRate,
        icon: <LineChart size={16} />,
      },
    ];

    // Platform specific metrics
    switch (platform) {
      case "facebook":
      case "instagram":
        return [
          ...commonMetrics,
          {
            id: 2,
            name: "Comments",
            value: comments,
            icon: <MessageCircle size={16} />,
          },
        ];
      case "x":
        return [
          ...commonMetrics,
          {
            id: 2,
            name: "Retweets",
            value: retweets,
            icon: <Repeat size={16} />,
          },
          {
            id: 3,
            name: "Impressions",
            value: impressions,
            icon: <CircleFadingArrowUp size={16} />,
          },
          {
            id: 4,
            name: "Clicks",
            value: clicks,
            icon: <MousePointerClick size={16} />,
          },
        ];
      case "linkedin":
        return [
          ...commonMetrics,
          {
            id: 2,
            name: "Comments",
            value: comments,
            icon: <MessageCircle size={16} />,
          },
          {
            id: 3,
            name: "Impressions",
            value: impressions,
            icon: <CircleFadingArrowUp size={16} />,
          },
        ];
      default:
        return commonMetrics;
    }
  };

  const engagementRatings = getEngagementRatings();

  return (
    <Card
      className={cn(
        "overflow-hidden h-full hover:shadow-md transition-shadow break-inside-avoid",
        isGrid && "mb-4",
      )}
    >
      <CardContent className="p-2 sm:p-3">
        {/* Header with avatar and platform icon */}
        <div className="flex justify-between items-center mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xs sm:text-sm">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 rounded-full border border-gray-200 w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center bg-white z-10">
                {getSocialIcon(platform, 10)}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium leading-none truncate">{displayName}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">@{username}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Content */}
        <div className="mb-2 sm:mb-3">
          <p className="text-xs sm:text-sm whitespace-pre-wrap">
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
          <div className="mb-2 sm:mb-3 aspect-video w-full rounded-md overflow-hidden bg-muted">
            <img src={imageUrl} alt="Post media" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Date and time */}
        <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
          <Clock size={10} className="mr-1" />
          <span>{formatPostDate(date)}</span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-gray-600">
            {engagementRatings.map((item) => (
              <PostSocialEngagement
                key={item.id}
                icon={item.icon}
                text={item.name}
                count={item.value}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 border-t flex justify-between items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="border border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
        >
          <Tags size={14} className="sm:w-4 sm:h-4" />
        </Button>

        <div className="flex gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="border border-gray-300 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-3"
          >
            <SquareArrowOutUpRight size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <p>View Post</p>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="border border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
              >
                <MoreVertical size={14} className="sm:w-4 sm:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2 text-xs sm:text-sm">
                <Link size={14} className="sm:w-4 sm:h-4" />
                <p>Copy link</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-xs sm:text-sm">
                <Copy size={14} className="sm:w-4 sm:h-4" />
                <p>Duplicate</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GridPostCard;

const PostSocialEngagement = ({
  icon,
  text,
  count,
}: {
  icon: React.ReactNode;
  text: string;
  count: number;
}) => {
  return (
    <div className="flex flex-col text-xs sm:text-sm">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-xs sm:text-sm font-semibold whitespace-nowrap">{text}</p>
      </div>
      <p className="text-xs sm:text-sm font-semibold">{count}</p>
    </div>
  );
};
