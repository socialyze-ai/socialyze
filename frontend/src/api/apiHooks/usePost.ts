import { useMutation } from "@tanstack/react-query";
import { HARD_CODED_TOKEN } from "./utils";
import { BACKEND_URL } from "@/config/config";
import { makeRequest } from "./utils";

export const useAddPost = () => {
  const addPost = async (body: any): Promise<any> => {
    const { data } = await makeRequest(BACKEND_URL + "post", "POST", body, HARD_CODED_TOKEN);
    return data;
  };

  return useMutation({
    mutationFn: addPost,
  });
};
