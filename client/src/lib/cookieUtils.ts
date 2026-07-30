"use server"
import { cookies } from "next/headers"

export const setAuthCookies = async (name:string, value:string, maxAgeInSeconds:number) => {
  const cookieStore=await cookies()
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge:maxAgeInSeconds,
    path: "/",
  })
}
export const getAuthCookies = async (name:string) => {
  const cookieStore=await cookies()
  return cookieStore.get(name)?.value
}
export const deleteAuthCookies = async (name:string) => {
  const cookieStore=await cookies()
  cookieStore.delete(name)
}