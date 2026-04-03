import { envVars } from "../config/env";
import { cookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";
const getAccesstoken = (payload) => {
    const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN });
    return accessToken;
};
const getRefreshToken = (payload) => {
    const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN });
    return refreshToken;
};
const setAccessTokenCookie = (res, accessToken) => {
    cookieUtils.setCookie(res, "accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 1000
    });
};
const setRefreshTokenCookie = (res, refreshToken) => {
    cookieUtils.setCookie(res, "refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 1000
    });
};
const setBetterAuthTokenCookie = (res, betterToken) => {
    cookieUtils.setCookie(res, "better-auth.session_token", betterToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 1000
    });
};
export const tokenUtils = {
    getAccesstoken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthTokenCookie
};
