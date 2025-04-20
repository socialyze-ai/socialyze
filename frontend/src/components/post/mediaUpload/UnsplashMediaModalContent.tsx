import { useGetImages } from "@/api/apiHooks/useMedia";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { DebounceInput } from "react-debounce-input";

import { Media } from "../MediaUploader";

interface UnsplashImage {
  url: string;
  download_location: string;
  username: string;
  profile_url: string;
  alt_description: string;
  width: number;
  height: number;
}

const UnsplashMediaModalContent = ({
  selectedMediaContent,
  setSelectedMediaContent,
}: {
  selectedMediaContent: Media[];
  setSelectedMediaContent: (media: Media[]) => void;
}) => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("trending");

  const {
    data: unsplashData,
    isLoading: isLoadingUnsplash,
    isError: isErrorUnsplash,
  } = useGetImages({
    provider: "unsplash",
    search: searchKeyword,
    page: page,
    limit: 10,
    order: "latest",
  });

  useEffect(() => {
    if (unsplashData?.data?.media) {
      setImages((prevImages) => [...prevImages, ...unsplashData.data.media]);
    }
  }, [unsplashData]);

  const loadMoreImages = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const toggleImageSelection = (image: UnsplashImage) => {
    const isSelected = selectedMediaContent.some((media) => media.url === image.url);

    if (isSelected) {
      setSelectedMediaContent(selectedMediaContent.filter((media) => media.url !== image.url));
    } else {
      setSelectedMediaContent([
        ...selectedMediaContent,
        {
          id: uuidv4(),
          url: image.url,
          type: "image" as const,
        },
      ]);
    }
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
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {isLoadingUnsplash && <div className="text-center">Loading...</div>}
        {isErrorUnsplash && <div className="text-center text-red-500">Error loading images</div>}

        <div className="columns-3 gap-4">
          {images.map((image) => {
            const isSelected = selectedMediaContent.some((media) => media.url === image.url);
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
                    className={cn(
                      "absolute top-0 left-0 w-full h-full object-cover cursor-pointer rounded-md",
                      isSelected && "border-4 border-blue-500",
                    )}
                    onClick={() => toggleImageSelection(image)}
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

        {!isLoadingUnsplash && (
          <button
            onClick={loadMoreImages}
            className="self-center mt-4 p-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default UnsplashMediaModalContent;
