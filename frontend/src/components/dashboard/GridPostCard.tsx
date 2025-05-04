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
  isGrid?: boolean;
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
      case "twitter":
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
      className={cn("overflow-hidden h-full hover:shadow-md transition-shadow", isGrid && "mb-4")}
    >
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

        <div className="flex justify-between items-center">
          <div
            className={cn(
              "flex gap-2 flex-wrap justify-between text-gray-600",
              engagementRatings?.length === 3 && "gap-5",
            )}
          >
            {engagementRatings.map((item) => (
              <PostSocialEngagement
                key={item.id}
                icon={item.icon}
                text={item.name}
                count={item.value}
              />
            ))}
          </div>

          {/* <Button variant="ghost" size="icon" className="border border-gray-300 h-10 w-10">
            <AlignVerticalJustifyStartIcon />
          </Button> */}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t flex justify-between items-center">
        <Button variant="ghost" size="icon" className="border border-gray-300">
          <Tags size={16} />
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="border border-gray-300 text-sm p-1.5 px-3">
            <SquareArrowOutUpRight size={16} />
            <p>View Post</p>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="border border-gray-300">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Link size={16} />
                <p>Copy link</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Copy size={16} />
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
    <div className="flex flex-col text-sm">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-sm font-semibold">{text}</p>
      </div>

      <p className="text-sm font-semibold">{count}</p>
    </div>
  );
};
