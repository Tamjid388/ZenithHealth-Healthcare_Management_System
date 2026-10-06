import z from "zod";

const createReviewZodSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  rating: z
    .number({ error: "Rating must be a number" })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be at most 1000 characters").optional(),
});

const updateReviewZodSchema = z
  .object({
    rating: z
      .number({ error: "Rating must be a number" })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .max(1000, "Comment must be at most 1000 characters")
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Provide at least rating or comment to update",
  });

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
