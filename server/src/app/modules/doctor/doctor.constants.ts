import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
    "name",
    "email",
    "contactNumber",
    "address",
    "registrationNumber",
    "qualifications",
    "currentWorkingPlace",
    "designation",
    "doctorSpecialities.speciality.title",
    "doctorSpecialities.speciality.description",
]
export const doctorFilterableFields = [
  "gender",
  "experience",
  "appointmentFee",
  "qualifications",
  "currentWorkingPlace",
  "designation",
  "isDeleted",
  "doctorSpecialities.speciality.title",
];

export const doctorIncludeConfig: Partial<
  Record<
    keyof Prisma.DoctorInclude,
    Prisma.DoctorInclude[keyof Prisma.DoctorInclude]
  >
> = {
  user: true,
  doctorSpecialities: {
    include: {
      speciality: true,
    },
  },
  appointments: {
    include: {
      patient: true,
      doctor: true,
    },
  },
  doctorSchedules: {
    include: {
      schedule: true,
    },
  },
  prescriptions: true,
  reviews: true,
};
