import useClickOutside from "@hooks/useClickOutside";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { FC, useRef } from "react";

interface EmojiProps {
  onClickOutside: () => void;
  onEmojiClick: (emojiData: EmojiClickData, event: MouseEvent) => void;
}

export const Emoji: FC<EmojiProps> = ({ onClickOutside, onEmojiClick }) => {
  const clickRef = useRef(null);
  useClickOutside(clickRef, onClickOutside);
  return (
    <div ref={clickRef}>
      <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={true} height={400} />
    </div>
  );
};
