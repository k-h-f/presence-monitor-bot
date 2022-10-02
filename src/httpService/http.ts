import axios, { AxiosError } from 'axios';
import { ResponseMessage } from './responseMessages';

export const httpRequest = async (method: string, url: string, body?: any) => {
  try {
    const response = await axios({ method, url, data: body });
    return response.data;
  } catch (err: AxiosError | any) {
    console.log(err.message);
    return ResponseMessage.ERROR;
  }
};
