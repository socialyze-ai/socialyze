import { BACKEND_URL } from "@/config/config";
import { makeRequest } from "./utils";
import { useMutation } from "@tanstack/react-query";

interface ApiResponse {
  status: number;
  data: any;
  error: string | null;
}

export const useLogin = () => {
  return useMutation<ApiResponse>({
    mutationFn: async (data) => {
      const response = await makeRequest(
        BACKEND_URL + "user/login",
        "POST",
        data
      );
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};

export const useSignup = () => {
  return useMutation<ApiResponse>({
    mutationFn: async (data) => {
      const response = await makeRequest(
        BACKEND_URL + "user/signup",
        "POST",
        data
      );
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};

export const useLogout = () => {
  return useMutation<ApiResponse>({
    mutationFn: async () => {
      const response = await makeRequest(BACKEND_URL + "user/logout", "POST");
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};
