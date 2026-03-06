import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { cookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthTokenCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Patient Created Successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthTokenCookie(res, token);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User Logged In Successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = user?.userId;
  console.log(user);
  const result = await authService.getMe(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User is authenticated",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.changePassword(payload, sessionToken);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthTokenCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const getNewtoken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
  }
  const result = await authService.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthTokenCookie(res, sessionToken);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    },
  });
});
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session token is missing");
  }
  const result = await authService.logoutUser(sessionToken);
  cookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", 
    {   httpOnly: true, secure: true,    sameSite: "none",  });

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: result,
  });
});
//Email Verify
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
 await authService.verifyEmail(payload.email,payload.otp);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email Verified Successfully",
 
  });
});

//Forget Password
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
 await authService.forgetPassword(payload.email);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Forget Password Email Sent Successfully",
 
  });
});

//Reset Password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
 await authService.resetPassword(payload.email,payload.otp,payload.newPassword);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password Reset Successfully",
 
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewtoken,
  changePassword,logoutUser,verifyEmail,forgetPassword,resetPassword
};
