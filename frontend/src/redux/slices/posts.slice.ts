import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

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

interface PostsState {
  posts: Post[];
  channels: SocialChannel[];
}

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

const initialState: PostsState = {
  posts: initialPosts,
  channels: initialChannels,
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Omit<Post, "id" | "createdAt" | "updatedAt">>) => {
      const newPost: Post = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.posts.push(newPost);
    },
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<Post> }>) => {
      const { id, updates } = action.payload;
      const postIndex = state.posts.findIndex((post) => post.id === id);
      if (postIndex !== -1) {
        state.posts[postIndex] = {
          ...state.posts[postIndex],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    addChannel: (state, action: PayloadAction<Omit<SocialChannel, "id">>) => {
      const newChannel: SocialChannel = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.channels.push(newChannel);
    },
    updateChannel: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<SocialChannel> }>,
    ) => {
      const { id, updates } = action.payload;
      const channelIndex = state.channels.findIndex((channel) => channel.id === id);
      if (channelIndex !== -1) {
        state.channels[channelIndex] = {
          ...state.channels[channelIndex],
          ...updates,
        };
      }
    },
    deleteChannel: (state, action: PayloadAction<string>) => {
      state.channels = state.channels.filter((channel) => channel.id !== action.payload);
    },
    addChannels: (state, action: PayloadAction<SocialChannel[]>) => {
      // Add new channels without duplicating existing ones
      const existingIds = new Set(state.channels.map((channel) => channel.id));
      const newChannels = action.payload.filter((channel) => !existingIds.has(channel.id));
      state.channels = [...state.channels, ...newChannels];
    },
  },
});

export const {
  addPost,
  updatePost,
  deletePost,
  addChannel,
  updateChannel,
  deleteChannel,
  addChannels,
} = postsSlice.actions;

// Selectors
export const selectPosts = (state: RootState) => state.posts.posts;
export const selectChannels = (state: RootState) => state.posts.channels;

export default postsSlice.reducer;
