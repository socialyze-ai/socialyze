import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
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

export interface MediaByChannel {
  [channelId: string]: Media[];
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
  mediaByChannel: MediaByChannel;
  isContentSynced: boolean;
  isCustomContent: boolean;

  // Scheduling info
  isScheduled: boolean;
  scheduledDate: Date | null;
  scheduledTime: string;

  // Modal states
  isAIAssistantOpen: boolean;
  isTemplateSectionOpen: boolean;
}

const initialState: PostCreationState = {
  content: "",
  hashtags: [],
  mediaUrls: [],
  selectedChannels: [],
  activeChannel: null,
  contentByChannel: {},
  postTypeByChannel: {},
  mediaByChannel: {},
  isContentSynced: true,
  isCustomContent: false,
  isScheduled: false,
  scheduledDate: null,
  scheduledTime: "12:00",
  isAIAssistantOpen: false,
  isTemplateSectionOpen: false,
  hashtagGroups: [],
};

const postCreationSlice = createSlice({
  name: "postCreation",
  initialState,
  reducers: {
    // Content management
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;

      // Update content for all selected channels if content is synced
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = action.payload;
        });
      }
    },

    setHashtags: (state, action: PayloadAction<string[]>) => {
      state.hashtags = action.payload;
      // Update content with new hashtags
      const updatedContent = addHashtagsToContent(state.content, state.hashtags);
      state.content = updatedContent;

      // Update content for all selected channels if content is synced
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = updatedContent;
        });
      }
    },

    addHashtag: (state, action: PayloadAction<string>) => {
      if (!state.hashtags.includes(action.payload)) {
        state.hashtags.push(action.payload);
        // Update content with the new hashtag
        const updatedContent = addHashtagsToContent(state.content, state.hashtags);
        state.content = updatedContent;

        // Update content for all selected channels if content is synced
        if (state.isContentSynced) {
          state.selectedChannels.forEach((channelId) => {
            state.contentByChannel[channelId] = updatedContent;
          });
        }
      }
    },

    removeHashtag: (state, action: PayloadAction<number>) => {
      state.hashtags.splice(action.payload, 1);
      // Update content after removing the hashtag
      const updatedContent = addHashtagsToContent(state.content, state.hashtags);
      state.content = updatedContent;

      // Update content for all selected channels if content is synced
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = updatedContent;
        });
      }
    },

    setMediaUrls: (state, action: PayloadAction<Media[]>) => {
      // Always update the global mediaUrls state for UI display purposes
      state.mediaUrls = action.payload;

      // In synced mode, propagate media to all selected channels
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          state.mediaByChannel[channelId] = [...action.payload];
        });
      }
      // In unsynced mode, only update the active channel if one is selected
      else if (state.activeChannel) {
        state.mediaByChannel[state.activeChannel] = [...action.payload];
      }
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

          // Update mediaUrls display state if there's a new active channel
          if (state.activeChannel && !state.isContentSynced) {
            state.mediaUrls = [...(state.mediaByChannel[state.activeChannel] || [])];
          }
        }
      } else {
        // Channel is being added
        state.selectedChannels.push(channelId);

        // Set as active if it's the first channel
        if (state.selectedChannels.length === 1) {
          state.activeChannel = channelId;
        }

        // Initialize content and media for the new channel
        if (state.isContentSynced) {
          // Sync content from existing channels to the new channel
          const existingContent =
            state.selectedChannels.length > 1
              ? state.contentByChannel[state.selectedChannels[0]] || state.content
              : state.content;

          // Copy content to the newly added channel
          if (existingContent) {
            state.contentByChannel[channelId] = existingContent;
          }

          // Copy media to the newly added channel
          if (state.mediaUrls.length > 0) {
            state.mediaByChannel[channelId] = [...state.mediaUrls];
          } else {
            state.mediaByChannel[channelId] = [];
          }
        } else {
          // Initialize with empty content when not synced
          state.contentByChannel[channelId] = "";
          state.mediaByChannel[channelId] = [];
        }
      }
    },

    setActiveChannel: (state, action: PayloadAction<string | null>) => {
      state.activeChannel = action.payload;

      // When changing active channel in unsynced mode, update the mediaUrls for display
      if (action.payload && !state.isContentSynced) {
        const channelMedia = state.mediaByChannel[action.payload];
        if (channelMedia) {
          state.mediaUrls = [...channelMedia];
        } else {
          state.mediaUrls = [];
        }
      }
    },

    // Channel-specific content
    setContentForChannel: (
      state,
      action: PayloadAction<{ channelId: string; content: string }>,
    ) => {
      const { channelId, content } = action.payload;
      state.contentByChannel[channelId] = content;
    },

    setMediaForChannel: (state, action: PayloadAction<{ channelId: string; media: Media[] }>) => {
      const { channelId, media } = action.payload;

      // Update channel-specific media with a deep copy
      state.mediaByChannel[channelId] = [...media];

      // If this is for the active channel, also update the display state
      if (state.activeChannel === channelId) {
        state.mediaUrls = [...media];
      }

      // If in synced mode, propagate to all channels
      if (state.isContentSynced) {
        state.selectedChannels.forEach((cId) => {
          if (cId !== channelId) {
            state.mediaByChannel[cId] = [...media];
          }
        });
      }
    },

    setPostTypeForChannel: (
      state,
      action: PayloadAction<{ channelId: string; postType: PostType }>,
    ) => {
      const { channelId, postType } = action.payload;
      state.postTypeByChannel[channelId] = postType;
    },

    // Sync/Unsync content
    setContentSyncState: (state, action: PayloadAction<boolean>) => {
      state.isContentSynced = action.payload;
      state.isCustomContent = !action.payload;

      if (action.payload && state.selectedChannels.length > 0) {
        // If syncing content and there are selected channels
        const firstChannelId = state.selectedChannels[0];
        const firstChannelContent = state.contentByChannel[firstChannelId] || "";
        const firstChannelMedia = state.mediaByChannel[firstChannelId] || [];

        // Set the first channel's content to the main content
        state.content = firstChannelContent;
        state.mediaUrls = [...firstChannelMedia];

        // Sync the first channel's content to all other channels
        state.selectedChannels.forEach((channelId) => {
          state.contentByChannel[channelId] = firstChannelContent;
          state.mediaByChannel[channelId] = [...firstChannelMedia];
        });
      }
      // If unsyncing and there's an active channel, set the mediaUrls to that channel's media
      else if (!action.payload && state.activeChannel) {
        state.mediaUrls = [...(state.mediaByChannel[state.activeChannel] || [])];
      }
    },

    // Scheduling
    setIsScheduled: (state, action: PayloadAction<boolean>) => {
      state.isScheduled = action.payload;
    },

    setScheduledDate: (state, action: PayloadAction<Date | null>) => {
      state.scheduledDate = action.payload;
    },

    setScheduledTime: (state, action: PayloadAction<string>) => {
      state.scheduledTime = action.payload;
    },

    // Modals
    setIsAIAssistantOpen: (state, action: PayloadAction<boolean>) => {
      state.isAIAssistantOpen = action.payload;
      if (action.payload) {
        state.isTemplateSectionOpen = false;
      }
    },

    setIsTemplateSectionOpen: (state, action: PayloadAction<boolean>) => {
      state.isTemplateSectionOpen = action.payload;
      if (action.payload) {
        state.isAIAssistantOpen = false;
      }
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

        // Update content for all selected channels if synced
        if (state.isContentSynced) {
          state.selectedChannels.forEach((channelId) => {
            state.contentByChannel[channelId] = state.content;
          });
        }
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

        if (!state.mediaByChannel[channelId]) {
          state.mediaByChannel[channelId] = [...state.mediaUrls];
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
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          if (channelId !== sourceChannelId) {
            state.contentByChannel[channelId] = content;
          }
        });
      }
    },

    // New action to sync media across channels from a source channel
    syncMediaAcrossChannels: (
      state,
      action: PayloadAction<{ sourceChannelId: string; media: Media[] }>,
    ) => {
      const { sourceChannelId, media } = action.payload;

      // Always update the source channel
      state.mediaByChannel[sourceChannelId] = [...media];

      // Update the global media state
      state.mediaUrls = [...media];

      // If in synced mode, propagate to all other channels
      if (state.isContentSynced) {
        state.selectedChannels.forEach((channelId) => {
          if (channelId !== sourceChannelId) {
            state.mediaByChannel[channelId] = [...media];
          }
        });
      }
    },

    setSelectedChannels: (state, action: PayloadAction<string[]>) => {
      state.selectedChannels = action.payload;
    },
  },
});

