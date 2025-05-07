import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LOG_TOKEN, makeRequest } from "./utils";
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
  return useQuery({
    queryKey: ["tagLabels"],
    queryFn: async () => {
      const { data } = await makeRequest(BACKEND_URL + "label", "GET", "", LOG_TOKEN);
      return data as TagLabelType[];
    },
  });
};

export const useGetTagLabelById = (id: string) => {
  return useQuery({
    queryKey: ["tagLabel", id],
    queryFn: async () => {
      const { data } = await makeRequest(`${BACKEND_URL}label/${id}`, "GET", "", LOG_TOKEN);
      return data as TagLabelType;
    },
    enabled: !!id,
  });
};

export const useCreateTagLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTagLabelPayload) => {
      const { data } = await makeRequest(BACKEND_URL + "label", "POST", payload, LOG_TOKEN);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagLabels"] });
    },
  });
};

export const useUpdateTagLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTagLabelPayload }) => {
      const { data } = await makeRequest(`${BACKEND_URL}label/${id}`, "PATCH", payload, LOG_TOKEN);
      return data;
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

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await makeRequest(`${BACKEND_URL}label/${id}`, "DELETE", "", LOG_TOKEN);
      return data;
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
      const { data } = await makeRequest(BACKEND_URL + "tag/get-all-tags", "GET", "", LOG_TOKEN);
      return data;
    },
  });
};

export const useCreateTag = useCreateTagLabel;
export const useUpdateTag = useUpdateTagLabel;
export const useDeleteTag = useDeleteTagLabel;
