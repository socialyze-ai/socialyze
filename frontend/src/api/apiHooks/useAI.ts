import { useMutation } from "@tanstack/react-query";
import { HARD_CODED_TOKEN, makeRequest } from "./utils";
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
    const { data } = await makeRequest(
      BACKEND_URL + "ai/generateHashTags",
      "POST",
      body,
      HARD_CODED_TOKEN,
    );
    return data;
  };

  return useMutation({
    mutationFn: generateHashTags,
  });
};

export const useGenerateContent = () => {
  const generateContent = async (body: GenerateContentRequest) => {
    const { data } = await makeRequest(
      BACKEND_URL + "ai/generateContent",
      "POST",
      body,
      HARD_CODED_TOKEN,
    );
    return data;
  };

  return useMutation({
    mutationFn: generateContent,
  });
};
