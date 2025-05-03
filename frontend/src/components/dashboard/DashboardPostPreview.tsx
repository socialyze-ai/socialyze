import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Heart,
  Repeat,
  Share,
  MoreVertical,
  LineChart,
  BarChart3,
  Clock,
  Plus,
  Tags,
  AlignVerticalJustifyStartIcon,
  SquareArrowOutUpRight,
  MousePointerClick,
  CircleFadingArrowUp,
  Copy,
  Link,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { SocialChannel } from "@/redux/slices/posts.slice";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DropdownMenu } from "../ui/dropdown-menu";
import { format } from "date-fns";

export type SocialPlatform = "twitter" | "instagram" | "linkedin" | "facebook" | "x";

interface DashboardPostPreviewProps {
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

export const getSocialIcon = (platform: SocialPlatform, size = 18) => {
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

const DashboardPostPreview: React.FC<DashboardPostPreviewProps> = ({
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

  // Function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "EEEE, MMMM d");
    } catch (e) {
      return "";
    }
  };

  const contentToDisplay =
    isExpanded || content.length <= 350 ? content : `${content.substring(0, 350)}...`;

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

  console.log("datedatedate", date);

  return (
    <div className="w-[90%] mx-auto">
      <div className="text-xl font-semibold text-gray-500 mb-3">{formatDate(date)}</div>

      <div className="flex gap-5">
        {/* Left Section */}
        <div className="flex flex-col gap-2">
          {date && (
            <Tooltip>
              <TooltipTrigger
                asChild
                className="cursor-pointer text-sm text-gray-500 font-semibold"
              >
                <p>
                  {new Date(date).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </p>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-gray-500 text-white w-60">
                <p>
                  Channel Local Time: {new Date(date).toLocaleString([], { timeZoneName: "short" })}
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {isCustom && (
            <Tooltip>
              <TooltipTrigger asChild className="cursor-pointer text-xs text-gray-500">
                <p className="flex items-center gap-1">
                  Custom <Clock size={12} />
                </p>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-gray-500 text-white w-60">
                <p>
                  Posting time was set manually and is not determined by the channel's posting
                  schedule
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Middle Section */}
        <Card className="overflow-hidden w-[80%]">
          <div className="p-4 flex justify-between">
            <div className={cn("flex flex-col gap-3", imageUrl ? "w-[60%]" : "w-full")}>
              <div className="flex justify-between items-center">
                <PostSocailHeader
                  channel={{
                    id: "1",
                    connected: true,
                    profileImage: profileImage,
                    name: displayName,
                    username: username,
                    type: platform,
                  }}
                />

                <div className="flex items-center gap-1 border border-gray-200 rounded-full px-2 py-1">
                  <Plus size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Story</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm mb-2 whitespace-pre-wrap">
                  {contentToDisplay}{" "}
                  {content?.length > 350 && (
                    <span
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-gray-500 hover:underline cursor-pointer"
                    >
                      {isExpanded ? "see less" : "see more"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <img src={imageUrl} alt="Post media" className="w-48 h-48 object-cover rounded" />
          </div>

          <div className="pb-4 px-4 border-b border-gray-300">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 h-8 border border-gray-300 rounded"
            >
              <Tags />
            </Button>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-gray-300">
            <div className={cn("flex gap-10 flex-wrap", "w-[90%]")}>
              {engagementRatings.map((item) => (
                <PostSocialEngagement
                  key={item.id}
                  icon={item.icon}
                  text={item.name}
                  count={item.value}
                />
              ))}
            </div>

            <Button variant="ghost" size="icon" className="border border-gray-300 h-10 w-10">
              <AlignVerticalJustifyStartIcon />
            </Button>
          </div>

          <div className="p-4 flex justify-between items-center">
            <p className="text-sm">
              <span className="text-gray-500">You</span> created this {createdDaysAgo} days ago
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="border border-gray-300">
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
                    <Share size={16} />
                    <p>Share link in Post</p>
                  </DropdownMenuItem>
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

              {/* <Button variant="ghost" size="icon" className="border border-gray-300">
                <MoreVertical size={16} />
              </Button> */}
            </div>
          </div>
        </Card>

        {/* Right Section */}
        <Button variant="ghost" size="icon" className="border border-gray-300 h-10 w-10">
          <MessageCircle />
        </Button>
      </div>
    </div>
  );
};

export default DashboardPostPreview;

const PostSocailHeader = ({ channel }: { channel: SocialChannel }) => {
  return (
    <div className={"relative rounded-full w-fit"}>
      <Avatar className="w-10 h-10 rounded-full">
        <AvatarImage src={channel.profileImage} />
        <AvatarFallback className="capitalize font-semibold text-xl">
          {channel.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "absolute -bottom-1 -right-1.5 rounded-full overflow-hidden border border-gray-200 w-5 h-5 flex items-center justify-center bg-white z-50",
        )}
      >
        {getSocialIcon(channel.type, 16)}
      </div>
    </div>
  );
};

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
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-sm font-semibold">{text}</p>
      </div>

      <p className="text-sm font-semibold">{count}</p>
    </div>
  );
};
