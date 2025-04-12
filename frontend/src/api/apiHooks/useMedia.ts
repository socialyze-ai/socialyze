import {
  UNSPALSH_ACCESS_KEY,
  UNSPLASH_API_URL,
  UNSPLASH_IMAGE_PER_PAGE,
} from "@/config/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { makeRequest } from "./utils";

interface ApiResponse {
  status: number;
  data: any;
  error: string | null;
}

interface UploadMediaData {
  files: File[];
}

export const useUploadMedia = () => {
  return useMutation<ApiResponse, unknown, UploadMediaData>({
    mutationFn: async (data) => {
      const formData = new FormData();
      data.files.forEach((file) => {
        formData.append("file", file);
      });
      const response = await makeRequest(
        `${UNSPLASH_API_URL}?client_id=${UNSPALSH_ACCESS_KEY}`,
        "POST",
        formData
      );
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};

export const useGetUnsplashMedia = (
  searchKeyword: string,
  pageNumber: number
) => {
  return useQuery<ApiResponse>({
    queryKey: ["unsplash-media", searchKeyword, pageNumber],
    queryFn: async () => {
      const response = await makeRequest(
        `${UNSPLASH_API_URL}?query=${searchKeyword}&page=${pageNumber}&per_page=${UNSPLASH_IMAGE_PER_PAGE}&client_id=${UNSPALSH_ACCESS_KEY}`,
        "GET"
      );

      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
    enabled: !!searchKeyword,
  });
};

export const useGetGiphyMedia = (searchKeyword: string, pageNumber: number) => {
  return useQuery<ApiResponse>({
    queryKey: ["giphy-media", searchKeyword, pageNumber],
    queryFn: async () => {
      const response = await makeRequest(
        `${UNSPLASH_API_URL}?query=${searchKeyword}&page=${pageNumber}&per_page=${UNSPLASH_IMAGE_PER_PAGE}&client_id=${UNSPALSH_ACCESS_KEY}`,
        "GET"
      );

      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};
