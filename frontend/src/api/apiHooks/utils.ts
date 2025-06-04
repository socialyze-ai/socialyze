type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiResponse<T> {
  status: number;
  data: T;
  error: string | null;
  message?: string;
}

interface RequestOptions {
  method: HttpMethod;
  headers: {
    Authorization: string;
    "Content-Type": string;
  };
  signal?: AbortSignal;
  body?: string;
}

export const makeRequest = async <T>(
  url: string,
  method: HttpMethod,
  token: string,
  data: any = null,
  signal: AbortSignal | undefined = undefined,
): Promise<ApiResponse<T>> => {
  const options: RequestOptions = {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    signal,
  };

  if (method !== "GET" && data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (response.status >= 500) {
      return {
        status: response.status,
        data: null as unknown as T,
        error: "Internal server error. Please try again later.",
      };
    }

    if (method === "DELETE" && response.status >= 200 && response.status < 300) {
      return {
        status: response.status,
        data: true as unknown as T,
        error: null,
      };
    }

    let responseData: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error("Request failed:", url, method, responseData);
      let errorMessage: string;

      if (Array.isArray(responseData)) {
        errorMessage = responseData[0];
      } else if (typeof responseData === "object" && responseData !== null) {
        errorMessage =
          responseData.detail ||
          responseData.message ||
          (typeof Object.values(responseData)[0] === "string"
            ? (Object.values(responseData)[0] as string)
            : null) ||
          "An error occurred";
      } else {
        errorMessage = responseData || `Request failed with status ${response.status}`;
      }

      return {
        status: response.status,
        data: null as unknown as T,
        error: errorMessage,
      };
    }

    return {
      status: response.status,
      data: responseData,
      error: null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";
    console.error("Request exception:", url, method, errorMessage);

    return {
      status: 0, // 0 indicates network error
      data: null as unknown as T,
      error: errorMessage,
    };
  }
};

export const makeFormDataRequest = async <T>(
  url: string,
  method: HttpMethod,
  token: string,
  formData: FormData,
  signal: AbortSignal | undefined = undefined,
): Promise<ApiResponse<T>> => {
  const options: any = {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Don't set Content-Type for FormData, browser will set it automatically with boundary
    },
    body: formData,
    signal,
  };

  try {
    const response = await fetch(url, options);

    if (response.status >= 500) {
      return {
        status: response.status,
        data: null as unknown as T,
        error: "Internal server error. Please try again later.",
      };
    }

    let responseData: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error("Request failed:", url, method, responseData);
      let errorMessage: string;

      if (Array.isArray(responseData)) {
        errorMessage = responseData[0];
      } else if (typeof responseData === "object" && responseData !== null) {
        errorMessage =
          responseData.detail ||
          responseData.message ||
          (typeof Object.values(responseData)[0] === "string"
            ? (Object.values(responseData)[0] as string)
            : null) ||
          "An error occurred";
      } else {
        errorMessage = responseData || `Request failed with status ${response.status}`;
      }

      return {
        status: response.status,
        data: null as unknown as T,
        error: errorMessage,
      };
    }

    return {
      status: response.status,
      data: responseData,
      error: null,
    };
  } catch (error) {
    // Handle network errors or other exceptions
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";
    console.error("Request exception:", url, method, errorMessage);

    return {
      status: 0, // 0 indicates network error
      data: null as unknown as T,
      error: errorMessage,
    };
  }
};

export const smartRequest = async <T>(
  url: string,
  method: HttpMethod,
  token: string,
  data: any = null,
  signal: AbortSignal | undefined = undefined,
): Promise<ApiResponse<T>> => {
  // Check if data is FormData
  if (data instanceof FormData) {
    return makeFormDataRequest<T>(url, method, token, data, signal);
  } else {
    return makeRequest<T>(url, method, token, data, signal);
  }
};

export const getToken = (): string => {
  return localStorage.getItem("socialyze_token") || "";
};

export const isUserAdmin = (): boolean => {
  return JSON.parse(localStorage.getItem("socialyze_user") || "{}").role === "admin";
};
