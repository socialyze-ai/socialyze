import { BACKEND_URL } from "@/config/config";
import { makeRequest, ApiResponse, getToken } from "./utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useLogin = () => {
  return useMutation<ApiResponse<AuthResponse>, Error, LoginData>({
    mutationFn: async (data) => {
      const response = await makeRequest<AuthResponse>(
        BACKEND_URL + "user/login",
        "POST",
        "",
        data,
      );
      return response;
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error, {
          position: "top-center",
        });
        return;
      }

      // Success case
      if (data.data?.message) {
        toast.success(data.data.message, {
          position: "top-center",
        });
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });
};

export const useSignup = () => {
  return useMutation<ApiResponse<AuthResponse>, Error, SignupData>({
    mutationFn: async (data) => {
      const response = await makeRequest<AuthResponse>(
        BACKEND_URL + "user/register",
        "POST",
        "",
        data,
      );
      return response;
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error, {
          position: "top-center",
        });
        return;
      }

      // Success case
      if (data.data?.message) {
        toast.success(data.data.message, {
          position: "top-center",
        });
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });
};
