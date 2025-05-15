import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, makeRequest, ApiResponse } from "./utils";
import { BACKEND_URL } from "@/config/config";

export interface OAuthPayload {
  authCode: string;
  state: string;
}

export interface OAuthResponse {
  success: boolean;
  message: string;
}

export const useOAuthHandler = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<OAuthResponse>, Error, OAuthPayload>({
    mutationFn: async (payload: OAuthPayload) => {
      return await makeRequest<OAuthResponse>(
        BACKEND_URL + "channel/authenticate",
        "POST",
        getToken(),
        payload,
      );
    },
    onSuccess: async (response) => {
      if (response.error) {
        throw new Error(response.error);
      }
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
};
