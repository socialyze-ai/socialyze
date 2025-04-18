import { useMutation } from "@tanstack/react-query";
import { HARD_CODED_TOKEN, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";

export const useGenerateHashTags = () => {
  const generateHashTags = async (body: { text: string }) => {
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
  const generateContent = async (body: { text: string; action: string; tone?: string }) => {
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
