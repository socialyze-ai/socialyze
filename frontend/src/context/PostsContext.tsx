import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SocialChannel,
  PostStatus,
  Post,
  addPost as addPostAction,
  updatePost as updatePostAction,
  deletePost as deletePostAction,
  addChannel as addChannelAction,
  updateChannel as updateChannelAction,
  deleteChannel as deleteChannelAction,
  selectPosts,
  selectChannels,
} from "../redux/slices/posts.slice";

type PostsContextType = {
  posts: Post[];
  channels: SocialChannel[];
  addPost: (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addChannel: (channel: Omit<SocialChannel, "id">) => void;
  updateChannel: (id: string, updates: Partial<SocialChannel>) => void;
  deleteChannel: (id: string) => void;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};

// Re-export types
export type { SocialChannel, PostStatus, Post };

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const posts = useSelector(selectPosts);
  const channels = useSelector(selectChannels);

  const addPost = (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    dispatch(addPostAction(post));
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    dispatch(updatePostAction({ id, updates }));
  };

  const deletePost = (id: string) => {
    dispatch(deletePostAction(id));
  };

  const addChannel = (channel: Omit<SocialChannel, "id">) => {
    dispatch(addChannelAction(channel));
  };

  const updateChannel = (id: string, updates: Partial<SocialChannel>) => {
    dispatch(updateChannelAction({ id, updates }));
  };

  const deleteChannel = (id: string) => {
    dispatch(deleteChannelAction(id));
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        channels,
        addPost,
        updatePost,
        deletePost,
        addChannel,
        updateChannel,
        deleteChannel,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
