import axios from "axios";

export const makeRequest = async (
  url: string,
  method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE",
  data?: any,
  token?: string
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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y3YThmYjRlNDYyZWRjMWVhOTU1OTUiLCJ1c2VyRGV0YWlscyI6eyJfaWQiOiI2N2Y3YThmYjRlNDYyZWRjMWVhOTU1OTUiLCJuYW1lIjoiVGVzdCBSYW11IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkUkNoS3kvUVJNRk5qTVR5TDFKOWN6TzhsU0R6TFNYWFhOWWdnMjdzd1JKL01HZ2lETy9VMDIiLCJwcm9maWxlUGljIjoiIzI1MWYwMCIsIm90cCI6IjUxMjYwMiIsImlzVmVyaWZpZWQiOmZhbHNlLCJjcmVhdGVkQXQiOiIyMDI1LTA0LTEwVDExOjE4OjE5LjU4MVoiLCJ1cGRhdGVkQXQiOiIyMDI1LTA0LTEwVDExOjU4OjI3Ljg5OFoiLCJfX3YiOjB9LCJpYXQiOjE3NDQyODYzMDcsImV4cCI6MTc0Njg3ODMwN30.zVk1ZcOiYYXG9RoHauaoK6BZhUb_1kfgzK03SqkO5A0";
