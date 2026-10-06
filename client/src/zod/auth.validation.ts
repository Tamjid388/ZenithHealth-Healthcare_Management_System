import * as z from "zod";

export const loginZodSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const registerBaseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const registerZodSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
);

export type TLogin = z.infer<typeof loginZodSchema>;
export type TRegister = z.infer<typeof registerZodSchema>;

export const changePasswordZodSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters long" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type TChangePassword = z.infer<typeof changePasswordZodSchema>;
