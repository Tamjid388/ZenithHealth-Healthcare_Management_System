import * as z from "zod";

export const createMyDoctorScheduleZodSchema = z.object({
  scheduleIds: z
    .array(z.string().min(1, "Schedule ID is required"))
    .min(1, "Select at least one schedule"),
});

export const updateMyDoctorScheduleZodSchema = z.object({
  scheduleIds: z
    .array(
      z.object({
        id: z.string().min(1, "Schedule ID is required"),
        shouldDelete: z.boolean(),
      }),
    )
    .min(1, "Select at least one schedule"),
});

export type TCreateMyDoctorScheduleInput = z.input<
  typeof createMyDoctorScheduleZodSchema
>;
export type TCreateMyDoctorSchedule = z.output<
  typeof createMyDoctorScheduleZodSchema
>;
export type TUpdateMyDoctorScheduleInput = z.input<
  typeof updateMyDoctorScheduleZodSchema
>;
export type TUpdateMyDoctorSchedule = z.output<
  typeof updateMyDoctorScheduleZodSchema
>;
