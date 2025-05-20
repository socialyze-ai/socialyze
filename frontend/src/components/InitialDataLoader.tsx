import { useGetChannel } from "@/api/apiHooks/useChannel";
import { PostResponse, useGetPost } from "@/api/apiHooks/usePost";
import { useGetTagLabels } from "@/api/apiHooks/useTagLabel";
import { addChannels } from "@/redux/slices/channels.slice";
import { Label, setInitialLabels } from "@/redux/slices/labelManager.slice";
import { addChannels as addPostsChannels } from "@/redux/slices/posts.slice";
import { setPosts, setLoading, setError, appendPosts } from "@/redux/slices/dashboardPosts.slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAuth } from "@/context/AuthContext";

const InitialDataLoader = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const filters = useSelector((state: RootState) => state.dashboardPosts.filters);
  const currentPosts = useSelector((state: RootState) => state.dashboardPosts.posts);

  const { data: channelsData } = useGetChannel();
  const { data: apiLabels } = useGetTagLabels();
  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorDetails,
  } = useGetPost({
    filters: filters,
  });

  // Update loading state
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(setLoading(postsLoading));
  }, [postsLoading, dispatch, isAuthenticated]);

  // Update error state
  useEffect(() => {
    if (!isAuthenticated) return;
    if (postsError) {
      // Extract error message from the error object
      const errorMessage =
        postsErrorDetails instanceof Error
          ? postsErrorDetails.message
          : "An unknown error occurred";
      dispatch(setError(errorMessage));
    } else {
      dispatch(setError(null));
    }
  }, [postsError, postsErrorDetails, dispatch, isAuthenticated]);

  // Labels
  useEffect(() => {
    if (!isAuthenticated) return;
    if (apiLabels && apiLabels.length > 0) {
      const formattedLabels: Label[] = apiLabels.map((label) => ({
        id: label._id,
        name: label.name,
        color: label.color,
        selected: false,
      }));
      dispatch(setInitialLabels(formattedLabels || []));
    } else {
      dispatch(setInitialLabels([]));
    }
  }, [apiLabels, dispatch, isAuthenticated]);

  // Channels
  useEffect(() => {
    if (!isAuthenticated) return;
    if (channelsData?.data?.length) {
      const channels = channelsData.data.map((channel) => ({
        id: channel._id,
        type: channel.handle,
        name: channel.channelName,
        username: channel.channelName,
        description: "",
        profileImage: channel.channelPicture,
        connected: true,
        workspace: channel.workspace,
        channelId: channel.channelId,
      }));

      dispatch(addChannels((channels || []) as any));
      dispatch(addPostsChannels((channels || []) as any));
    } else {
      dispatch(addChannels([]));
      dispatch(addPostsChannels([]));
    }
  }, [channelsData, dispatch, isAuthenticated]);

  // Posts
  useEffect(() => {
    if (!isAuthenticated) return;
    if (postsData?.length) {
      // Ensure we're using serializable data
      const formattedPosts =
        postsData.map((post: PostResponse) => ({
          _id: post._id,
          channelId: post.channelId,
          text: post.text,
          label: post.label || [],
          media: post.media || [],
          postType: post.postType,
          postStatus: post.postStatus,
          // Store dates as ISO strings instead of Date objects
          scheduledTime: post.scheduledTime ? post.scheduledTime : null,
          handle: post.handle,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })) || [];

      // For initial load or filter changes (offset === 0), replace posts
      // For pagination (offset > 0), append posts
      if (filters.offset === 0) {
        dispatch(setPosts((formattedPosts || []) as any));
      } else {
        dispatch(appendPosts((formattedPosts || []) as any));
      }
    } else if (filters.offset === 0) {
      // Only clear posts if it's an initial load with no results
      dispatch(setPosts([]));
    } else {
      dispatch(appendPosts([]));
      dispatch(setPosts([]));
    }
  }, [postsData, dispatch, isAuthenticated, filters.offset]);

  return null;
};

export default InitialDataLoader;
