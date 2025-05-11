import { useMutation } from "@tanstack/react-query";
import { makeRequest, getToken, ApiResponse } from "./utils";
import { BACKEND_URL } from "@/config/config";

export interface GenerateHashTagsResponse {
  text: string;
}

export interface GenerateContentRequest {
  text: string;
  action: string;
  tone?: string;
}

export interface GenerateContentItem {
  text: string[];
}

export type GenerateContentResponse = GenerateContentItem;

export const useGenerateHashTags = () => {
  const generateHashTags = async (body: { text: string }): Promise<GenerateHashTagsResponse> => {
    const response = await makeRequest<GenerateHashTagsResponse>(
      BACKEND_URL + "ai/generateHashTags",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate hashtags");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: generateHashTags,
  });
};

export const useGenerateContent = () => {
  const generateContent = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "ai/generateContent",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: generateContent,
  });
};
