import { ApiResponse } from "@/types/api.types";
import axios from "axios";
import { isTokenExpiringSoon } from "../tokenUtils";
import { cookies, headers } from "next/headers";
import { getNewRefeshToken } from "@/services/auth.service";

const Api_Url = process.env.NEXT_PUBLIC_API_URL;

if (!Api_Url) {
  throw new Error("API_URL is not set");
}

export const tryRefreshToken = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  if (!isTokenExpiringSoon(accessToken)) {
    return;
  }
  const requestHeader = await headers();

  if (requestHeader.get("x-token-refreshed") === "1") {
    return;
  }

try {
  await getNewRefeshToken(refreshToken);
} catch (error) {
  console.error("Error refreshing token", error);
}

};

const axiosInstance = async() => {
  const coookieStore=await cookies()
  const accessToken=coookieStore.get("accessToken")?.value
  const refreshToken=coookieStore.get("refreshToken")?.value
  if (accessToken && refreshToken) {
    await tryRefreshToken(accessToken, refreshToken);
  }
const cookieHeader=coookieStore.getAll().map((cookie)=>`${cookie.name}=${cookie.value}`).join("; ")
  const Instance = axios.create({
    baseURL: Api_Url,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
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
    const instance=await axiosInstance()
    const response = await instance.get<ApiResponse<T>>(endpoint, {
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
    const instance=await axiosInstance()
    const response = await instance.post<ApiResponse<T>>(
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
    const instance=await axiosInstance()
    const response = await instance.put<ApiResponse<T>>(endpoint, body, {
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
    const instance=await axiosInstance()
    const response = await instance.patch<ApiResponse<T>>(
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
    const instance=await axiosInstance()
    const response = await instance.delete<ApiResponse<T>>(endpoint, {
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
