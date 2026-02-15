import { Role, Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IDoctorPayload } from "./user.interface";

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
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
    }
}


export const UserService = {
    createDoctor
}