"use server";

import axios from "axios";
import { httpClient } from "@/lib/axios/httpClient";
import type { TMyProfile } from "@/types/user.types";
import {
  updateProfileZodSchema,
  type TUpdateProfile,
} from "@/zod/profile.validation";

const getServiceErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) {
      return message;
    }
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const getMyProfile = async (): Promise<TMyProfile> => {
  const response = await httpClient.get<TMyProfile>("/auth/me");
  return response.data;
};

export const updateMyProfile = async (
  data: TUpdateProfile,
): Promise<TMyProfile> => {
  const parsed = updateProfileZodSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message || "Invalid input data");
  }
  try {
    const response = await httpClient.patch<TMyProfile>(
      "/users/me",
      parsed.data,
    );
    return response.data;
  } catch (error) {
    throw new Error(getServiceErrorMessage(error, "Failed to update profile"));
  }
};
