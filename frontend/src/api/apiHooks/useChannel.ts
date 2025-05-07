import { useMutation, useQuery } from "@tanstack/react-query";
import { LOG_TOKEN, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";

export const useChannelAuth = () => {
  return useMutation({
    mutationFn: async (body: { handle: string }) => {
      const { data } = await makeRequest(
        BACKEND_URL + "channel/getAuthUrl",
        "POST",
        body,
        LOG_TOKEN,
      );
      return data;
    },
  });
};

// Updated mock data with better structure for SocialChannel compatibility
const mockChannels = {
  status: "success",
  data: [
    {
      _id: "101",
      handle: "facebook",
      user: "user123",
      workspace: "workspace1",
      channelId: "fb_channel_1",
      channelName: "Facebook Business",
      channelPicture: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      _id: "102",
      handle: "instagram",
      user: "user123",
      workspace: "workspace1",
      channelId: "ig_channel_1",
      channelName: "Instagram Profile",
      channelPicture: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      _id: "103",
      handle: "x",
      user: "user123",
      workspace: "workspace1",
      channelId: "tw_channel_1",
      channelName: "X Account",
      channelPicture: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      _id: "104",
      handle: "linkedin",
      user: "user123",
      workspace: "workspace1",
      channelId: "li_channel_1",
      channelName: "LinkedIn Profile",
      channelPicture: "https://randomuser.me/api/portraits/women/4.jpg",
    },
  ],
  error: null,
  message: "Mock channels data fetched successfully",
};

export const useGetChannel = (isMockData: boolean = false) => {
  const query = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      if (isMockData) {
        return mockChannels;
      }
      return await makeRequest(BACKEND_URL + "channel", "GET", "", LOG_TOKEN);
    },
  });

  return query;
};
