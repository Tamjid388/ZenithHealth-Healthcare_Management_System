import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const result = await UserService.createDoctor(payload)
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Doctor created successfully",
        data: result
    })

})

const createAdmin    = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const result = await UserService.createAdmin(payload)
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin created successfully",
        data: result
    })

})

const updateMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized")
    }
    const payload = req.body
    const result = await UserService.updateMe(user.userId, payload)
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    })
})

export const userController = {
    createDoctor,
    createAdmin,
    updateMe
}