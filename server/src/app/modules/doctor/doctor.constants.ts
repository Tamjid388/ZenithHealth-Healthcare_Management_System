import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
    "name",
    "email",
    "contactNumber",
    "address",
    "registrationNumber",
    "experience",
    "gender",
    "appointmentFee",
    "qualifications",
    "currentWorkingPlace",
    "designation",
    "specialities.specialty.title",
]
export const doctorFilterableFields = [
  "searchTerm",
  "specialities",
  "gender",
  "experience",
  "appointmentFee",
  "qualifications",
  "currentWorkingPlace",
  "designation",
  "isDeleted",
  "user.role",
  "specialities.specialty.title",
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
