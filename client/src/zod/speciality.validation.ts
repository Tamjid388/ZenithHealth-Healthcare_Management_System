import * as z from "zod";

const MAX_ICON_SIZE_BYTES = 5 * 1024 * 1024;

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(100, "Title must be 100 characters or less");

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, "Description must be 2000 characters or less")
  .optional();

const iconSchema = z
  .custom<File | null | undefined>(
    (value) =>
      value === null ||
      value === undefined ||
      (typeof File !== "undefined" && value instanceof File),
    { message: "Invalid file" },
  )
  .nullish()
  .refine((file) => !file || file.size <= MAX_ICON_SIZE_BYTES, {
    message: "Icon must be under 5MB",
  })
  .refine((file) => !file || file.type.startsWith("image/"), {
    message: "Icon must be an image",
  });

export const specialityFieldsZodSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
});

export const createSpecialityZodSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  icon: iconSchema,
});

export const updateSpecialityZodSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  icon: iconSchema,
});

export type TCreateSpecialityInput = z.input<typeof createSpecialityZodSchema>;
export type TUpdateSpecialityInput = z.input<typeof updateSpecialityZodSchema>;
