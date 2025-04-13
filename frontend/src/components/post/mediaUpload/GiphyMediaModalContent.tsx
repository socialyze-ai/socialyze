import { useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { GIPHY_API_KEY } from "@/config/config";
import { v4 as uuidv4 } from "uuid";
import { Media } from "../MediaUploader";
import { Grid } from "@giphy/react-components";
import { DebounceInput } from "react-debounce-input";

const GiphyMediaModalContent = ({
  selectedMediaContent,
  setSelectedMediaContent,
}: {
  selectedMediaContent: Media[];
  setSelectedMediaContent: (media: Media[]) => void;
}) => {
  const giphyFetch = new GiphyFetch(GIPHY_API_KEY);
  const [searchGif, setSearchGif] = useState("trending");
  const fetchGifs = (offset: number) => {
    return giphyFetch.search(searchGif, { offset, limit: 10 });
  };

  const handleGiphyFetch = async () => {
    return await fetchGifs(10);
  };

  return (
    <div className="flex flex-col gap-2">
      <DebounceInput
        minLength={2}
        debounceTimeout={500}
        value={searchGif}
        onChange={(e) => setSearchGif(e.target.value)}
        placeholder="Search for a gif"
        className="p-2 border rounded"
      />
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          <Grid
            fetchGifs={handleGiphyFetch}
            width={820}
            columns={3}
            gutter={6}
            onGifClick={(gif) => {
              setSelectedMediaContent([
                {
                  id: uuidv4(),
                  url: gif.images.fixed_height.url,
                  type: "image",
                },
              ]);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GiphyMediaModalContent;
