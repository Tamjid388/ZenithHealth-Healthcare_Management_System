import * as z from "zod";

export const bookAppointmentZodSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  scheduleId: z.string().min(1, "Time slot is required"),
});

export type TBookAppointmentInput = z.input<typeof bookAppointmentZodSchema>;
export type TBookAppointment = z.output<typeof bookAppointmentZodSchema>;
