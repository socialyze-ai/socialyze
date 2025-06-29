import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/utils/dateUtils";
import { formatContentWithHashtags } from "@/utils/formatContent";
import { SocialChannel } from "@/components/post/PostTemplatePreview";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Add CSS for webkit scrollbar hiding
const hideScrollbarCSS = `
  .carousel-container::-webkit-scrollbar {
    display: none;
  }
`;

interface TemplatePreviewProps {
  content: string;
  channel: SocialChannel;
  mediaUrls?: string[] | { url: string; type: string }[];
  templateType: "grid" | "carousel";
  className?: string;
}

interface GridPreviewProps {
  mediaUrls?: string[] | { url: string; type: string }[];
}

interface CarouselPreviewProps {
  mediaUrls?: string[] | { url: string; type: string }[];
}

interface CarouselMediaItem {
  url: string;
  type: string;
}

const GridPreview: React.FC<GridPreviewProps> = ({ mediaUrls = [] }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Standardize media format
  const standardizedMedia = mediaUrls.map((media) =>
    typeof media === "string"
      ? { url: media, type: media.endsWith(".mp4") ? "video" : "image" }
      : media,
  );

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-0">
        {standardizedMedia.map((media, index) => {
          const isVideo = media.type === "video" || media.url.endsWith(".mp4");

          return (
            <div key={index} className="aspect-square overflow-hidden">
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
        })}
      </div>
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
      className="mt-3 relative group h-full w-full"
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

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  content,
  channel = { name: "", type: "default", profileImage: "", handle: "default" } as SocialChannel,
  mediaUrls = [],
  templateType,
  className,
}) => {
  console.log("mediaUrlsmediaUrls", mediaUrls);

  // Display classes similar to PostTemplatePreview's template mode
  const classes = {
    avatarSize: "w-6 h-6",
    textSize: "text-xs",
    headingSize: "text-xs font-bold",
    subheadingSize: "text-xs",
    dateSize: "text-xs",
    container: "scale-100 transform-origin-top-left",
    padding: "p-2",
    topMargin: "mt-1",
    metaText: "text-xxs",
  };

  return (
    <div className={`preview ${className || ""}`}>
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

      <div
        className={`bg-white border border-gray-200 rounded-md overflow-hidden max-w-md ${classes.container}`}
      >
        <div className={classes.padding}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Avatar className={`rounded-full mr-2 ${classes.avatarSize}`}>
                <AvatarImage src={"https://randomuser.me/api/portraits/men/1.jpg"} />
                <AvatarFallback className="capitalize font-semibold text-sm">
                  {channel?.name ? channel.name.charAt(0) : "?"}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className={classes.headingSize}>{channel?.name || "Channel"}</div>
                <div className={`text-gray-500 ${classes.metaText}`}>{formatDate(new Date())}</div>
              </div>
            </div>
          </div>

          {templateType === "grid" ? (
            <GridPreview mediaUrls={mediaUrls} />
          ) : (
            <CarouselPreview mediaUrls={mediaUrls} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
