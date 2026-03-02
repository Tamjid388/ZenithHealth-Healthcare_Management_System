import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";

export const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionToken = cookieUtils.getcookie(req, "better-auth.session_token")
            console.log("1. sessionToken", sessionToken)
            if (!sessionToken) {
                throw new AppError(401, "Unauthorized")
            }
            if (sessionToken) {
                const sessionExists = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: {
                            gt: new Date()
                        },

                    },
                    include: {
                        user: true
                    }
                })
                if (!sessionExists) {
                    throw new AppError(401, "Unauthorized")
                }
                if (sessionExists && sessionExists.user) {
                    const user = sessionExists.user
                    const now = new Date()
                    const expiresAt = new Date(sessionExists.expiresAt)
                    const createdAt = new Date(sessionExists.createdAt)
                    const sessionLiftime = expiresAt.getTime() - createdAt.getTime()
                    const timeRemaining = expiresAt.getTime() - now.getTime()
                    const percentRemaining = (timeRemaining / sessionLiftime) * 100
                    if (percentRemaining < 20) {
                        res.setHeader("X-Session-Refresh", "true")
                        res.setHeader("X-Session-Expires-At", expiresAt.toISOString())
                        res.setHeader("X-Time-Remaining", timeRemaining.toString())
                        console.log("Session Expiring Soon")
                    }
                    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                        throw new AppError(403, "Your account has been blocked or deleted")
                    }
                    if (user.isDeleted) {
                        throw new AppError(403, "Your account has been deleted")
                    }
                    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                        throw new AppError(403, "You are not authorized to access this resource")
                    }

                       req.user = {
                userId: user.id,
                role: user.role,
                email: user.email,
            }
                }
            }
            const accessToken = cookieUtils.getcookie(req, "accessToken")
            console.log("2. accessToken", accessToken)
            if (!accessToken) {
                throw new AppError(401, "Unauthorized")
            }
            const verifyToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET)
            console.log("3. verifyToken", verifyToken)
            if (!verifyToken.success) {
                throw new AppError(401, "Unauthorized")
            }
            console.log("4. verifyToken", verifyToken)
            if (authRoles.length > 0 && !authRoles.includes(verifyToken.data!.role)) {
                throw new AppError(403, "You are not authorized to access this resource")
            }
         
            next()

        } catch (error: any) {
            next(error);
        }
    }
}
