import status from "http-status"
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface"
import z from "zod"

export const hadnleZodError = (err: z.ZodError): TErrorResponse => {
    const statusCode = status.BAD_REQUEST
    const message = "Zod Validation Error"
    let errorSource: TErrorSources[] = []
    err.issues.forEach(issue => {
        errorSource.push({
            path: issue.path.join("=>") || "unknown",
            message: issue.message
        })
    })
    return {
        success: false,
        message,
        errorSource,
        statusCode
    }
}