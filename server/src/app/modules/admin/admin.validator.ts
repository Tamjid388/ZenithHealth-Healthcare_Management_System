import z from "zod";

const updateAdminZodSchema = z.object({
  admin: z
    .object({
      name: z.string().min(1, "Name is required").optional(),
      profilePhoto: z.string().optional(),
      contactNumber: z.string().optional(),
    })
    .optional(),
});

export const AdminValidation = {
  updateAdminZodSchema,
};
