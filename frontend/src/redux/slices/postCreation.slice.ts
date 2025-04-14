import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { PostStatus } from "@/context/PostsContext";
import { Media } from "@/components/post/MediaUploader";
import { addHashtagsToContent } from "@/utils/formatContent"; // Import the function

// Define types for post creation
export type PostType = "post" | "reel" | "story";

export interface PostContentByChannel {
  [channelId: string]: string;
}

export interface PostTypeByChannel {
  [channelId: string]: PostType;
}

export interface HashtagGroup {
  _id: string;
  name: string;
  hashtags: string[];
}

export interface PostCreationState {
  // Common content state
  content: string;
  hashtags: string[];
  mediaUrls: Media[]; // Updated to handle multiple media
  hashtagGroups: HashtagGroup[]; // Added hashtag groups

  // Selected channels
  selectedChannels: string[];
  activeChannel: string | null;

  // Channel-specific content
  contentByChannel: PostContentByChannel;
  postTypeByChannel: PostTypeByChannel;

  // Scheduling info
  isScheduled: boolean;
  scheduledDate?: Date;
  scheduledTime: string;

  // Modal states
  isScheduleModalOpen: boolean;
  isAIAssistantOpen: boolean;
}

const initialState: PostCreationState = {
  content: "",
  hashtags: [],
  mediaUrls: [],
  selectedChannels: [],
  activeChannel: null,
  contentByChannel: {},
  postTypeByChannel: {},
  isScheduled: false,
  scheduledTime: "12:00",
  isScheduleModalOpen: false,
  hashtagGroups: [],
  isAIAssistantOpen: false,
};

