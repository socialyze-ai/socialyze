import { useGetImages, useUploadUnsplashMedia } from "@/api/apiHooks/useMedia";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef, useCallback } from "react";
import { DebounceInput } from "react-debounce-input";

import { Media } from "../MediaUploader";
import { toast } from "@/components/ui/use-toast";
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
  provider?: string;
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("elephant dancing");
  const [isSelecting, setIsSelecting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { mutate: generateGCSUrl, isPending: isGenerateGCSUrlPending } = useUploadUnsplashMedia();

  const {
    data: unsplashData,
    isLoading: isLoadingUnsplash,
    isError: isErrorUnsplash,
  } = useGetImages({
    provider: provider,
    search: searchKeyword,
    page: page,
    limit: 10,
    order: "latest",
  });

  useEffect(() => {
    if (unsplashData?.data?.media) {
      setImages((prevImages) => [...prevImages, ...unsplashData.data.media]);
      setLoadingMore(false);
    }
  }, [unsplashData]);

  // Reset when search changes
  useEffect(() => {
    setImages([]);
    setPage(1);
  }, [searchKeyword]);

  const loadMoreImages = useCallback(() => {
    if (!isLoadingUnsplash && !loadingMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [isLoadingUnsplash, loadingMore]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // If scrolled to near bottom (within 200px of bottom)
        if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingUnsplash && !loadingMore) {
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
  }, [loadMoreImages, isLoadingUnsplash, loadingMore]);

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

          toast({
            title: "Success",
            description: "Unsplash image selected successfully",
          });
        },
        onError: (error) => {
          console.error("Error uploading Unsplash image:", error);
          setIsSelecting(false);

          toast({
            title: "Error",
            description: "Failed to select Unsplash image",
            variant: "destructive",
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
        placeholder="Search for images"
        className="p-2 border rounded"
      />
      <div
        ref={scrollContainerRef}
        className="flex flex-col gap-2 min-h-[20dvh] max-h-[60vh] overflow-y-auto"
      >
        {(isLoadingUnsplash && page === 1) || isSelecting || isGenerateGCSUrlPending ? (
          <div className="flex flex-col items-center justify-center my-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="mt-2 text-lg font-semibold text-gray-700">
              {isGenerateGCSUrlPending ? "Processing selected Image..." : "Loading..."}
            </p>
          </div>
        ) : isErrorUnsplash ? (
          <div className="text-center text-red-500">Error loading images</div>
        ) : (
          <div className="columns-3 gap-4 p-2">
            {images.map((image) => {
              const aspectRatio = (image.height / image.width) * 100;

              return (
                <div key={image.url} className="mb-4 break-inside-avoid">
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: `${aspectRatio}%`,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_description}
                      className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer rounded-md hover:ring-2 hover:ring-sky-500"
                      onClick={() => handleSelectImage(image)}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs group mt-1">
                    <a
                      href={image.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 flex items-center gap-1"
                    >
                      <span className="underline">{image.username}</span>
                    </a>

                    <div className="items-center transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100">
                      <span className="mr-1">for</span>

                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Unsplash
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
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
