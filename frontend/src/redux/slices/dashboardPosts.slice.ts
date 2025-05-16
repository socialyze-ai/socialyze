import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DashboardPostType {
  _id: string;
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "scheduled";
  postStatus: "queued" | "published" | "draft" | "failed";
  scheduledTime?: string;
  handle?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterType {
  channel: string[];
  postStatus: string[];
  label: string[];
  limit: number;
  offset: number;
  filter: string;
}

interface DashboardPostsState {
  posts: DashboardPostType[];
  filters: FilterType;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: DashboardPostsState = {
  posts: [],
  filters: {
    channel: [],
    postStatus: [],
    label: [],
    limit: 10,
    offset: 0,
    filter: "latest",
  },
  isLoading: false,
  error: null,
  hasMore: true,
};

const dashboardPostsSlice = createSlice({
  name: "dashboardPosts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<DashboardPostType[]>) => {
      state.posts = action.payload;
      // If we received fewer posts than the limit, there are no more posts to fetch
      state.hasMore = action.payload.length >= state.filters.limit;
    },
    appendPosts: (state, action: PayloadAction<DashboardPostType[]>) => {
      // Add new posts while avoiding duplicates based on _id
      const existingIds = new Set(state.posts.map((post) => post._id));
      const newPosts = action.payload.filter((post) => !existingIds.has(post._id));

      state.posts = [...state.posts, ...newPosts];

      // If we received fewer posts than the limit, there are no more posts to fetch
      state.hasMore = action.payload.length >= state.filters.limit;
    },
    setFilters: (state, action: PayloadAction<FilterType>) => {
      state.filters = action.payload;
      // Reset hasMore when filters change
      state.hasMore = true;
    },
    updateFilter: (state, action: PayloadAction<Partial<FilterType>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset hasMore only when changing filters other than offset
      if (action.payload.offset === undefined || action.payload.offset === 0) {
        state.hasMore = true;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPosts, appendPosts, setFilters, updateFilter, setLoading, setError } =
  dashboardPostsSlice.actions;

export default dashboardPostsSlice.reducer;
