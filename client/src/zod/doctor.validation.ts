import * as z from "zod";
import { Gender } from "@/types/doctors.types";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createDoctorZodSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  doctor: z.object({
    name: z
      .string()
      .min(5, "Name must be at least 5 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z.email({ error: "Invalid email address" }),
    contactNumber: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(11, "Contact number must be 11 digits")
        .max(14, "Contact number must be 14 digits")
        .optional(),
    ),
    address: z.preprocess(emptyToUndefined, z.string().optional()),
    registrationNumber: z.string().min(1, "Registration number is required"),
    experience: z.coerce.number().nonnegative("Experience must be positive"),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
      error: "Gender is required",
    }),
    appointmentFee: z.coerce
      .number()
      .nonnegative("Appointment fee must be positive"),
    qualifications: z.string().min(1, "Qualifications are required"),
    currentWorkingPlace: z.string().min(1, "Current working place is required"),
    designation: z.string().min(1, "Designation is required"),
  }),
  specialities: z
    .array(z.string())
    .min(1, "Select at least one speciality"),
});

export type TCreateDoctorInput = z.input<typeof createDoctorZodSchema>;
export type TCreateDoctor = z.output<typeof createDoctorZodSchema>;

const updateDoctorFieldsSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(50, "Name must be at most 50 characters"),
  contactNumber: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .min(11, "Contact number must be 11 digits")
      .max(14, "Contact number must be 14 digits")
      .optional(),
  ),
  address: z.preprocess(emptyToUndefined, z.string().optional()),
  registrationNumber: z.string().min(1, "Registration number is required"),
  experience: z.coerce.number().nonnegative("Experience must be positive"),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    error: "Gender is required",
  }),
  appointmentFee: z.coerce
    .number()
    .nonnegative("Appointment fee must be positive"),
  qualifications: z.string().min(1, "Qualifications are required"),
  currentWorkingPlace: z.string().min(1, "Current working place is required"),
  designation: z.string().min(1, "Designation is required"),
});

export const updateDoctorZodSchema = z.object({
  doctor: updateDoctorFieldsSchema,
  specialities: z
    .array(
      z.object({
        specialityId: z.string().min(1),
        shouldDelete: z.boolean().optional(),
      }),
    )
    .optional(),
});

export type TUpdateDoctorInput = z.input<typeof updateDoctorZodSchema>;
export type TUpdateDoctor = z.output<typeof updateDoctorZodSchema>;
