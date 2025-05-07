import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type SocialChannel = {
  id: string;
  type: "facebook" | "twitter" | "instagram" | "linkedin" | "x";
  name: string;
  username?: string;
  description?: string;
  profileImage: string;
  connected: boolean;
  workspace?: string;
  channelId?: string;
};

export type PostStatus = "draft" | "scheduled" | "postnow" | "failed" | "sent";

export type Post = {
  id: string;
  content: string;
  mediaUrls?: string[];
  channels: string[]; // Channel IDs
  scheduledAt?: string; // Store as ISO string instead of Date
  status: PostStatus;
  createdAt: string; // Store as ISO string instead of Date
  updatedAt: string; // Store as ISO string instead of Date
};

interface PostsState {
  posts: Post[];
  channels: SocialChannel[];
}

const initialPosts: Post[] = [
  {
    id: "1",
    content: "This is my first scheduled post! #excited",
    channels: ["1", "2"],
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Use ISO string
    status: "scheduled",
    createdAt: new Date().toISOString(), // Use ISO string
    updatedAt: new Date().toISOString(), // Use ISO string
  },
  {
    id: "2",
    content: "Just published a new article on our blog. Check it out!",
    mediaUrls: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c"],
    channels: ["1", "3", "4"],
    status: "postnow",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Use ISO string
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // Use ISO string
  },
  {
    id: "3",
    content: "Working on our new product launch. Stay tuned!",
    channels: ["2", "4"],
    status: "draft",
    createdAt: new Date().toISOString(), // Use ISO string
    updatedAt: new Date().toISOString(), // Use ISO string
  },
];

const initialState: PostsState = {
  posts: initialPosts,
  channels: [],
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Omit<Post, "id" | "createdAt" | "updatedAt">>) => {
      const now = new Date().toISOString();
      const newPost: Post = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
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
          updatedAt: new Date().toISOString(),
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
