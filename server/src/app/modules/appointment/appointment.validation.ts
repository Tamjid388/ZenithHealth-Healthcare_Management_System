import z from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const bookAppointmentZodSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  scheduleId: z.string().min(1, "Schedule ID is required"),
});

const updateAppointmentZodSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export const AppointmentValidation = {
  bookAppointmentZodSchema,
  updateAppointmentZodSchema,
};
