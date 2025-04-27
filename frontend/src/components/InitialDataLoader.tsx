import { useGetChannel } from "@/api/apiHooks/useChannel";
import { useGetTagLabels } from "@/api/apiHooks/useTagLabel";
import { addChannels } from "@/redux/slices/channels.slice";
import { Label, setInitialLabels } from "@/redux/slices/labelManager.slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const InitialDataLoader = () => {
  const dispatch = useDispatch();
  const { data: channelsData } = useGetChannel();
  const { data: apiLabels } = useGetTagLabels();

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
    }
  }, [channelsData, dispatch]);

  return null;
};

export default InitialDataLoader;
