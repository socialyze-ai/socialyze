import { BACKEND_URL } from "@/config/config";
import axios, { AxiosResponse } from "axios";

export const connectToFacebook = (dataToSend: any): Promise<AxiosResponse> => {
  const url = `${BACKEND_URL}/connect/facebook`;

  return axios.post(url, dataToSend);
};
