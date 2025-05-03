import { useGetChannel } from "@/api/apiHooks/useChannel";
import { useGetPost } from "@/api/apiHooks/usePost";
import { useGetTagLabels } from "@/api/apiHooks/useTagLabel";
import { addChannels } from "@/redux/slices/channels.slice";
import { Label, setInitialLabels } from "@/redux/slices/labelManager.slice";
import { addChannels as addPostsChannels } from "@/redux/slices/posts.slice";
import { setPosts, setLoading, setError } from "@/redux/slices/dashboardPosts.slice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const InitialDataLoader = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.dashboardPosts.filters);

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
    dispatch(setLoading(postsLoading));
  }, [postsLoading, dispatch]);

  // Update error state
  useEffect(() => {
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
  }, [postsError, postsErrorDetails, dispatch]);

  useEffect(() => {
    if (apiLabels && apiLabels.length > 0) {
      const formattedLabels: Label[] = apiLabels.map((label) => ({
        id: label._id,
        name: label.name,
        color: label.color,
        selected: false,
      }));
      dispatch(setInitialLabels(formattedLabels));
    }
  }, [apiLabels, dispatch]);

  useEffect(() => {
    if (channelsData?.data?.length) {
      const channels = channelsData.data.map((channel: any) => ({
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

      dispatch(addChannels(channels));
      dispatch(addPostsChannels(channels));
    }
  }, [channelsData, dispatch]);

  useEffect(() => {
    if (postsData?.data) {
      // Use the API response format directly, keeping only the necessary fields
      const formattedPosts = postsData.data.map((post: any) => ({
        _id: post._id,
        channelId: post.channelId,
        text: post.text,
        label: post.label || [],
        media: post.media || [],
        postType: post.postType,
        postStatus: post.postStatus,
        scheduledTime: post.scheduledTime,
        handle: post.handle,
      }));

      dispatch(setPosts(formattedPosts));
    }
  }, [postsData, dispatch]);

  return null;
};

export default InitialDataLoader;
