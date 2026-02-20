import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const result = await authService.registerPatient(payload)
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "Patient Created Successfully",
            data: result
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const result = await authService.loginUser(payload)
        const {accessToken, refreshToken,token,...rest} = result
        tokenUtils.setAccessTokenCookie(res, accessToken)
        tokenUtils.setRefreshTokenCookie(res, refreshToken)
        tokenUtils.setBetterAuthTokenCookie(res, token)
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "User Logged In Successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                ...rest
            }
        })
    }
)

export const AuthController = {
    registerPatient, loginUser
}
