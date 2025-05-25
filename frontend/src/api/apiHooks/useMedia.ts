import { BACKEND_URL } from "@/config/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken, makeRequest, smartRequest, ApiResponse } from "./utils";

export interface MediaUploadResponse {
  url: string;
  mediaId: string;
}

export interface MultipleMediaUploadResponse {
  urls: string[];
}

export const useUploadMedia = () => {
  return useMutation<ApiResponse<MediaUploadResponse>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      return await smartRequest<MediaUploadResponse>(
        BACKEND_URL + "media/uploadMedia",
        "POST",
        getToken(),
        data,
      );
    },
  });
};

export const useUploadMultipleMedia = () => {
  return useMutation<ApiResponse<MultipleMediaUploadResponse>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      return await smartRequest<MultipleMediaUploadResponse>(
        BACKEND_URL + "media/uploadMultipleMedia",
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

export interface UploadMediaWithLinkResponse {
  url: string;
  mediaId: string;
}

export const useUploadUnsplashMedia = () => {
  const uploadUnsplashMedia = async (body: { url: string; postId: string }) => {
    const response = await makeRequest<UploadMediaWithLinkResponse>(
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

export const useUploadMediaWithLink = () => {
  const uploadMediaWithLink = async (body: { url: string; postId: string }) => {
    const response = await makeRequest<UploadMediaWithLinkResponse>(
      BACKEND_URL + "media/uploadMediaWithLink",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to upload media with link");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: uploadMediaWithLink,
  });
};
