import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken, makeRequest, ApiResponse } from "./utils";
import { BACKEND_URL } from "@/config/config";
import { AnyARecord } from "node:dns";

export interface PostType {
  _id?: string;
  channelId: string;
  text: string;
  label: string[];
  media: string[];
  postType: "postnow" | "draft" | "scheduled";
  scheduledTime?: string;
}

export interface AddPostResponse {
  _id: string;
  message: string;
}

export const useAddPost = () => {
  return useMutation<AddPostResponse, Error, PostType>({
    mutationFn: async (data: PostType) => {
      const response = await makeRequest<AddPostResponse>(
        BACKEND_URL + "post",
        "POST",
        getToken(),
        data,
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to add post");
      }

      return response.data;
    },
  });
};

export interface PostsFilter {
  channel: string[];
  postStatus: string[];
  label: string[];
  limit: number;
  offset: number;
}

export interface PostResponse {
  _id: string;
  channelId: string;
  createdBy: string;
  text: string;
  handle: string;
  postType: "postnow" | "draft" | "scheduled";
  scheduledTime: string;
  media: string[];
  label: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  failedReason: string;
}

export const useGetPost = ({ filters }: { filters: PostsFilter }) => {
  return useQuery<PostResponse[]>({
    queryKey: ["posts", filters],
    queryFn: async () => {
      const response = await makeRequest<PostResponse[]>(
        BACKEND_URL + "post/getPosts",
        "POST",
        getToken(),
        filters,
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to get posts");
      }

      return response.data;
    },
  });
};
