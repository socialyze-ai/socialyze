import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { FC, useEffect, useRef, useState } from "react";
import "./CreatePost.scss";

import { Box, Button, Container, Dialog, Flex, Grid } from "@radix-ui/themes";
import { RxCross2 } from "react-icons/rx";
import { createPost } from "../../api/api.ts";
import Giphy from "../../popups/giphy/Giphy";
import { Hashtag } from "../../popups/hashtag/Hashtag";
import { Unsplash } from "../../popups/unsplash/Unsplash";
import { Post } from "../../types/post.type.ts";
import { Facebook } from "./preview";

interface CreateProps {
  show: boolean;
  onHide: () => void;
}

const CreatePost: FC<CreateProps> = ({ show, onHide }) => {
  const channelArray = ["facebook", "instagram", "x"];
  const [channelBorder, setChannelBorder] = useState(channelArray.map(() => true));
  const toggleChannelBorder = (index: any) => {
    const updatedVisibility = [...channelBorder];
    updatedVisibility[index] = !updatedVisibility[index];
    setChannelBorder(updatedVisibility);
  };

  const [pictureArray, setPictureArray] = useState<string[]>([]);
  const handleImageUpload = (event: any) => {
    console.log(event);
    let file: any;
    if (!event.target.files) {
      file = event.target.currentSrc;
      setPictureArray((prevPictureArray) => [...prevPictureArray, file]);
    } else {
      file = URL.createObjectURL(event.target.files[0]);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFileUploader = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const [isGiphyBoxOpen, setGiphyBoxOpen] = useState(false);
  const toggleGiphyBox = (event: any) => {
    event.stopPropagation();
    setGiphyBoxOpen(!isGiphyBoxOpen);
  };

  const [isUnsplashBoxOpen, setUnsplashBoxOpen] = useState(false);
  const toggleUnsplashBox = (event: any) => {
    event.stopPropagation();
    setUnsplashBoxOpen(!isUnsplashBoxOpen);
  };

  const [textAreaContent, setTextAreaContent] = useState("");
  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaContent(event.target.value);
  };

  const emojiIconRef = useRef<HTMLImageElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };
  const selectEmoji = (emojiData: EmojiClickData) => {
    setTextAreaContent((prevContent) => prevContent + emojiData.emoji);
  };

  const hashtagIconRef = useRef<HTMLImageElement | null>(null);
  const hashtagRef = useRef<HTMLDivElement | null>(null);
  const [isHashtagOpen, setIsHashtagOpen] = useState(false);
  const toggleHashtag = () => {
    console.log("isHashtagOpen");
    setIsHashtagOpen(!isHashtagOpen);
  };

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
    createPost(dataToSend)
      .then((response) => {
        console.log("POST request successful:", response.data);
      })
      .catch((error) => {
        console.error("POST request error:", error);
      });
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <Dialog.Root open={show} onOpenChange={onHide}>
      <Dialog.Content
        maxWidth={"90vw"}
        style={{
          backgroundColor: "#00000000",
          boxShadow: "none",
          padding: "0",
        }}
      >
        <Dialog.Description>
          <Grid
            columns={{ initial: "0.68fr 0.32fr" }}
            gapX={"0.7rem"}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "2rem",
                borderRadius: "var(--radius-3)",
              }}
            >
              <h2>Create</h2>
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
                  value={textAreaContent}
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

              <Flex gap="3" pt={"1rem"}>
                <Button onClick={onHide} color="indigo" variant="soft">
                  Save Draft
                </Button>
                <Button onClick={onHide} color="orange" variant="soft">
                  Schedule Post
                </Button>
                <Button onClick={handleCreatePost} color="cyan" variant="soft">
                  Post now
                </Button>
              </Flex>
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-3)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem"
              }}
            >
              <h1 style={{fontSize: "1.5rem"}}>Facebook Preview</h1>
              <Container size="1">
                {textAreaContent && <Facebook content={textAreaContent} />}
              </Container>
            </div>
          </Grid>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreatePost;
