import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, makeRequest, ApiResponse } from "./utils";
import { BACKEND_URL } from "@/config/config";

export interface TagLabelType {
  _id: string;
  name: string;
  createdBy: string;
  workspace: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTagLabelPayload {
  name: string;
  workspace: string;
  color: string;
}

export interface UpdateTagLabelPayload {
  name?: string;
  color?: string;
}

export const useGetTagLabels = () => {
  return useQuery<TagLabelType[]>({
    queryKey: ["tagLabels"],
    queryFn: async () => {
      const response = await makeRequest<TagLabelType[]>(BACKEND_URL + "label", "GET", getToken());

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to get tag labels");
      }

      return response.data;
    },
  });
};

export const useGetTagLabelById = (id: string) => {
  return useQuery<TagLabelType>({
    queryKey: ["tagLabel", id],
    queryFn: async () => {
      const response = await makeRequest<TagLabelType>(
        `${BACKEND_URL}label/${id}`,
        "GET",
        getToken(),
      );

      if (response.error || !response.data) {
        throw new Error(response.error || `Failed to get tag label with id ${id}`);
      }

      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTagLabel = () => {
  const queryClient = useQueryClient();

  return useMutation<TagLabelType, Error, CreateTagLabelPayload>({
    mutationFn: async (payload: CreateTagLabelPayload) => {
      const response = await makeRequest<TagLabelType>(
        BACKEND_URL + "label",
        "POST",
        getToken(),
        payload,
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to create tag label");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagLabels"] });
    },
  });
};

export const useUpdateTagLabel = () => {
  const queryClient = useQueryClient();

  return useMutation<TagLabelType, Error, { id: string; payload: UpdateTagLabelPayload }>({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTagLabelPayload }) => {
      const response = await makeRequest<TagLabelType>(
        `${BACKEND_URL}label/${id}`,
        "PATCH",
        getToken(),
        payload,
      );

      if (response.error || !response.data) {
        throw new Error(response.error || `Failed to update tag label with id ${id}`);
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tagLabels"] });
      queryClient.invalidateQueries({
        queryKey: ["tagLabel", variables.id],
      });
    },
  });
};

export const useDeleteTagLabel = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (id: string) => {
      const response = await makeRequest(`${BACKEND_URL}label/${id}`, "DELETE", getToken());

      if (response.error) {
        throw new Error(response.error || `Failed to delete tag label with id ${id}`);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagLabels"] });
    },
  });
};

export const useGetTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await makeRequest(BACKEND_URL + "tag/get-all-tags", "GET", getToken());

      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to get tags");
      }

      return response.data;
    },
  });
};

export const useCreateTag = useCreateTagLabel;
export const useUpdateTag = useUpdateTagLabel;
export const useDeleteTag = useDeleteTagLabel;
