import { loginZodSchema, TLogin } from "@/zod/auth.validation";
import { TLoginTypes } from "@/types/auth.types";
import { httpClient } from "@/lib/axios/httpClient";
import { ApiErorResponse } from "@/types/api.types";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { redirect } from "next/navigation";

export const loginAction = async (
  data: TLogin,
): Promise<TLoginTypes | ApiErorResponse> => {
  const parsedData = loginZodSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error(parsedData.error.message || "Invalid Input Data");
  }
  try {
    const response = await httpClient.post<TLoginTypes>(
      "/auth/login",
      parsedData.data,
    );
    const { accessToken, refreshToken, token } = response.data;
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token);
    redirect("/");
  } catch (error) {
    return {
      success: false,
      message: "login failed" + (error as Error).message,
    };
  }
};
