"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { deleteAuthCookies } from "@/lib/cookieUtils";
import { redirect } from "next/navigation";

const AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "better-auth.session_token",
] as const;

export const logoutAction = async () => {
  try {
    await httpClient.post("/auth/logout", {});
  } catch {
    // Still clear Next cookies so the browser session ends (expired/401 session).
  }

  await Promise.all(
    AUTH_COOKIE_NAMES.map((name) => deleteAuthCookies(name)),
  );

  redirect("/");
};
