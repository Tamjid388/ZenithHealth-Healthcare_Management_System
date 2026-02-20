import { Role, User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPayload {
    name: string;
    email: string;
    password: string
}

const registerPatient = async (payload: IRegisterPayload) => {
    const { name, email, password } = payload
    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password
        }
    })

    if (!data.user) {
        throw new Error("Failed to register patient")
    }
    try {
        const patientTx = await prisma.$transaction(async (tx) => {
            return tx.patient.create({
                data: {
                    name: payload.name,
                    email: payload.email,
                    userId: data.user.id
                }
            })

        })

        const tokenPayload = {
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        }
        const accessToken=tokenUtils.getAccesstoken(tokenPayload)
const refreshToken=tokenUtils.getRefreshToken(tokenPayload)
        return {
            ...data,
            patient: patientTx,
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.log("TRANSACTION ERROR ", error)
        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })

        throw error
    }

}
const loginUser = async (payload: { email: string, password: string }) => {
    const { email, password } = payload
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })
    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("User Is Blocked")
    }
    const tokenPayload = {
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,


    }
    const accessToken = tokenUtils.getAccesstoken(tokenPayload)
    const refreshToken = tokenUtils.getRefreshToken(tokenPayload)



    return {
        ...data,
        accessToken,
        refreshToken
    }
}

export const authService = {
    registerPatient, loginUser
}