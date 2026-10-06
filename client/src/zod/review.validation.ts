import * as z from "zod";

export const createReviewZodSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  rating: z
    .number({ error: "Select a rating between 1 and 5" })
    .min(1, "Select a rating between 1 and 5")
    .max(5, "Select a rating between 1 and 5"),
  comment: z
    .string()
    .max(1000, "Comment must be at most 1000 characters")
    .optional(),
});

export type TCreateReviewInput = z.input<typeof createReviewZodSchema>;
export type TCreateReview = z.output<typeof createReviewZodSchema>;
