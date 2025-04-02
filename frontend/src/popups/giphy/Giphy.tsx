import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { Dialog } from "@radix-ui/themes";
import { FC, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { GIPHY_API_KEY } from "../../config/config";
import "./Giphy.scss";
const giphyFetch = new GiphyFetch(GIPHY_API_KEY);

interface GiphyProps {
  show: boolean;
  onHide: () => void;
}

const Giphy: FC<GiphyProps> = ({ show, onHide }) => {
  const [searchGif, setSearchGif] = useState("trending");
  const fetchGifs = (offset: number) => {
    return giphyFetch.search(searchGif, { offset, limit: 10 });
  };
  const [gifContent, setGifContent] = useState(fetchGifs(100));
  const [width, setWidth] = useState(window.innerWidth);

  return (
    <Dialog.Root open={show} onOpenChange={onHide}>
      <Dialog.Content>
        <div className="giphyContentWrapper">
          <div className="giphySearch">
            <DebounceInput
              minLength={3}
              debounceTimeout={1000}
              onChange={(event) => {
                setSearchGif(event.target.value);
                setGifContent(fetchGifs(100));
              }}
              placeholder="Seach here"
            />
          </div>
          <div className="giphyGrid">
            <Grid
              fetchGifs={() => {
                return gifContent;
              }}
              width={width / 2 + 100}
              columns={3}
              gutter={6}
            />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default Giphy;
