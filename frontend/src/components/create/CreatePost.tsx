import "./CreatePost.scss";
import { FC, useRef, useState, useEffect } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

import { Hashtag } from "../../popups/hashtag/Hashtag";
import Giphy from "../../popups/giphy/Giphy";
import { Emoji } from "@components/emoji";
import { Unsplash } from "../../popups/unsplash/Unsplash";
import { createPost } from "../../api/api.ts";
import { Post } from "../../types/types.ts";
import Modal from "@components/modal/Modal.tsx";

interface CreateProps {
  show: boolean;
  onHide: () => void;
}

const CreatePost: FC<CreateProps> = ({ show, onHide }) => {
  //States for Channel
  const channelArray = ["facebook", "instagram", "x"];
  const [channelBorder, setChannelBorder] = useState(channelArray.map(() => true));
  const toggleChannelBorder = (index: any) => {
    const updatedVisibility = [...channelBorder];
    updatedVisibility[index] = !updatedVisibility[index];
    setChannelBorder(updatedVisibility);
  };

  // States for pictures
  const [pictureArray, setPictureArray] = useState<string[]>([]);
  const handleImageUpload = (event: any) => {
    console.log(event);
    let file: any;
    if (!event.target.files) {
      file = event.target.currentSrc;
      setPictureArray((prevPictureArray) => [...prevPictureArray, file]);
    } else {
      file = URL.createObjectURL(event.target.files[0]);
      // const imageRef = ref(storage, `post/${v4()}`);
      // uploadBytes(imageRef, event.target.files[0]).then((snapshot) => {
      //   getDownloadURL(snapshot.ref).then((url) => {
      //     setPictureArray((prevPictureArray) => [...prevPictureArray, url]);
      //   });
      // });
    }

    //setPictureArray((prevPictureArray) => [...prevPictureArray, file]);
  };

  //For clicking on PicUploader
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFileUploader = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  //Giphy
  const giphyIconRef = useRef(null);
  const [isGiphyBoxOpen, setGiphyBoxOpen] = useState(false);
  const toggleGiphyBox = (event: any) => {
    event.stopPropagation();
    setGiphyBoxOpen(!isGiphyBoxOpen);
  };

  //Unsplash
  const UnsplashIconRef = useRef(null);
  const [isUnsplashBoxOpen, setUnsplashBoxOpen] = useState(false);
  const toggleUnsplashBox = (event: any) => {
    event.stopPropagation();
    setUnsplashBoxOpen(!isUnsplashBoxOpen);
  };

  //TextArea
  const [textAreaContent, setTextAreaContent] = useState("");
  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaContent(event.target.value);
  };

  //EmojiPicjer
  const emojiIconRef = useRef<HTMLImageElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };
  const selectEmoji = (emojiData: EmojiClickData, event: MouseEvent) => {
    setSelectedEmoji(emojiData.unified);
    const htmlContentToAdd = "Hello, World!";
    setTextAreaContent((prevContent) => prevContent + emojiData.emoji);
  };

  //Hashtag Manager
  const hashtagIconRef = useRef<HTMLImageElement | null>(null);
  const hashtagRef = useRef<HTMLDivElement | null>(null);
  const [isHashtagOpen, setIsHashtagOpen] = useState(false);
  const toggleHashtag = () => {
    console.log("isHashtagOpen");
    setIsHashtagOpen(!isHashtagOpen);
  };

  //Handle outside click
  const handleOutsideClick = (event: any) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target) &&
      emojiIconRef.current &&
      !emojiIconRef.current.contains(event.target)
    ) {
      setIsEmojiPickerOpen(false);
    }
    if (
      hashtagRef.current &&
      !hashtagRef.current.contains(event.target) &&
      hashtagIconRef.current &&
      !hashtagIconRef.current.contains(event.target)
    ) {
      setIsHashtagOpen(false);
    }
  };

  //Create Post
  const handleCreatePost = () => {
    const dataToSend: Post = {
      channelId: channelArray.join("-"),
      userId: "default",
      creationDate: new Date(),
      scheduledTime: new Date(),
      type: "postNow",
      caption: textAreaContent,
      images: pictureArray.join("-"),
    };
    // Make the POST request when the button is clicked
    createPost(dataToSend)
      .then((response) => {
        console.log("POST request successful:", response.data);
        // Handle the response as needed
      })
      .catch((error) => {
        console.error("POST request error:", error);
        // Handle the error as needed
      });
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      {show && (
        <Modal onClose={onHide}>
          <div className="createPostContainer">
            <span className="createPostHeader"> Create </span>
            <div className="createPostChannel">
              <span>Select channel</span>
              <div className="createPostChannelList">
                {channelArray.map((item, index) => (
                  <img
                    src={`/channels/${item}.png`}
                    alt=""
                    className={`icon ${channelBorder[index] ? "channelBorder" : ""}`}
                    key={index}
                    onClick={() => toggleChannelBorder(index)}
                  />
                ))}
              </div>
            </div>
            <div className="createPostContent">
              <div className="createPostPics">
                {pictureArray.map((image, index) => (
                  <img key={index} src={image} className="createPostPic" />
                ))}
                <div className="createPostPicUploader" onClick={openFileUploader}>
                  <img src="imagePreview.png" />
                  <span>Drag & Drop or select your photo</span>
                  <span>OR</span>
                  <div className="createPostPicIcons">
                    <img src="gif.png" onClick={toggleGiphyBox} />
                    <img src="unsplash.png" onClick={toggleUnsplashBox} />
                  </div>
                </div>
                <Giphy
                  show={isGiphyBoxOpen}
                  onHide={() => {
                    setGiphyBoxOpen(false);
                  }}
                />
                {isUnsplashBoxOpen && (
                  <Unsplash
                    show={isUnsplashBoxOpen}
                    onHide={() => {
                      setUnsplashBoxOpen(false);
                    }}
                    handleImageUpload={handleImageUpload}
                  />
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} />
              </div>
              <textarea
                placeholder="Share what's on your mind !!"
                value={textAreaContent} // Bind the value of the textarea to the state
                onChange={handleTextAreaChange}
              ></textarea>
              <br />
              <div className="createPostTextEdit">
                <img src="emoji.png" onClick={toggleEmojiPicker} ref={emojiIconRef} />
                <img src="hashtag.png" onClick={toggleHashtag} ref={hashtagIconRef} />
                <img src="ai.png" />
                <div
                  ref={emojiPickerRef}
                  className={`createPostTextEditEmojiPicker ${
                    isEmojiPickerOpen ? "displayBlock" : "displayNone"
                  }`}
                >
                  <EmojiPicker onEmojiClick={selectEmoji} autoFocusSearch={true} height={400} />
                </div>
                <div
                  ref={hashtagRef}
                  className={`createPostTextEditHashtag ${
                    isHashtagOpen ? "displayBlock" : "displayNone"
                  }`}
                >
                  <Hashtag />
                </div>
              </div>
            </div>
            <div className="createPostButtons"></div>
            <div></div>
          </div>
          <div>
            <button onClick={onHide} className="bg-color-offtheme">
              Save Draft
            </button>
            <button onClick={onHide} className="bg-color-theme">
              Schedule Post
            </button>
            <button onClick={handleCreatePost} className="bg-color-theme">
              Post now
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CreatePost;
