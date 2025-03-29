import axios, { AxiosResponse } from "axios";
import { Post } from "../types/types";
import { BACKEND_URL, POST } from "../config/config";

export const createPost = (dataToSend: Post): Promise<AxiosResponse> => {
  const url = `${BACKEND_URL}/${POST}`;

  return axios.post(url, dataToSend);
};
