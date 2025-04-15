import { useGetUnsplashMedia } from "@/api/apiHooks/useMedia";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { DebounceInput } from "react-debounce-input";
import { useSelector } from "react-redux";
import { selectPostCreation } from "@/redux/slices/postCreation.slice";

import { Media } from "../MediaUploader";
const UnsplashMediaModalContent = ({
  selectedMediaContent,
  setSelectedMediaContent,
}: {
  selectedMediaContent: Media[];
  setSelectedMediaContent: (media: Media[]) => void;
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("trending");
  const { data: unsplashData } = useGetUnsplashMedia(searchKeyword, page);

  useEffect(() => {
    if (unsplashData && unsplashData.data.results) {
      setImages((prevImages) => [...prevImages, ...unsplashData.data.results]);
    }
  }, [unsplashData]);

  const loadMoreImages = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const toggleImageSelection = (imageUrl: string) => {
    // Check if the image is already selected
    const isSelected = selectedMediaContent.some((media) => media.url === imageUrl);

    // If already selected, remove it; otherwise, add it to the existing array
    if (isSelected) {
      // Remove the selected image
      setSelectedMediaContent(selectedMediaContent.filter((media) => media.url !== imageUrl));
    } else {
      // Add the new image to existing selection
      setSelectedMediaContent([
        ...selectedMediaContent,
        {
          id: uuidv4(),
          url: imageUrl,
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
        <div className="grid grid-cols-3 gap-2">
          {images.map((image: any) => {
            const isSelected = selectedMediaContent.some((media) => media.url === image.urls.small);

            return (
              <img
                key={image.id}
                src={image.urls.small}
                alt={image.alt_description}
                className={cn(
                  "cursor-pointer rounded-md",
                  isSelected && "border-4 border-blue-500",
                )}
                onClick={() => toggleImageSelection(image.urls.small)}
              />
            );
          })}
        </div>

        <button
          onClick={loadMoreImages}
          className="self-center mt-4 p-2 bg-blue-500 text-white rounded text-sm"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default UnsplashMediaModalContent;
