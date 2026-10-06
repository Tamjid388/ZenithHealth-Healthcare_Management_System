import { Prisma } from "../../../generated/prisma/client";

export const reviewSearchableFields = ["comment"];

export const reviewFilterableFields = [
  "doctorId",
  "patientId",
  "appointmentId",
  "rating",
];

export const reviewIncludeConfig: Partial<
  Record<
    keyof Prisma.ReviewInclude,
    Prisma.ReviewInclude[keyof Prisma.ReviewInclude]
  >
> = {
  appointment: {
    include: {
      schedule: true,
    },
  },
  patient: {
    select: {
      name: true,
    },
  },
  doctor: {
    select: {
      id: true,
      name: true,
    },
  },
};
