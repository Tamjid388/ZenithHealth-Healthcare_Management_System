"use server"

import { setTokenInCookies } from "@/lib/tokenUtils";
import { isUserInfo, UserInfo } from "@/types/user.types";
import { cookies } from "next/headers";


const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if(!baseUrl){
  throw new Error("NEXT_PUBLIC_API_URL is not found");
}


export async function getNewRefeshToken(refreshToken:string):Promise<boolean> {

  try{
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `refreshToken=${refreshToken}`,
      },
    });

    if(!response.ok){
      return false;
    }
    const {data}=await response.json();
    const {accessToken,refreshToken:newRefreshToken,Token}=data;

    if(accessToken){
      setTokenInCookies("accessToken",accessToken);
    }
    if(newRefreshToken){
      setTokenInCookies("refreshToken",newRefreshToken);
    }
    if(Token){
      setTokenInCookies("better-auth.session_token",Token,24*60*60);
    }

    return true;
  }catch(error){
    console.error("Error refreshing token:", error);
    return false;
  }
}
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const sessionToken = cookieStore.get("better-auth.session_token")?.value

      if (!accessToken) {
          return null;
      }
  
      const res = await fetch(`${baseUrl}/auth/me`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
          }
      });

      if (!res.ok) {
          console.error("Failed to fetch user info:", res.status, res.statusText);
          return null;
      }

      const { data } = await res.json();

      if (!isUserInfo(data)) {
          return null;
      }

      return data;
  } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
  }
}