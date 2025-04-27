import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HARD_CODED_TOKEN, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";

export const useOAuthHandler = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { authCode: string; state: string }) => {
      const { data } = await makeRequest(
        BACKEND_URL + "channel/authenticate",
        "POST",
        payload,
        HARD_CODED_TOKEN,
      );
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
};
