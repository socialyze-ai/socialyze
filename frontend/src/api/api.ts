import axios, { AxiosResponse } from 'axios';
import { Post } from '../types/types'; 
import { POST, BACKEND_URL } from '../config/endpoints';

export const createPost = (dataToSend: Post): Promise<AxiosResponse> => {
  const url = `${BACKEND_URL}/${POST}`; 

  return axios.post(url, dataToSend);
};