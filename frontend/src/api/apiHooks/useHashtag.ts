import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, makeRequest, ApiResponse } from "./utils";
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
      const response = await makeRequest<HashtagManagerType[]>(
        BACKEND_URL + "hashtagManager",
        "GET",
        getToken(),
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to get hashtag managers");
      }

      return response.data;
    },
  });
};

export const useGetHashtagManagerById = (id: string) => {
  return useQuery({
    queryKey: ["hashtagManager", id],
    queryFn: async () => {
      const response = await makeRequest<HashtagManagerType>(
        `${BACKEND_URL}hashtagManager/${id}`,
        "GET",
        getToken(),
      );

      if (response.error || !response.data) {
        throw new Error(response.error || `Failed to get hashtag manager with id ${id}`);
      }

      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateHashtagManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateHashtagManagerPayload) => {
      const response = await makeRequest(
        BACKEND_URL + "hashtagManager",
        "POST",
        getToken(),
        payload,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
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
      const response = await makeRequest(
        `${BACKEND_URL}hashtagManager/${id}`,
        "PATCH",
        getToken(),
        payload,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
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
      const response = await makeRequest(
        `${BACKEND_URL}hashtagManager/${id}`,
        "DELETE",
        getToken(),
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
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
      const response = await makeRequest(
        BACKEND_URL + "hashtag/get-all-hashtags",
        "GET",
        getToken(),
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
  });
};

export const useCreateHashtag = useCreateHashtagManager;
export const useUpdateHashtag = useUpdateHashtagManager;
export const useDeleteHashtag = useDeleteHashtagManager;
