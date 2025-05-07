import axios from "axios";

export const makeRequest = async (
  url: string,
  method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE",
  data?: any,
  token?: string,
): Promise<{ status: number; data: any; error?: any }> => {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      status: response.status,
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      error: error.message,
    };
  }
};

export const LOG_TOKEN = localStorage.getItem("socialyze_token");
