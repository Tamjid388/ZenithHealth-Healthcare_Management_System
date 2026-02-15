import { NextFunction, Request, Response } from "express"
import { envVars } from "../../config/env"

export const globalErroHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {

        console.log("Error from globalErroHandler", err)
    }
    let statusCode: number = 500
    let message: string = "Something went wrong"



    res.status(statusCode).json({
        success: false,
        message,
        error: err.message
    })
}
