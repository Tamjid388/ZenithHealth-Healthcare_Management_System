import { ApiResponse } from "@/types/api.types";
import axios from "axios";

const Api_Url = process.env.NEXT_PUBLIC_API_URL;

if (!Api_Url) {
  throw new Error("API_URL is not set");
}

const axiosInstance = () => {
  const Instance = axios.create({
    baseURL: Api_Url,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return Instance;
};

export interface apiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const httpGet = async <T>(
  endpoint: string,
  options: apiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance().get<ApiResponse<T>>(endpoint, {
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    console.error(`GET request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const httpPost = async <T>(
  endpoint: string,
  body: unknown,
  options: apiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance().post<ApiResponse<T>>(
      endpoint,
      body,
      {
        params: options.params,
        headers: options.headers,
      },
    );
    return response.data;
  } catch (error) {
    console.error(`POST request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const httpPut = async <T>(
  endpoint: string,
  body: unknown,
  options: apiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance().put<ApiResponse<T>>(endpoint, body, {
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    console.error(`PUT request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const httpPatch = async <T>(
  endpoint: string,
  body: unknown,
  options: apiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance().patch<ApiResponse<T>>(
      endpoint,
      body,
      {
        params: options.params,
        headers: options.headers,
      },
    );
    return response.data;
  } catch (error) {
    console.error(`PATCH request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const httpDelete = async <T>(
  endpoint: string,
  options: apiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance().delete<ApiResponse<T>>(endpoint, {
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    console.error(`DELETE request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};
