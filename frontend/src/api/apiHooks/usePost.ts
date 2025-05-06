import { useMutation, useQuery } from "@tanstack/react-query";
import { HARD_CODED_TOKEN } from "./utils";
import { BACKEND_URL } from "@/config/config";
import { makeRequest } from "./utils";

export const useAddPost = () => {
  const addPost = async (body: any): Promise<any> => {
    const { data } = await makeRequest(BACKEND_URL + "post", "POST", body, HARD_CODED_TOKEN);
    return data;
  };

  return useMutation({
    mutationFn: addPost,
  });
};

interface PostType {
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "schedule";
  postStatus: "queued" | "sent" | "failed" | "published";
  scheduledTime?: string;
}

export const useGetPost = ({
  filters,
}: {
  filters: {
    channel: string[];
    postStatus: string[];
    label: string[];
    limit: number;
    offset: number;
  };
}) => {
  const query = useQuery({
    queryKey: ["posts", filters],
    queryFn: async () => {
      return await makeRequest(BACKEND_URL + "post/getPosts", "POST", filters, HARD_CODED_TOKEN);
    },
  });

  return query;
};