// Selectors
export const selectPostCreation = (state: RootState) => state.postCreation;
export const selectSelectedChannels = (state: RootState) => state.postCreation.selectedChannels;
export const selectActiveChannel = (state: RootState) => state.postCreation.activeChannel;
export const selectContentByChannel = (state: RootState) => state.postCreation.contentByChannel;
export const selectMediaByChannel = (state: RootState) => state.postCreation.mediaByChannel;
export const selectPostTypeByChannel = (state: RootState) => state.postCreation.postTypeByChannel;
export const selectIsScheduled = (state: RootState) => state.postCreation.isScheduled;
export const selectHashtagGroups = (state: RootState) => state.postCreation.hashtagGroups;
export const selectIsContentSynced = (state: RootState) => state.postCreation.isContentSynced;
export const selectIsCustomContent = (state: RootState) => state.postCreation.isCustomContent;

export const {
  setContent,
  setHashtags,
  addHashtag,
  removeHashtag,
  setMediaUrls,
  toggleChannelSelection,
  setActiveChannel,
  setContentForChannel,
  setMediaForChannel,
  setPostTypeForChannel,
  syncContentAcrossChannels,
  syncMediaAcrossChannels,
  setIsScheduled,
  setScheduledDate,
  setScheduledTime,
  setIsAIAssistantOpen,
  setIsTemplateSectionOpen,
  resetPostCreation,
  initializeChannelContent,
  addHashtagGroupsFromApi,
  addHashtagGroup,
  removeHashtagGroup,
  insertHashtagsFromGroup,
  setContentSyncState,
  setSelectedChannels,
} = postCreationSlice.actions;

export default postCreationSlice.reducer;
