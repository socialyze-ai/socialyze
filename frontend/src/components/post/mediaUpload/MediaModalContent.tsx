import { useGetImages, useUploadUnsplashMedia } from "@/api/apiHooks/useMedia";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef, useCallback } from "react";
import { DebounceInput } from "react-debounce-input";

import { Media } from "../MediaUploader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Image {
  url: string;
  download_location: string;
  username: string;
  profile_url: string;
  alt_description: string;
  width: number;
  height: number;
}

const MediaModalContent = ({
  setSelectedMediaContent,
  onImageSelect,
  closeModal,
  provider = "unsplash",
}: {
  setSelectedMediaContent: (media: Media[]) => void;
  onImageSelect?: (image: Media) => void;
  closeModal?: () => void;
  provider?: "unsplash" | "pexels" | "google" | "tenor";
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { mutate: generateGCSUrl, isPending: isGenerateGCSUrlPending } = useUploadUnsplashMedia();

  const {
    data: mediaData,
    isLoading: isLoading,
    isError: isError,
  } = useGetImages({
    provider: provider,
    search: searchKeyword || "trending",
    page: page,
    limit: 10,
    order: "latest",
  });

  useEffect(() => {
    if (mediaData?.data?.media && mediaData?.data?.media?.length !== 0) {
      setImages((prevImages) => [...prevImages, ...mediaData?.data?.media]);
      setLoadingMore(false);
    }
  }, [mediaData]);

  // Reset when search changes
  useEffect(() => {
    if (searchKeyword) {
      setImages([]);
      setPage(1);
    }
  }, [searchKeyword]);

  const loadMoreImages = useCallback(() => {
    if (!isLoading && !loadingMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoading, loadingMore]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // If scrolled to near bottom (within 200px of bottom)
        if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading && !loadingMore) {
          loadMoreImages();
        }
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loadMoreImages, isLoading, loadingMore]);

  const handleSelectImage = (image: Image) => {
    setIsSelecting(true);

    const postId = uuidv4();

    generateGCSUrl(
      { url: image.download_location, postId },
      {
        onSuccess: (data) => {
          const newMedia: Media = {
            id: postId,
            url: data.url || image.url, // Use the returned URL or fallback to the preview URL
            type: "image" as const,
          };

          // If there's a direct selection handler, use it
          if (onImageSelect) {
            onImageSelect(newMedia);
          } else {
            // Otherwise update the selection state
            setSelectedMediaContent([newMedia]);
          }

          if (closeModal) {
            closeModal();
          }

          toast.success("Image selected successfully", {
            position: "top-center",
          });
        },
        onError: (error) => {
          console.error("Error uploading image:", error);
          setIsSelecting(false);

          toast.error("Failed to select image", {
            position: "top-center",
          });
        },
        onSettled: () => {
          setIsSelecting(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <DebounceInput
        minLength={2}
        debounceTimeout={500}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder={`Search for ${provider}`}
        className="p-2 border rounded"
      />
      <div
        ref={scrollContainerRef}
        className="flex flex-col gap-2 min-h-[20dvh] max-h-[60vh] overflow-y-auto"
      >
        {(isLoading && page === 1) || isSelecting || isGenerateGCSUrlPending ? (
          <div className="flex flex-col items-center justify-center my-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="mt-2 text-lg font-semibold text-gray-700">
              {isGenerateGCSUrlPending ? "Processing selected Image..." : "Loading..."}
            </p>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500">Error loading images</div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-500 my-10">
            No images found. Try a different search term.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 p-2">
            {Array.from({ length: 3 }).map((_, columnIndex) => (
              <div key={`column-${columnIndex}`} className="flex flex-col gap-4">
                {images
                  .filter((_, index) => index % 3 === columnIndex)
                  .map((image, index) => {
                    if (!image || !image.url) {
                      console.error("Invalid image at index", index, image);
                      return null;
                    }

                    const aspectRatio =
                      image.height && image.width ? (image.height / image.width) * 100 : 75;

                    return (
                      <div key={`${image.url}-${index}`} className="w-full">
                        <div
                          className="relative w-full"
                          style={{
                            paddingBottom: `${aspectRatio}%`,
                          }}
                        >
                          <img
                            src={image.url}
                            alt={image.alt_description || provider + " image"}
                            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer rounded-md hover:ring-2 hover:ring-sky-500"
                            onClick={() => handleSelectImage(image)}
                          />
                        </div>

                        <div className="flex items-center gap-1 text-xs group mt-1">
                          {image.username && (
                            <a
                              href={image.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-700 flex items-center gap-1"
                            >
                              <span className="underline">{image.username}</span>
                            </a>
                          )}

                          <div className="items-center transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100">
                            <span className="mr-1">from</span>

                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline capitalize"
                            >
                              {provider}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModalContent;
