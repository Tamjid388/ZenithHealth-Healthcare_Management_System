import { JwtPayload, SignOptions } from "jsonwebtoken";

import { envVars } from "../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";
import { jwtUtils } from "./jwt";


const getAccesstoken = (payload: JwtPayload) => {

    const accessToken = jwtUtils.createToken(payload
        , envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] })
    return accessToken
}
const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken
        (payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] })
    return refreshToken
}
const setAccessTokenCookie = (res: Response, accessToken: string) => {

    cookieUtils.setCookie(res, "accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 60 * 24

    })
}
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {

    cookieUtils.setCookie(res, "refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 60 * 24 * 7

    })
}
const setBetterAuthTokenCookie = (res: Response, betterToken: string) => {

    cookieUtils.setCookie(res, "better-auth.session_token", betterToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 60 * 24,

    })
}

export const tokenUtils = {
    getAccesstoken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthTokenCookie
}