const postCreationSlice = createSlice({
  name: "postCreation",
  initialState,
  reducers: {
    // Content management
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;

      // Update content for all selected channels
      state.selectedChannels.forEach((channelId) => {
        state.contentByChannel[channelId] = action.payload;
      });
    },

    setHashtags: (state, action: PayloadAction<string[]>) => {
      state.hashtags = action.payload;
      // Update content with new hashtags
      const updatedContent = addHashtagsToContent(state.content, state.hashtags);
      state.content = updatedContent;

      // Update content for all selected channels
      state.selectedChannels.forEach((channelId) => {
        state.contentByChannel[channelId] = updatedContent;
      });
    },

    addHashtag: (state, action: PayloadAction<string>) => {
      if (!state.hashtags.includes(action.payload)) {
        state.hashtags.push(action.payload);
        // Update content with the new hashtag
        const updatedContent = addHashtagsToContent(state.content, state.hashtags);
        state.content = updatedContent;

        // Update content for all selected channels
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = updatedContent;
        });
      }
    },

    removeHashtag: (state, action: PayloadAction<number>) => {
      state.hashtags.splice(action.payload, 1);
      // Update content after removing the hashtag
      const updatedContent = addHashtagsToContent(state.content, state.hashtags);
      state.content = updatedContent;

      // Update content for all selected channels
      state.selectedChannels.forEach((channelId) => {
        state.contentByChannel[channelId] = updatedContent;
      });
    },

    setMediaUrls: (state, action: PayloadAction<Media[]>) => {
      // Updated to handle multiple media
      state.mediaUrls = action.payload;
    },

    // Channel selection
    toggleChannelSelection: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;

      if (state.selectedChannels.includes(channelId)) {
        // Channel is being removed
        state.selectedChannels = state.selectedChannels.filter((id) => id !== channelId);

        // Update active channel if needed
        if (state.activeChannel === channelId) {
          state.activeChannel =
            state.selectedChannels.length > 0 ? state.selectedChannels[0] : null;
        }
      } else {
        // Channel is being added
        state.selectedChannels.push(channelId);

        // Set as active if it's the first channel
        if (state.selectedChannels.length === 1) {
          state.activeChannel = channelId;
        }

        // Sync content from existing channels to the new channel
        // Get content from an existing channel or use common content field
        const existingContent =
          state.selectedChannels.length > 1
            ? state.contentByChannel[state.selectedChannels[0]] || state.content
            : state.content;

        // Copy content to the newly added channel
        if (existingContent) {
          state.contentByChannel[channelId] = existingContent;
        }
      }
    },

    setActiveChannel: (state, action: PayloadAction<string | null>) => {
      state.activeChannel = action.payload;
    },

    // Channel-specific content
    setContentForChannel: (
      state,
      action: PayloadAction<{ channelId: string; content: string }>,
    ) => {
      const { channelId, content } = action.payload;
      state.contentByChannel[channelId] = content;
    },

    setPostTypeForChannel: (
      state,
      action: PayloadAction<{ channelId: string; postType: PostType }>,
    ) => {
      const { channelId, postType } = action.payload;
      state.postTypeByChannel[channelId] = postType;
    },

    // Scheduling
    setIsScheduled: (state, action: PayloadAction<boolean>) => {
      state.isScheduled = action.payload;
    },

    setScheduledDate: (state, action: PayloadAction<Date | undefined>) => {
      state.scheduledDate = action.payload;
    },

    setScheduledTime: (state, action: PayloadAction<string>) => {
      state.scheduledTime = action.payload;
    },

    // Modals
    setScheduleModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isScheduleModalOpen = action.payload;
    },

    setIsAIAssistantOpen: (state, action: PayloadAction<boolean>) => {
      state.isAIAssistantOpen = action.payload;
    },

    // Reset state
    resetPostCreation: (state) => {
      Object.assign(state, initialState);
    },

    // Hashtag group management
    addHashtagGroupsFromApi: (
      state,
      action: PayloadAction<{ _id: string; name: string; hashtags: string[] }[]>,
    ) => {
      const groups = action.payload;
      groups.forEach((newGroup) => {
        const existingGroupIndex = state.hashtagGroups.findIndex(
          (group) => group._id === newGroup._id,
        );

        if (existingGroupIndex !== -1) {
          // Replace the existing group with the new one
          state.hashtagGroups[existingGroupIndex] = newGroup;
        } else {
          // Add new group if it doesn't exist
          state.hashtagGroups.push(newGroup);
        }
      });
    },

    // Hashtag group management
    addHashtagGroup: (
      state,
      action: PayloadAction<{ _id: string; name: string; hashtags: string[] }>,
    ) => {
      const { _id, name, hashtags } = action.payload;
      const existingGroupIndex = state.hashtagGroups.findIndex((group) => group._id === _id);

      if (existingGroupIndex !== -1) {
        // Replace the existing group with the new one
        state.hashtagGroups[existingGroupIndex] = { _id, name, hashtags };
      } else {
        // Add new group if it doesn't exist
        state.hashtagGroups.push({ _id, name, hashtags });
      }
    },

    removeHashtagGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      state.hashtagGroups = state.hashtagGroups.filter((group) => group._id !== groupId);
    },

    insertHashtagsFromGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      const group = state.hashtagGroups.find((g) => g._id === groupId);

      if (group) {
        // Add hashtags directly to content, allowing duplicates
        group.hashtags.forEach((tag) => {
          state.hashtags.push(tag); // Allow duplicate hashtags
          state.content += ` #${tag}`; // Append hashtag directly to content
        });

        // Update content for all selected channels
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = state.content;
        });
      }
    },

    // Initialize channel content
    initializeChannelContent: (state, action: PayloadAction<string[]>) => {
      const channelIds = action.payload;

      // If there's already content in other channels, use it as default for new channels
      const existingContent =
        state.content ||
        (state.selectedChannels.length > 0 && state.contentByChannel[state.selectedChannels[0]]) ||
        "";

      channelIds.forEach((channelId) => {
        if (!state.contentByChannel[channelId]) {
          // Initialize with existing content if available
          state.contentByChannel[channelId] = existingContent;
        }

        if (!state.postTypeByChannel[channelId]) {
          state.postTypeByChannel[channelId] = "post";
        }
      });
    },

    // Add this new reducer to the slice
    syncContentAcrossChannels: (
      state,
      action: PayloadAction<{ sourceChannelId: string; content: string }>,
    ) => {
      const { sourceChannelId, content } = action.payload;

      // First update the source channel
      state.contentByChannel[sourceChannelId] = content;

      // Update the common content state as well
      state.content = content;

      // Then update all other selected channels with the same content
      state.selectedChannels.forEach((channelId) => {
        if (channelId !== sourceChannelId) {
          state.contentByChannel[channelId] = content;
        }
      });
    },
  },
});

// Selectors
export const selectPostCreation = (state: RootState) => state.postCreation;
export const selectSelectedChannels = (state: RootState) => state.postCreation.selectedChannels;
export const selectActiveChannel = (state: RootState) => state.postCreation.activeChannel;
export const selectContentByChannel = (state: RootState) => state.postCreation.contentByChannel;
export const selectPostTypeByChannel = (state: RootState) => state.postCreation.postTypeByChannel;
export const selectIsScheduled = (state: RootState) => state.postCreation.isScheduled;
export const selectHashtagGroups = (state: RootState) => state.postCreation.hashtagGroups;

export const {
  setContent,
  setHashtags,
  addHashtag,
  removeHashtag,
  setMediaUrls,
  toggleChannelSelection,
  setActiveChannel,
  setContentForChannel,
  setPostTypeForChannel,
  syncContentAcrossChannels,
  setIsScheduled,
  setScheduledDate,
  setScheduledTime,
  setScheduleModalOpen,
  setIsAIAssistantOpen,
  resetPostCreation,
  initializeChannelContent,
  addHashtagGroupsFromApi,
  addHashtagGroup,
  removeHashtagGroup,
  insertHashtagsFromGroup,
} = postCreationSlice.actions;

export default postCreationSlice.reducer;
