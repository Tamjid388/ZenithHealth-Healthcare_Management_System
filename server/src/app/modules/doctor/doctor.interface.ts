import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorSpeciality {
    specialityId: string;
    shouldDelete?: boolean;
}



export interface IUpdateDoctor {
    doctor?: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        experience?: number;
        registrationNumber?: string;
        gender?: Gender;
        appointmentFee?: number;
        qualification?: string;
        designation?: string;
        currentWorkingPlace?: string;
    }
    specialities?: IUpdateDoctorSpeciality[]

}