import { Prisma } from "../../../generated/prisma/client";

export const doctorScheduleFilterableFields = [
  "doctorId",
  "scheduleId",
  "isBooked",
  "doctor.name",
  "doctor.email",
];

export const doctorScheduleSearchableFields = [
  "doctorId",
  "scheduleId",
  "doctor.name",
  "doctor.email",
];

export const doctorScheduleIncludeConfig: Partial<
  Record<
    keyof Prisma.DoctorSchedulesInclude,
    Prisma.DoctorSchedulesInclude[keyof Prisma.DoctorSchedulesInclude]
  >
> = {
  schedule: true,
  doctor: {
    include: {
      user: true,
    },
  },
};
