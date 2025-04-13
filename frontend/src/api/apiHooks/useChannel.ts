import { useMutation, useQuery } from "@tanstack/react-query";
import { HARD_CODED_TOKEN, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";

export const useChannelAuth = () => {
  return useMutation({
    mutationFn: async (body: { handle: string }) => {
      const { data } = await makeRequest(
        BACKEND_URL + "channel/getAuthUrl",
        "POST",
        body,
        HARD_CODED_TOKEN,
      );
      return data;
    },
  });
};

export const useGetChannel = () => {
  const query = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      return await makeRequest(BACKEND_URL + "channel", "GET", "", HARD_CODED_TOKEN);
    },
  });

  return query;
};
