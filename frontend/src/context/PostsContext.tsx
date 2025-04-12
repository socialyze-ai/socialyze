import React, { createContext, useContext, useState } from "react";

export type SocialChannel = {
  id: string;
  type: "facebook" | "twitter" | "instagram" | "linkedin";
  // | "pinterest"
  // | "tiktok";
  name: string;
  profileImage: string;
  connected: boolean;
};

export type PostStatus = "draft" | "scheduled" | "sent" | "failed";

export type Post = {
  id: string;
  content: string;
  mediaUrls?: string[];
  channels: string[]; // Channel IDs
  scheduledAt?: Date;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
};

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

// Mock initial data
const initialChannels: SocialChannel[] = [
  {
    id: "1",
    type: "twitter",
    name: "My Twitter",
    profileImage: "https://randomuser.me/api/portraits/men/0.jpg",
    connected: true,
  },
  {
    id: "2",
    type: "facebook",
    name: "My Facebook Page",
    profileImage: "https://randomuser.me/api/portraits/men/0.jpg",
    connected: true,
  },
  {
    id: "3",
    type: "instagram",
    name: "My Instagram",
    profileImage: "https://randomuser.me/api/portraits/men/0.jpg",
    connected: true,
  },
  {
    id: "4",
    type: "linkedin",
    name: "My LinkedIn",
    profileImage: "https://randomuser.me/api/portraits/men/0.jpg",
    connected: true,
  },
];

const initialPosts: Post[] = [
  {
    id: "1",
    content: "This is my first scheduled post! #excited",
    channels: ["1", "2"],
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    content: "Just published a new article on our blog. Check it out!",
    mediaUrls: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c"],
    channels: ["1", "3", "4"],
    status: "sent",
    createdAt: new Date(Date.now() - 86400000), // Yesterday
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "3",
    content: "Working on our new product launch. Stay tuned!",
    channels: ["2", "4"],
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [channels, setChannels] = useState<SocialChannel[]>(initialChannels);

  const addPost = (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPosts([...posts, newPost]);
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, ...updates, updatedAt: new Date() } : post
      )
    );
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  const addChannel = (channel: Omit<SocialChannel, "id">) => {
    const newChannel: SocialChannel = {
      ...channel,
      id: Date.now().toString(),
    };
    setChannels([...channels, newChannel]);
  };

  const updateChannel = (id: string, updates: Partial<SocialChannel>) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, ...updates } : channel
      )
    );
  };

  const deleteChannel = (id: string) => {
    setChannels(channels.filter((channel) => channel.id !== id));
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
