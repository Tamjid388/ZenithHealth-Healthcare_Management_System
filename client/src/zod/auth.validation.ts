import * as z from "zod";
export const loginZodSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type TLogin = z.infer<typeof loginZodSchema>;