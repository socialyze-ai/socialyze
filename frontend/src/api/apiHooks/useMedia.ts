import { BACKEND_URL } from "@/config/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken, makeRequest, ApiResponse } from "./utils";

export interface MediaUploadResponse {
  url: string;
  mediaId: string;
}

export const useUploadMedia = () => {
  return useMutation<ApiResponse<MediaUploadResponse>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      return await makeRequest<MediaUploadResponse>(
        BACKEND_URL + "media/uploadMedia",
        "POST",
        getToken(),
        data,
      );
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

export interface ImageResult {
  id: string;
  thumb: string;
  full: string;
  description: string;
  author: string;
  authorLink: string;
}

export interface GetImagesResponse {
  media: any[];
  total: number;
  unsplash_url?: string;
  page?: number;
  limit?: number;
}

export const useGetImages = (filters?: GetImagesPayload) => {
  return useQuery<ApiResponse<GetImagesResponse | any>>({
    queryKey: ["media", filters],
    queryFn: async () => {
      return await makeRequest<GetImagesResponse | any>(
        BACKEND_URL + "media/getImages",
        "POST",
        getToken(),
        filters,
      );
    },
    enabled: !!filters,
  });
};

export interface UnsplashUploadResponse {
  url: string;
  mediaId: string;
}

export const useUploadUnsplashMedia = () => {
  const uploadUnsplashMedia = async (body: { url: string; postId: string }) => {
    const response = await makeRequest<UnsplashUploadResponse>(
      BACKEND_URL + "media/uploadMediaForUnsplash",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to upload Unsplash media");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: uploadUnsplashMedia,
  });
};
