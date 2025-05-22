import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialChannel } from "@/redux/slices/posts.slice";
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { formatDate } from "@/utils/dateUtils";
import { formatContentWithHashtags } from "@/utils/formatContent";

interface PostTemplatePreviewProps {
  content: string;
  channel: SocialChannel;
  mediaUrls?: string[];
  className?: string;
  isTemplate?: boolean; // New prop for smaller template view
}

const MediaGrid = ({ mediaUrls, channelType, isTemplate }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Maximum number of images to display in the grid
  const MAX_VISIBLE_IMAGES = 5;

  const MEDIA_UPLOAD_LIMITS = {
    instagram: 20,
    facebook: 80,
    linkedin: 20,
    twitter: 4,
    default: 10,
  };

  // Get the maximum allowed images for this channel type
  const maxAllowedImages = MEDIA_UPLOAD_LIMITS[channelType] || MEDIA_UPLOAD_LIMITS.default;

  // Filter media to only include the allowed number for this platform
  const allowedMedia = mediaUrls.slice(0, maxAllowedImages);

  // Calculate how many additional images there are beyond what's shown
  const additionalImages =
    allowedMedia.length > MAX_VISIBLE_IMAGES ? allowedMedia.length - MAX_VISIBLE_IMAGES : 0;

  // Only show up to MAX_VISIBLE_IMAGES in the grid
  const visibleMedia = allowedMedia.slice(0, MAX_VISIBLE_IMAGES);
  const mediaCount = visibleMedia.length;

  // Adjust grid height when template view is active
  const templateClass = isTemplate ? "aspect-auto max-h-32" : "";

  // Render grid based on number of images
  if (mediaCount === 1) {
    // 1 image layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-6 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 2) {
    // 2 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-3 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 3) {
    // 3 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-6 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-square overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-square overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 4 && channelType !== "x") {
    // 4 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-6 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 4 && channelType === "x") {
    // 4 images layout for Twitter
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-3 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-video overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else {
    // 5 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className={`col-span-3 aspect-square overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-3 aspect-square overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
        <div className={`col-span-2 aspect-auto overflow-hidden ${templateClass}`}>
          {renderMediaItem(visibleMedia[4], 4, mediaCount, additionalImages)}
        </div>
      </div>
    );
  }

  // Helper function to render media items
  function renderMediaItem(media, index, totalItems, additionalImages) {
    const isVideo =
      (typeof media === "object" && media.type === "video") ||
      (typeof media === "string" && (media.endsWith(".mp4") || media.includes("video")));
    const url = typeof media === "object" ? media.url : media;

    // Check if this is the last visible item and there are additional images
    const showOverlay = index === MAX_VISIBLE_IMAGES - 1 && additionalImages > 0;

    // Adjust overlay text size for template view
    const overlayTextClass = isTemplate ? "text-lg" : "text-2xl";

    return (
      <div className="relative w-full h-full">
        {isVideo ? (
          <video className="w-full h-full object-cover">
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={url} alt="Post media" className="w-full h-full object-cover" />
        )}

        {showOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className={`text-white font-bold ${overlayTextClass}`}>+{additionalImages}</span>
          </div>
        )}
      </div>
    );
  }
};

