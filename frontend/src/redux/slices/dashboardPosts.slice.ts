import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PostType {
  _id: string;
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "schedule";
  postStatus: "queued" | "sent" | "failed" | "published";
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
}

interface DashboardPostsState {
  posts: PostType[];
  filters: FilterType;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardPostsState = {
  posts: [],
  filters: {
    channel: [],
    postStatus: [],
    label: [],
    limit: 10,
    offset: 0,
  },
  isLoading: false,
  error: null,
};

const dashboardPostsSlice = createSlice({
  name: "dashboardPosts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostType[]>) => {
      state.posts = action.payload;
    },
    setFilters: (state, action: PayloadAction<FilterType>) => {
      state.filters = action.payload;
    },
    updateFilter: (state, action: PayloadAction<Partial<FilterType>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPosts, setFilters, updateFilter, setLoading, setError } =
  dashboardPostsSlice.actions;

export default dashboardPostsSlice.reducer;
