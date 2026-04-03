import { envVars } from "../config/env";
import z from "zod";
import { hadnleZodError } from "../errorHelpers/handleZodError";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
export const globalErroHandler = async (err, req, res, next) => {
    if (envVars.NODE_ENV === "development") {
        console.log("Error from globalErroHandler", err);
    }
    //delete file from cloudinary if file is uploaded
    if (req.file) {
        await deleteFileFromCloudinary(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            await deleteFileFromCloudinary(file.path);
        }
    }
    let errorSource = [];
    let statusCode = status.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong";
    let stack = undefined;
    if (err instanceof z.ZodError) {
        const simplifiedError = hadnleZodError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSource = [...simplifiedError.errorSource];
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSource = [
            { path: "", message: err.message }
        ];
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
    }
    const erorResponse = {
        success: false,
        message: message,
        errorSource: errorSource,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err.message : undefined,
    };
    res.status(statusCode).json(erorResponse);
};
