import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  doctor: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(5)
      .max(50),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),

    profilePhoto: z.string().optional(),

    contactNumber: z
      .string()
      .min(11, "Contact number must be 11 digits")
      .max(14, "Contact number must be 14 digits")
      .optional(),

    address: z.string().optional(),

    registrationNumber: z
      .string()
      .min(1, "Registration number is required"),

    experience: z
      .number()
      .nonnegative("Experience must be positive"),

    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER],"Gender is required"),

    appointmentFee: z
      .number()
      .nonnegative("Appointment fee must be positive"),

    qualifications: z
      .string()
      .min(1, "Qualifications are required"),

    currentWorkingPlace: z
      .string()
      .min(1, "Current working place is required"),

    designation: z
      .string()
      .min(1, "Designation is required"),
  }),

  specialities: z
    .array(z.string())
    
});



export default createDoctorZodSchema