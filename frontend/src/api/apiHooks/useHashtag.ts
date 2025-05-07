import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LOG_TOKEN, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";

export interface HashtagManagerType {
  _id: string;
  name: string;
  workspace: string;
  hashtags: string[];
}

export interface CreateHashtagManagerPayload {
  name: string;
  workspace: string;
  hashtags: string[];
}

export interface UpdateHashtagManagerPayload {
  name?: string;
  hashtags?: string[];
}

export const useGetHashtagManagers = () => {
  return useQuery({
    queryKey: ["hashtagManagers"],
    queryFn: async () => {
      const { data } = await makeRequest(BACKEND_URL + "hashtagManager", "GET", "", LOG_TOKEN);
      return data as HashtagManagerType[];
    },
  });
};

export const useGetHashtagManagerById = (id: string) => {
  return useQuery({
    queryKey: ["hashtagManager", id],
    queryFn: async () => {
      const { data } = await makeRequest(
        `${BACKEND_URL}hashtagManager/${id}`,
        "GET",
        "",
        LOG_TOKEN,
      );
      return data as HashtagManagerType;
    },
    enabled: !!id,
  });
};

export const useCreateHashtagManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHashtagManagerPayload) => {
      const { data } = await makeRequest(
        BACKEND_URL + "hashtagManager",
        "POST",
        payload,
        LOG_TOKEN,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hashtagManagers"] });
    },
  });
};

export const useUpdateHashtagManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateHashtagManagerPayload }) => {
      const { data } = await makeRequest(
        `${BACKEND_URL}hashtagManager/${id}`,
        "PATCH",
        payload,
        LOG_TOKEN,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hashtagManagers"] });
      queryClient.invalidateQueries({
        queryKey: ["hashtagManager", variables.id],
      });
    },
  });
};

export const useDeleteHashtagManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await makeRequest(
        `${BACKEND_URL}hashtagManager/${id}`,
        "DELETE",
        "",
        LOG_TOKEN,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hashtagManagers"] });
    },
  });
};

export const useGetHashtags = () => {
  return useQuery({
    queryKey: ["hashtags"],
    queryFn: async () => {
      const { data } = await makeRequest(
        BACKEND_URL + "hashtag/get-all-hashtags",
        "GET",
        "",
        LOG_TOKEN,
      );
      return data;
    },
  });
};

export const useCreateHashtag = useCreateHashtagManager;
export const useUpdateHashtag = useUpdateHashtagManager;
export const useDeleteHashtag = useDeleteHashtagManager;
