import { isAuthUserRole, TAuthUser } from "@/lib/authUtlils";

export interface UserInfo {
  id : string;
  name : string,
  email : string,
  role : TAuthUser
}

export function isUserInfo(value: unknown): value is UserInfo {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    isAuthUserRole(candidate.role)
  )
}