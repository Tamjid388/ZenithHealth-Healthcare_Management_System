"use server";

import { loginZodSchema, TLogin } from "@/zod/auth.validation";
import { TLoginTypes } from "@/types/auth.types";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { redirect } from "next/navigation";
import { getDefaultDashboardRoute, isValidRedirectForRole, TAuthUser } from "@/lib/authUtlils";

export const loginAction = async (
  data: TLogin,
  redirectUrl?: string,
): Promise<TLoginTypes | ApiErorResponse> => {
  const parsedData = loginZodSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.message || "Invalid Input Data");
  }

  let targetPath: string;

  try {
    const response = await httpClient.post<TLoginTypes>(
      "/auth/login",
      parsedData.data,
    );
    const { accessToken, refreshToken, token, user } = response.data;
    const { role, email, emailVerified, needChangePassword } = user;
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token);

    if (!emailVerified) {
      targetPath = `/verify-email?email=${email}`;
    } else if (needChangePassword) {
      targetPath = `/reset-password?email=${email}`;
    } else {
      targetPath =
        redirectUrl && isValidRedirectForRole(redirectUrl, role as TAuthUser)
          ? redirectUrl
          : getDefaultDashboardRoute(role as TAuthUser);
    }
  } catch (error) {
    return {
      success: false,
      message: "login failed" + (error as Error).message,
    };
  }

  // redirect() throws; must stay outside try/catch so Next can handle navigation
  redirect(targetPath);
};
