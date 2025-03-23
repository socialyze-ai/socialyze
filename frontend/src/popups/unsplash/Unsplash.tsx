import { Modal } from "react-bootstrap";
import "./Unsplash.scss";
import { FC, SetStateAction, useEffect, useRef, useState, useCallback } from "react";
import { DebounceInput } from "react-debounce-input";
import axios from "axios";
import {
  UNSPALSH_ACCESS_KEY,
  UNSPLASH_API_URL,
  UNSPLASH_IMAGE_PER_PAGE,
} from "../../config/config";

interface UnsplashProps {
  show: boolean;
  onHide: () => void;
  handleImageUpload: (event: React.MouseEvent) => void;
}

export const Unsplash: FC<UnsplashProps> = ({ show, onHide, handleImageUpload }) => {
  const modalRef = useRef(null);
  const infiniteLoaderRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("trending");
  const [images, setImages] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const observer = useRef();
  const lastImageRef = useCallback(
    (image: string) => {
      console.log(image, isLoading);
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (isLoading) return;
          getImages();
          console.log("Hello");
        }
      });
      if (image) observer.current.observe(image);
    },
    [searchKeyword, isLoading],
  );

  const getImages = async () => {
    let cancel;
    setIsLoading(true);
    try {
      const data = await axios.get(
        `${UNSPLASH_API_URL}?query=${searchKeyword}&page=${pageNumber}&per_page=${UNSPLASH_IMAGE_PER_PAGE}&client_id=${UNSPALSH_ACCESS_KEY}`,
        { cancelToken: new axios.CancelToken((c) => (cancel = c)) },
      );
      const updatedImages = [...images, ...data.data.results]; // Create a new array with updated data
      setImages(updatedImages);

      setPageNumber((prevPageNumber) => prevPageNumber + 1);
      setTotalPages(data.data.total_pages);
      setIsLoading(false);
      console.log(data, isLoading);

      console.log(
        `${UNSPLASH_API_URL}?query=${searchKeyword}&page=${pageNumber}&per_page=${UNSPLASH_IMAGE_PER_PAGE}&client_id=${UNSPALSH_ACCESS_KEY}`,
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.log(error);
      }
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   setImages([]);
  // }, [searchKeyword]);

  useEffect(() => {
    getImages();
  }, [searchKeyword]);

  return (
    <Modal contentClassName="unsplashModal" show={show} size="xl" onHide={onHide} centered>
      <div className="unsplashSearch">
        <DebounceInput
          minLength={3}
          debounceTimeout={1500}
          onChange={(event) => {
            if (event.target.value.length >= 3) {
              setPageNumber(1);
              setImages([]);
              setSearchKeyword(event.target.value);
              console.log("Search box value:", event.target.value);
              //getImages();
            }
          }}
          placeholder="Seach here"
        />
      </div>
      <div className="unsplashContentWrapper">
        <div className="unsplashPictures">
          {images.map((image, index) => {
            // Handle the case where the image data is not available
            //return <p>{images}</p>;

            if (images.length === index + 1) {
              return (
                <img
                  ref={lastImageRef}
                  key={image.id}
                  src={image.urls.small}
                  alt={image.alt_description}
                  onClick={handleImageUpload}
                />
              );
            } else {
              return (
                <img
                  key={image.id}
                  src={image.urls.small}
                  alt={image.alt_description}
                  onClick={handleImageUpload}
                />
              );
            }
          })}
        </div>
        {isLoading && <p>Loading...</p>}
        <div style={{ height: "10px" }} ref={infiniteLoaderRef}></div>
      </div>
    </Modal>
  );
};