const PostTemplatePreview: React.FC<PostTemplatePreviewProps> = ({
  content,
  channel,
  mediaUrls = [],
  className,
  isTemplate = false, // Default to normal size
}) => {
  const { scheduledDate } = useSelector(selectPostCreation);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  // Always call useSelector unconditionally, then determine which media to use
  const globalMediaUrls = useSelector(selectPostCreation).mediaUrls;
  const mediaToUse = mediaUrls.length > 0 ? mediaUrls : globalMediaUrls;

  // Dynamic classes based on isTemplate prop
  const getTemplateClasses = () => {
    if (isTemplate) {
      return {
        avatarSize: "w-6 h-6",
        textSize: "text-xs",
        headingSize: "text-xs font-bold",
        subheadingSize: "text-xs",
        dateSize: "text-xs",
        container: "scale-100 transform-origin-top-left",
        iconSize: 14,
        padding: "p-2",
        topMargin: "mt-1",
        buttonIconSize: 14,
        metaText: "text-xxs",
      };
    }
    return {
      avatarSize: "w-10 h-10",
      textSize: "text-sm",
      headingSize: "text-sm font-bold",
      subheadingSize: "text-sm",
      dateSize: "text-sm",
      container: "",
      iconSize: 18,
      padding: "p-3",
      topMargin: "mt-3",
      buttonIconSize: 18,
      metaText: "text-xs",
    };
  };

  const classes = getTemplateClasses();

  const renderTwitterPreview = () => {
    if (!content && (!mediaToUse || mediaToUse.length === 0)) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md">
          <p className="text-gray-500 text-center">Add content or media to see Twitter preview</p>
        </div>
      );
    }

    return (
      <div
        className={`bg-white border border-gray-200 rounded-xl overflow-hidden max-w-md ${classes.container}`}
      >
        <div className={`flex ${classes.padding} items-start`}>
          <Avatar className={`rounded-full mr-3 ${classes.avatarSize}`}>
            <AvatarImage src={channel.profileImage} />
            <AvatarFallback className="capitalize font-semibold text-xl">
              {channel.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <div className="flex items-center">
              <span className={classes.headingSize}>{channel.name}</span>
              <span className={`text-gray-500 ml-1 ${classes.textSize}`}>
                @{channel.username || channel.name.toLowerCase().replace(/\s/g, "")}
              </span>
              <span className="mx-1 text-gray-500">·</span>
              <span className={`text-gray-500 ${classes.textSize}`}>
                {formatDate(scheduledDate || new Date())}
              </span>
            </div>
            <div className={`${classes.topMargin} whitespace-pre-wrap ${classes.textSize}`}>
              {formatContentWithHashtags(content)}
            </div>
            <MediaGrid mediaUrls={mediaToUse} channelType="x" isTemplate={isTemplate} />
            <div className="flex justify-between mt-3 text-gray-500 px-2">
              <button className="flex items-center gap-1 hover:text-blue-500">
                <MessageCircle size={classes.buttonIconSize} />
              </button>
              <button className="flex items-center gap-1 hover:text-green-500">
                <Repeat size={classes.buttonIconSize} />
              </button>
              <button className="flex items-center gap-1 hover:text-red-500">
                <Heart size={classes.buttonIconSize} />
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500">
                <Share size={classes.buttonIconSize} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFacebookPreview = () => {
    if (!content && (!mediaToUse || mediaToUse.length === 0)) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md">
          <p className="text-gray-500 text-center">Add content or media to see Facebook preview</p>
        </div>
      );
    }

    return (
      <div
        className={`bg-white border border-gray-200 rounded-md overflow-hidden max-w-md ${classes.container}`}
      >
        <div className={classes.padding}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className={`rounded-full mr-2 ${classes.avatarSize}`}>
                <AvatarImage src={channel.profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xl">
                  {channel.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className={classes.headingSize}>{channel.name}</div>
                <div className={`text-gray-500 ${classes.metaText}`}>
                  {formatDate(scheduledDate || new Date())} · <span>🌎</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={classes.iconSize} />
            </button>
          </div>
          <div className={`${classes.topMargin} whitespace-pre-wrap ${classes.textSize}`}>
            {formatContentWithHashtags(content)}
          </div>
          <MediaGrid mediaUrls={mediaToUse} channelType="facebook" isTemplate={isTemplate} />
          <div className="border-t border-b border-gray-200 mt-3 py-1 flex justify-between text-gray-600">
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <Heart size={classes.buttonIconSize} />
              <span className={classes.textSize}>Like</span>
            </button>
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <MessageCircle size={classes.buttonIconSize} />
              <span className={classes.textSize}>Comment</span>
            </button>
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <Share size={classes.buttonIconSize} />
              <span className={classes.textSize}>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInstagramPreview = () => {
    if (!mediaToUse || mediaToUse.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-md p-4 max-w-md">
          <p className="text-gray-500 text-center">
            Add at least one image to see Instagram preview
          </p>
        </div>
      );
    }

    return (
      <div
        className={`bg-white border border-gray-200 rounded-md overflow-hidden max-w-md ${classes.container}`}
      >
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center">
            <Avatar className={`rounded-full mr-2 ${classes.avatarSize}`}>
              <AvatarImage src={channel.profileImage} />
              <AvatarFallback className="capitalize font-semibold text-xl">
                {channel.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className={classes.headingSize}>
              {channel.username || channel.name.toLowerCase().replace(/\s/g, "-")}
            </span>
          </div>
          <button>
            <MoreHorizontal size={classes.iconSize} />
          </button>
        </div>

        <MediaGrid mediaUrls={mediaToUse} channelType="instagram" isTemplate={isTemplate} />

        <div className={classes.padding}>
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <button>
                <Heart size={classes.buttonIconSize} />
              </button>
              <button>
                <MessageCircle size={classes.buttonIconSize} />
              </button>
              <button>
                <Send size={classes.buttonIconSize} />
              </button>
            </div>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={classes.buttonIconSize}
                height={classes.buttonIconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10z" />
              </svg>
            </button>
          </div>

          <div className={classes.textSize}>
            <span className="font-medium mr-2">
              {channel.username || channel.name.toLowerCase().replace(/\s/g, "-")}
            </span>
            {formatContentWithHashtags(content)}
          </div>
          <p className={`text-gray-500 mt-1 ${classes.metaText}`}>
            {formatDate(scheduledDate || new Date())}
          </p>
        </div>
      </div>
    );
  };

  const renderLinkedinPreview = () => {
    if (!content && (!mediaToUse || mediaToUse.length === 0)) {
      return (
        <div className="bg-white border border-gray-200 rounded-md p-4 max-w-md">
          <p className="text-gray-500 text-center">Add content or media to see LinkedIn preview</p>
        </div>
      );
    }

    return (
      <div
        className={`bg-white border border-gray-200 rounded-md overflow-hidden max-w-md ${classes.container}`}
      >
        <div className={classes.padding}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className={`rounded-full mr-3 ${classes.avatarSize}`}>
                <AvatarImage src={channel.profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xl">
                  {channel.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className={classes.headingSize}>{channel.name}</div>
                <div className={`text-gray-500 ${classes.metaText}`}>
                  {formatDate(scheduledDate || new Date())} · <span>🌎</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={classes.iconSize} />
            </button>
          </div>
          <div className={`${classes.topMargin} whitespace-pre-wrap ${classes.textSize}`}>
            {formatContentWithHashtags(content)}
          </div>
          <MediaGrid mediaUrls={mediaToUse} channelType="linkedin" isTemplate={isTemplate} />
          <div className="mt-3 flex justify-between text-gray-600 border-t pt-2">
            <button className="flex flex-col items-center">
              <Heart size={classes.buttonIconSize} />
              <span className={classes.metaText}>Like</span>
            </button>
            <button className="flex flex-col items-center">
              <MessageCircle size={classes.buttonIconSize} />
              <span className={classes.metaText}>Comment</span>
            </button>
            <button className="flex flex-col items-center">
              <Repeat size={classes.buttonIconSize} />
              <span className={classes.metaText}>Repost</span>
            </button>
            <button className="flex flex-col items-center">
              <Send size={classes.buttonIconSize} />
              <span className={classes.metaText}>Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultPreview = () => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 max-w-md ${classes.container}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Avatar className={`rounded-full ${classes.avatarSize}`}>
          <AvatarImage src={channel.profileImage} />
          <AvatarFallback className="capitalize font-semibold text-xl">
            {channel.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={classes.headingSize}>{channel.name}</p>
          <p className={`text-gray-500 ${classes.metaText}`}>
            {formatDate(scheduledDate || new Date())}
          </p>
        </div>
      </div>

      <div className={`${classes.topMargin} mb-3 whitespace-pre-wrap ${classes.textSize}`}>
        {formatContentWithHashtags(content)}
      </div>
      <MediaGrid mediaUrls={mediaToUse} channelType="default" isTemplate={isTemplate} />
    </div>
  );

  const renderPreviewByType = () => {
    switch (channel.type) {
      case "x":
        return renderTwitterPreview();
      case "facebook":
        return renderFacebookPreview();
      case "instagram":
        return renderInstagramPreview();
      case "linkedin":
        return renderLinkedinPreview();
      default:
        return renderDefaultPreview();
    }
  };

  return <div className={`preview ${className || ""}`}>{renderPreviewByType()}</div>;
};

export default PostTemplatePreview;
