import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";

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
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "User Logged In Successfully",
            data: result
        })
    }
)

export const AuthController = {
    registerPatient, loginUser
}
