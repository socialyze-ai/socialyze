import { BACKEND_URL } from "@/config/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LOG_TOKEN, makeRequest } from "./utils";

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await makeRequest(
        BACKEND_URL + "media/uploadMedia",
        "POST",
        data,
        LOG_TOKEN,
      );
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};

interface GetImagesPayload {
  provider: string;
  search: string;
  page: number;
  limit: number;
  order: string;
}

export const useGetImages = (filters?: GetImagesPayload) => {
  return useQuery({
    queryKey: ["media", filters],
    queryFn: async () => {
      return await makeRequest(BACKEND_URL + "media/getImages", "POST", filters, LOG_TOKEN);
    },
    enabled: !!filters,
  });
};

export const useUploadUnsplashMedia = () => {
  const uploadUnsplashMedia = async (body: { url: string; postId: string }) => {
    const { data } = await makeRequest(
      BACKEND_URL + "media/uploadMediaForUnsplash",
      "POST",
      body,
      LOG_TOKEN,
    );
    return data;
  };

  return useMutation({
    mutationFn: uploadUnsplashMedia,
  });
};
