import { Role, Speciality } from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IAdminPayload, IDoctorPayload, IUpdateMePayload } from "./user.interface";

const createDoctor = async (payload: IDoctorPayload) => {
    const { password, doctor } = payload;


    const specialities: Speciality[] = []
    for (const specialityId of payload.specialities) {
        const speciality = await prisma.speciality.findUnique({
            where: {
                id: specialityId
            }
        })
        if (!speciality) {
            throw new Error(`Speciality with id ${specialityId} not found`)
        }
        if (speciality) {
            specialities.push(speciality)
        }

    }
    const userExists = await prisma.user.findUnique({
        where: {
            email: doctor.email
        }
    })
    if (userExists) {
        throw new Error(`User with email ${doctor.email} already exists`)
    }
    const userData = await auth.api.signUpEmail({
        body: {
            email: doctor.email,
            password,
            role: Role.DOCTOR,
            name: doctor.name,
            needPasswordChange: true
        }
    })
    try {
        const result = await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    ...payload.doctor,

                    userId: userData.user.id
                }
            })
            const doctorSpecialities = specialities.map((speciality) => {
                return {
                    doctorId: doctorData.id,
                    specialityId: speciality.id
                }
            })
            await tx.doctorSpeciality.createMany({
                data: doctorSpecialities
            })
            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id
                }, select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    isDeleted: true,
                    deletedAt: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            status: true,
                            needPasswordChange: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true,
                            emailVerified: true,
                            image: true,

                        }
                    },
                    appointmentFee: true,
                    qualifications: true,
                    currentWorkingPlace: true,
                    designation: true,
                    averageRating: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                    doctorSpecialities: true
                }
            })
            return doctor

        })
        return result
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error
    }
}
const createAdmin = async (payload: IAdminPayload) => {
    const user = await auth.api.signUpEmail({
        body: {
            email: payload.admin.email,
            password: payload.password,
            role: Role.ADMIN,
            name: payload.admin.name,
            needPasswordChange: true
        }
    })
    try {
        const result = await prisma.$transaction(async (tx) => {
            const admin = await tx.admin.create({
                data: {
                    ...payload.admin,
                    userId: user.user.id
                }
            })

            return admin
        })
        return result
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: user.user.id
            }
        })
        throw new Error("Failed to create admin")
    }
}

const updateMe = async (userId: string, payload: IUpdateMePayload) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!existingUser) {
        throw new AppError(status.NOT_FOUND, "User not found")
    }
    if (Object.keys(payload).length === 0) {
        throw new AppError(status.BAD_REQUEST, "Provide at least one field to update")
    }
    const { name, profilePhoto, contactNumber, address } = payload

    const userData: { name?: string; image?: string } = {
        ...(name !== undefined ? { name } : {}),
        ...(profilePhoto !== undefined ? { image: profilePhoto } : {}),
    }
    const profileData: { name?: string; profilePhoto?: string; contactNumber?: string; address?: string } = {
        ...(name !== undefined ? { name } : {}),
        ...(profilePhoto !== undefined ? { profilePhoto } : {}),
        ...(contactNumber !== undefined ? { contactNumber } : {}),
        ...(address !== undefined ? { address } : {}),
    }

    const result = await prisma.$transaction(async (tx) => {
        if (Object.keys(userData).length > 0) {
            await tx.user.update({
                where: { id: userId },
                data: userData,
            })
        }
        // The role profile row may not exist (e.g. seeded SUPER_ADMIN
        // without an admin row). Update it only when present — a missing
        // row must not turn a User-level update into a P2025 crash.
        if (existingUser.role === Role.PATIENT) {
            const profileRow = await tx.patient.findUnique({
                where: { userId },
            })
            if (profileRow && Object.keys(profileData).length > 0) {
                await tx.patient.update({
                    where: { userId },
                    data: profileData,
                })
            } else if (!profileRow && Object.keys(userData).length === 0) {
                throw new AppError(status.BAD_REQUEST, "Provide at least one field to update")
            }
        } else if (existingUser.role === Role.DOCTOR) {
            const profileRow = await tx.doctor.findUnique({
                where: { userId },
            })
            if (profileRow && Object.keys(profileData).length > 0) {
                await tx.doctor.update({
                    where: { userId },
                    data: profileData,
                })
            } else if (!profileRow && Object.keys(userData).length === 0) {
                throw new AppError(status.BAD_REQUEST, "Provide at least one field to update")
            }
        } else {
            const profileRow = await tx.admin.findUnique({
                where: { userId },
            })
            // Admin has no address column — only name, profilePhoto, contactNumber apply
            const adminData: { name?: string; profilePhoto?: string; contactNumber?: string } = {
                ...(name !== undefined ? { name } : {}),
                ...(profilePhoto !== undefined ? { profilePhoto } : {}),
                ...(contactNumber !== undefined ? { contactNumber } : {}),
            }
            if (profileRow && Object.keys(adminData).length > 0) {
                await tx.admin.update({
                    where: { userId },
                    data: adminData,
                })
            } else if (!profileRow && Object.keys(userData).length === 0) {
                throw new AppError(status.BAD_REQUEST, "Provide at least one field to update")
            }
        }
        return tx.user.findUnique({
            where: { id: userId },
            include: {
                patient: true,
                doctor: true,
                admins: true,
            },
        })
    })
    return result
}

export const UserService = {
    createDoctor, createAdmin, updateMe
}