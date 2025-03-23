import axios, { AxiosResponse } from 'axios';
import { BACKEND_URL } from '../config/endpoints';

export const connectToFacebook = (dataToSend: any): Promise<AxiosResponse> => {
  const url = `${BACKEND_URL}/connect/facebook`; 

  return axios.post(url, dataToSend, { withCredentials: true });
};