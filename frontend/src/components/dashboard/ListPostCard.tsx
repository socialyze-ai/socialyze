import React from "react";
import { Facebook, Instagram, Linkedin, Twitter, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { format } from "date-fns";
import GridPostCard from "./GridPostCard";

export type SocialPlatform = "twitter" | "instagram" | "linkedin" | "facebook" | "x";

interface ListPostCardProps {
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
  clicks?: number;
}

// Function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "EEEE, MMMM d");
  } catch (e) {
    return "";
  }
};

const ListPostCard: React.FC<ListPostCardProps> = ({
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
}) => {
  return (
    <div className="w-[90%] mx-auto">
      <div className="text-xl font-semibold text-gray-500 mb-3">{formatDate(date)}</div>

      <div className="flex gap-5 w-full">
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
        </div>

        {/* Right Section */}
        <GridPostCard
          platform={platform}
          profileImage={profileImage}
          username={username}
          displayName={displayName}
          date={date}
          content={content}
          imageUrl={imageUrl}
          likes={likes}
          retweets={retweets}
          comments={comments}
          impressions={impressions}
          engagementRate={engagementRate}
          clicks={clicks}
          createdDaysAgo={createdDaysAgo}
          storyUrl={storyUrl}
        />
      </div>
    </div>
  );
};

export default ListPostCard;
