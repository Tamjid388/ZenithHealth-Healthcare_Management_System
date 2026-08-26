"use server";

import { registerZodSchema, TRegister } from "@/zod/auth.validation";
import { TLoginTypes } from "@/types/auth.types";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { redirect } from "next/navigation";

export const registerAction = async (
  data: TRegister,
): Promise<TLoginTypes | ApiErorResponse> => {
  const parsedData = registerZodSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.message || "Invalid Input Data");
  }

  const { name, email, password } = parsedData.data;

  try {
    const response = await httpClient.post<TLoginTypes>("/auth/register", {
      name,
      email,
      password,
    });
    const { accessToken, refreshToken, token } = response.data;
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token);
  } catch (error) {
    return {
      success: false,
      message: "Registration failed: " + (error as Error).message,
    };
  }

  // redirect() throws; must stay outside try/catch so Next can handle navigation
  redirect("/dashboard");
};
