import { getToken, makeRequest } from "./utils";
import { BACKEND_URL } from "@/config/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateFontTemplates = () => {
  const createFontTemplates = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/createFontTemplates",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: createFontTemplates,
  });
};

export const useGetFontTemplates = () => {
  const getFontTemplates = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/getFontTemplates",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: getFontTemplates,
  });
};

export const useCreatePostCategoryTemplates = () => {
  const createPostCategoryTemplates = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/createPostCategoryTemplates",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: createPostCategoryTemplates,
  });
};

export const useGetPostCategoryTemplates = () => {
  const getPostCategoryTemplates = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/getPostCategoryTemplates",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: getPostCategoryTemplates,
  });
};

export const useCreatePostTemplatesDefault = () => {
  const queryClient = useQueryClient();
  const createPostTemplatesDefault = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/createPostTemplatesDefault",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: createPostTemplatesDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postTemplatesDefault"] });
      queryClient.invalidateQueries({ queryKey: ["postTemplatesCustom"] });
    },
  });
};

export const useCreatePostTemplatesCustom = () => {
  const queryClient = useQueryClient();
  const createPostTemplatesCustom = async (body) => {
    const response = await makeRequest(
      BACKEND_URL + "template/createPostTemplatesCustom",
      "POST",
      getToken(),
      body,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useMutation({
    mutationFn: createPostTemplatesCustom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postTemplatesCustom"] });
      queryClient.invalidateQueries({ queryKey: ["postTemplatesDefault"] });
    },
  });
};

export const useGetPostTemplatesDefault = (formData) => {
  const getPostTemplatesDefault = async () => {
    const response = await makeRequest(
      BACKEND_URL + "template/getPostTemplatesDefault",
      "POST",
      getToken(),
      formData,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useQuery({
    queryKey: ["postTemplatesDefault", formData],
    queryFn: () => getPostTemplatesDefault(),
    enabled: !!formData,
  });
};

export const useGetPostTemplatesCustom = (formData) => {
  const getPostTemplatesCustom = async () => {
    const response = await makeRequest(
      BACKEND_URL + "template/getPostTemplatesCustom",
      "POST",
      getToken(),
      formData,
    );

    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data;
  };

  return useQuery({
    queryKey: ["postTemplatesCustom", formData],
    queryFn: () => getPostTemplatesCustom(),
    enabled: !!formData,
  });
};
