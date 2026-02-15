import { Gender } from "../../../generated/prisma/enums";

export interface IDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        isDeleted: boolean;
        deletedAt: Date;
        registrationNumber: string;
        experience: number;
        gender: Gender;
        appointmentFee: number;
        qualifications: string;
        currentWorkingPlace: string;
        designation: string;
        averageRating: number;
        createdAt: Date;
        updatedAt: Date;
        userId?: string;
    }, specialities: string[]
}