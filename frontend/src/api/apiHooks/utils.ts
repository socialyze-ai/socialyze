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

export const HARD_CODED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2UyNDE1ZjJmMjczYjdkNGRiOWU2NGYiLCJ1c2VyRGV0YWlscyI6eyJfaWQiOiI2N2UyNDE1ZjJmMjczYjdkNGRiOWU2NGYiLCJuYW1lIjoiYXNkYXNkIiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEwJHRtZHA3WmVNTEkyb2VkR2J4NzMvWnVJVm9scjhDdlJnR1A4RUJGSkhpc0lQZGpJNW5JdDNlIiwicHJvZmlsZVBpYyI6IiNjNDQ3MTIiLCJvdHAiOiI5NDUxNjAiLCJpc1ZlcmlmaWVkIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI1LTAzLTI1VDA1OjM4OjM5LjI4NloiLCJ1cGRhdGVkQXQiOiIyMDI1LTAzLTI1VDA1OjUzOjQyLjEwOVoiLCJfX3YiOjB9LCJpYXQiOjE3NDYyNjE4MDgsImV4cCI6MTc0ODg1MzgwOH0.3P0flPtVJvnCjKIwrAE18nrh1NPu7ZSpqRTTj0SbSos";
