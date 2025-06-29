import React, { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialChannel } from "@/redux/slices/posts.slice";
import {
  Heart,
  MessageCircle,
  Repeat,
  Share,
  MoreHorizontal,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";
import { formatDate } from "@/utils/dateUtils";
import { formatContentWithHashtags } from "@/utils/formatContent";
import InstagramProfilePreview from "./template/gridEditor/InstagramProfilePreview";

// Add CSS for webkit scrollbar hiding
const hideScrollbarCSS = `
  .carousel-container::-webkit-scrollbar {
    display: none;
  }
`;

interface PostPreviewProps {
  content: string;
  channel: SocialChannel;
  mediaUrls?: string[];
  className?: string;
}

interface GridPreviewProps {
  mediaUrls?: string[] | { url: string; type: string }[];
  channel?: SocialChannel;
}

interface CarouselPreviewProps {
  mediaUrls?: string[] | { url: string; type: string }[];
}

interface CarouselMediaItem {
  url: string;
  type: string;
}

const GridPreview: React.FC<GridPreviewProps> = ({ mediaUrls = [], channel }) => {
  const previewBoxRef = useRef<HTMLDivElement>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Standardize media format
  const standardizedMedia = mediaUrls.map((media) =>
    typeof media === "string"
      ? { url: media, type: media.endsWith(".mp4") ? "video" : "image" }
      : media,
  );

  const canvasCount = standardizedMedia.length;

  // Calculate grid columns based on number of items
  const getGridPreviewStyle = () => {
    const columns = 3; // Instagram uses 3 columns
    return {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      aspectRatio: "1",
    };
  };

  const renderCell = (index: number) => {
    if (index >= standardizedMedia.length) return null;

    const media = standardizedMedia[index];
    const isVideo = media.type === "video" || media.url.endsWith(".mp4");

    return (
      <div key={index} className="aspect-square overflow-hidden bg-gray-100 relative">
        {isVideo ? (
          <video className="w-full h-full object-cover">
            <source src={media.url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={media.url}
            alt={`Grid item ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <div className="mt-3">
      <InstagramProfilePreview
        previewBoxRef={previewBoxRef}
        getGridPreviewStyle={getGridPreviewStyle}
        canvasCount={canvasCount}
        renderCell={renderCell}
      />
    </div>
  );
};

const CarouselMedia: React.FC<{ media: CarouselMediaItem; isActive: boolean }> = ({
  media,
  isActive,
}) => {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        autoPlay={isActive}
      />
    );
  }
  return <img src={media.url} className="w-full h-full object-cover" alt="carousel media" />;
};

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ mediaUrls = [] }) => {
  const [showNavigation, setShowNavigation] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Standardize media format
  const standardizedMedia = mediaUrls.map((media) =>
    typeof media === "string"
      ? { url: media, type: media.endsWith(".mp4") ? "video" : "image" }
      : media,
  );

  // Add effect to handle scroll events
  useEffect(() => {
    const scrollContainer = carouselRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!scrollContainer) return;

      // Calculate which item is most visible
      const containerRect = scrollContainer.getBoundingClientRect();
      const items = scrollContainer.querySelectorAll(".carousel-item");

      let maxVisibleItem = 0;
      let maxVisibleArea = 0;

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();

        // Calculate the visible area of this item
        const xOverlap = Math.max(
          0,
          Math.min(itemRect.right, containerRect.right) -
            Math.max(itemRect.left, containerRect.left),
        );

        const visibleArea = xOverlap;

        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          maxVisibleItem = index;
        }
      });

      setActiveIndex(maxVisibleItem);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, standardizedMedia.length - 1));
    setActiveIndex(newIndex);

    const scrollContainer = carouselRef.current;
    const items = scrollContainer.querySelectorAll(".carousel-item");

    if (items[newIndex]) {
      const scrollLeft =
        items[newIndex].getBoundingClientRect().left -
        scrollContainer.getBoundingClientRect().left +
        scrollContainer.scrollLeft;

      scrollContainer.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handlePrevious = () => {
    scrollToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(activeIndex + 1);
  };

  return (
    <div
      className="mt-3 relative group h-80 w-full"
      onMouseEnter={() => setShowNavigation(true)}
      onMouseLeave={() => setShowNavigation(false)}
    >
      {/* Navigation buttons - shown on hover */}
      {showNavigation && standardizedMedia.length > 1 && (
        <>
          <button
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-90 ${
              activeIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevious}
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          <button
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-90 ${
              activeIndex >= standardizedMedia.length - 1 ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={activeIndex >= standardizedMedia.length - 1}
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </>
      )}

      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory carousel-container h-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {standardizedMedia.map((media, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 carousel-item snap-start"
            style={{ minWidth: "100%" }}
            role="group"
            aria-label={`Slide ${index + 1} of ${standardizedMedia.length}`}
            aria-hidden={index !== activeIndex}
          >
            <CarouselMedia media={media} isActive={index === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
};

const MediaGrid = ({ mediaUrls, channelType }) => {
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

  // Render grid based on number of images
  if (mediaCount === 1) {
    // 1 image layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-6 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 2) {
    // 2 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-3 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 3) {
    // 3 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-6 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-square overflow-hidden">
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-square overflow-hidden">
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 4 && channelType !== "x") {
    // 4 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-6 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else if (mediaCount === 4 && channelType === "x") {
    // 4 images layout for Twitter
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-3 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-video overflow-hidden">
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
      </div>
    );
  } else {
    // 5 images layout
    return (
      <div className="grid grid-cols-6 gap-1 mt-3">
        <div className="col-span-3 aspect-square overflow-hidden">
          {renderMediaItem(visibleMedia[0], 0, mediaCount, additionalImages)}
        </div>
        <div className="col-span-3 aspect-square overflow-hidden">
          {renderMediaItem(visibleMedia[1], 1, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[2], 2, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
          {renderMediaItem(visibleMedia[3], 3, mediaCount, additionalImages)}
        </div>
        <div className="col-span-2 aspect-auto overflow-hidden">
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
            <span className="text-white text-2xl font-bold">+{additionalImages}</span>
          </div>
        )}
      </div>
    );
  }
};

const PostPreview: React.FC<PostPreviewProps> = ({
  content,
  channel,
  mediaUrls = [],
  className,
}) => {
  const { scheduledDate, selectedTemplateCategory } = useSelector(selectPostCreation);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  // Always call useSelector unconditionally, then determine which media to use
  const globalMediaUrls = useSelector(selectPostCreation).mediaUrls;
  const mediaToUse = mediaUrls.length > 0 ? mediaUrls : globalMediaUrls;

  const renderTwitterPreview = () => {
    if (!content && (!mediaToUse || mediaToUse.length === 0)) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md">
          <p className="text-gray-500 text-center">Add content or media to see Twitter preview</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-w-md">
        <div className="flex p-3 items-start">
          <Avatar className="w-10 h-10 rounded-full mr-3">
            <AvatarImage src={channel.profileImage} />
            <AvatarFallback className="capitalize font-semibold text-xl">
              {channel.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <div className="flex items-center">
              <span className="font-bold text-sm">{channel.name}</span>
              <span className="text-gray-500 text-sm ml-1">
                @{channel.username || channel.name.toLowerCase().replace(/\s/g, "")}
              </span>
              <span className="mx-1 text-gray-500">·</span>
              <span className="text-gray-500 text-sm">
                {formatDate(scheduledDate || new Date())}
              </span>
            </div>
            <div className="mt-1 whitespace-pre-wrap">{formatContentWithHashtags(content)}</div>
            <MediaGrid mediaUrls={mediaToUse} channelType="x" />
            <div className="flex justify-between mt-3 text-gray-500 px-2">
              <button className="flex items-center gap-1 hover:text-blue-500">
                <MessageCircle size={18} />
              </button>
              <button className="flex items-center gap-1 hover:text-green-500">
                <Repeat size={18} />
              </button>
              <button className="flex items-center gap-1 hover:text-red-500">
                <Heart size={18} />
              </button>
              <button className="flex items-center gap-1 hover:text-blue-500">
                <Share size={18} />
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
          <p className="text-gray-500 text-center">Add content or media to see Twitter preview</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-md">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="w-10 h-10 rounded-full mr-2">
                <AvatarImage src={channel.profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xl">
                  {channel.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(scheduledDate || new Date())} · <span>🌎</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="mt-3 whitespace-pre-wrap">{formatContentWithHashtags(content)}</div>
          <MediaGrid mediaUrls={mediaToUse} channelType="facebook" />
          <div className="border-t border-b border-gray-200 mt-3 py-1 flex justify-between text-gray-600">
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <Heart size={18} /> Like
            </button>
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <MessageCircle size={18} /> Comment
            </button>
            <button className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded">
              <Share size={18} /> Share
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

    // Check if selectedTemplateCategory is for grid or carousel
    const isGridTemplate = selectedTemplateCategory?.name === "Grid";
    const isCarouselTemplate = selectedTemplateCategory?.name === "Carousel";

    // For grid template, show the full Instagram profile preview
    if (isGridTemplate) {
      return (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-md">
          <GridPreview mediaUrls={mediaToUse} channel={channel} />
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-md">
        <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center">
            <Avatar className="w-10 h-10 rounded-full mr-2">
              <AvatarImage src={channel.profileImage} />
              <AvatarFallback className="capitalize font-semibold text-xl">
                {channel.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {channel.username || channel.name.toLowerCase().replace(/\s/g, "-")}
            </span>
          </div>
          <button>
            <MoreHorizontal size={20} />
          </button>
        </div>

        <CarouselPreview mediaUrls={mediaToUse} />

        <div className="p-3">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <button>
                <Heart size={24} />
              </button>
              <button>
                <MessageCircle size={24} />
              </button>
              <button>
                <Send size={24} />
              </button>
            </div>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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

          <div className="text-sm">
            <span className="font-medium mr-2">
              {channel.username || channel.name.toLowerCase().replace(/\s/g, "-")}
            </span>
            {formatContentWithHashtags(content)}
          </div>
          <p className="text-gray-500 text-xs mt-1">{formatDate(scheduledDate || new Date())}</p>
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
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-md">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="w-10 h-10 rounded-full mr-3">
                <AvatarImage src={channel.profileImage} />
                <AvatarFallback className="capitalize font-semibold text-xl">
                  {channel.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(scheduledDate || new Date())} · <span>🌎</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="mt-3 whitespace-pre-wrap">{formatContentWithHashtags(content)}</div>
          <MediaGrid mediaUrls={mediaToUse} channelType="linkedin" />
          <div className="mt-3 flex justify-between text-gray-600 border-t pt-2">
            <button className="flex flex-col items-center">
              <Heart size={18} />
              <span className="text-xs">Like</span>
            </button>
            <button className="flex flex-col items-center">
              <MessageCircle size={18} />
              <span className="text-xs">Comment</span>
            </button>
            <button className="flex flex-col items-center">
              <Repeat size={18} />
              <span className="text-xs">Repost</span>
            </button>
            <button className="flex flex-col items-center">
              <Send size={18} />
              <span className="text-xs">Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultPreview = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
      <div className="flex items-center space-x-3 mb-2">
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarImage src={channel.profileImage} />
          <AvatarFallback className="capitalize font-semibold text-xl">
            {channel.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{channel.name}</p>
          <p className="text-xs text-gray-500">{formatDate(scheduledDate || new Date())}</p>
        </div>
      </div>

      <div className="mt-3 mb-3 whitespace-pre-wrap">{formatContentWithHashtags(content)}</div>
      <MediaGrid mediaUrls={mediaToUse} channelType="default" />
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

export default PostPreview;
