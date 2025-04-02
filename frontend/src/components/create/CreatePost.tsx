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
    <Dialog.Root open={show} onOpenChange={onHide}>
      <Dialog.Content maxWidth={"90vw"}>
        <Flex justify={"between"}>
          <Dialog.Title>Create</Dialog.Title>
          <Dialog.Close>
            <RxCross2 />
          </Dialog.Close>
        </Flex>
        <Dialog.Description>
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
          <Grid columns={{ initial: "0.6fr 0.4fr" }} gapX={"0.7rem"}>
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
            <Box
              style={{
                background: "var(--gray-a2)",
                borderRadius: "var(--radius-3)",
                padding: "1rem",
              }}
            >
              <Container size="1">
                {textAreaContent && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "12px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        gap: "0.5rem",
                      }}
                    >
                      <img
                        src={`/channels/facebook.png`}
                        alt=""
                        className={`icon channelBorder`}
                        style={{ height: "42px" }}
                        key={"facebook-dummy"}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Align & Shine</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>Just Now · 🌐</div>
                      </div>

                      <div style={{ fontSize: "20px", cursor: "pointer" }}>⋯</div>
                    </div>

                    <div style={{ marginBottom: "10px" }}>{textAreaContent}</div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        borderTop: "1px solid #eee",
                        paddingTop: "8px",
                        fontSize: "14px",
                        color: "#555",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        👍 <span>Like</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        💬 <span>Comment</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        ↪️ <span>Share</span>
                      </div>
                    </div>
                  </div>
                )}
              </Container>
            </Box>
          </Grid>
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
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreatePost;
