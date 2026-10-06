"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErorResponse } from "@/types/api.types";
import {
  changePasswordZodSchema,
  type TChangePassword,
} from "@/zod/auth.validation";

export type TChangePasswordResult =
  | { success: true; message: string }
  | ApiErorResponse;

export const changePasswordAction = async (
  data: TChangePassword,
): Promise<TChangePasswordResult> => {
  const parsed = changePasswordZodSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message || "Invalid input data");
  }
  const { currentPassword, newPassword } = parsed.data;

  try {
    const response = await httpClient.post<{
      accessToken: string;
      refreshToken: string;
      token: string;
    }>("/auth/change-password", { currentPassword, newPassword });
    const { accessToken, refreshToken, token } = response.data;
    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }
    if (refreshToken) {
      await setTokenInCookies("refreshToken", refreshToken);
    }
    if (token) {
      await setTokenInCookies("better-auth.session_token", token);
    }
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Password change failed: " + (error as Error).message,
    };
  }
};
