import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { hadnleZodError } from "../errorHelpers/handleZodError";
import status from "http-status";
import AppError from "../errorHelpers/AppError";



export const globalErroHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.log("Error from globalErroHandler", err)
    }
    let errorSource: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR
    let message: string = "Something went wrong"
    let stack: string | undefined = undefined

    if (err instanceof z.ZodError) {
        const simplifiedError = hadnleZodError(err)
        statusCode = simplifiedError.statusCode!
        message = simplifiedError.message
        errorSource = [...simplifiedError.errorSource]

    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
        stack = err.stack
        errorSource = [
            { path: "", message: err.message }
        ]
    }

    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR
        message = err.message
        stack = err.stack

    }
    const erorResponse: TErrorResponse = {
        success: false,
        message: message,
        errorSource: errorSource,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err.message : undefined,

    }
    res.status(statusCode).json(erorResponse)
}
