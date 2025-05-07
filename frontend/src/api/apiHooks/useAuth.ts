import { BACKEND_URL } from "@/config/config";
import { makeRequest } from "./utils";
import { useMutation } from "@tanstack/react-query";

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface ApiResponse {
  status: number;
  data: any;
  error: string | null;
}

export const useLogin = () => {
  return useMutation<ApiResponse>({
    mutationFn: async (data) => {
      const response = await makeRequest(BACKEND_URL + "user/login", "POST", data);
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
      const response = await makeRequest(BACKEND_URL + "user/register", "POST", data);
      return {
        status: response.status,
        data: response.data,
        error: response.error || null,
      };
    },
  });
};
