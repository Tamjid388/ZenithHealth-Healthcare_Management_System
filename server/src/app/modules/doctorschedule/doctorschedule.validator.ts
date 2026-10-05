import z from "zod";

const createDoctorScheduleZodSchema = z.object({
  scheduleIds: z.array(z.string().min(1)).min(1),
});

const updateDoctorScheduleZodSchema = z.object({
  scheduleIds: z
    .array(
      z.object({
        shouldDelete: z.boolean(),
        id: z.string().min(1),
      }),
    )
    .min(1),
});

export const DoctorScheduleValidation = {
  createDoctorScheduleZodSchema,
  updateDoctorScheduleZodSchema,
};
