import * as z from "zod";

// Blank means "not provided": accept "" at the schema level so untouched
// optional fields never block submit. Callers strip "" before sending
// (see stripEmptyStrings) so the API only receives real values.
const optionalText = (min: number, minMessage: string, max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .refine(
      (value) => value === undefined || value === "" || value.length >= min,
      { message: minMessage },
    );

const adminNameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .min(5, { message: "Name must be at least 5 characters long" })
  .max(50, { message: "Name must be at most 50 characters long" });

const adminContactNumberSchema = optionalText(
  11,
  "Contact number must be 11-14 digits",
  14,
);

const adminFieldsZodSchema = z.object({
  name: adminNameSchema,
  email: z.email({ error: "Invalid email address" }),
  profilePhoto: z.string().optional(),
  contactNumber: adminContactNumberSchema,
  address: z.string().optional(),
});

export const createAdminZodSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  admin: adminFieldsZodSchema,
});

export const updateAdminFieldsZodSchema = z.object({
  name: optionalText(2, "Name must be at least 2 characters long", 50),
  profilePhoto: z.string().optional(),
  contactNumber: adminContactNumberSchema,
});

export const updateAdminZodSchema = z.object({
  admin: updateAdminFieldsZodSchema.optional(),
});

export type TCreateAdminInput = z.infer<typeof createAdminZodSchema>;
export type TUpdateAdminInput = z.infer<typeof updateAdminZodSchema>;

// Remove blank/undefined values (one nesting level) so "" never reaches
// the API — the backend treats "" as a real value and rejects it.
export const stripEmptyStrings = <T extends Record<string, unknown>>(
  value: T,
): Partial<T> => {
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === "" || entry === undefined) {
      continue;
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const nested = stripEmptyStrings(entry as Record<string, unknown>);
      if (Object.keys(nested).length > 0) {
        output[key] = nested;
      }
      continue;
    }
    output[key] = entry;
  }
  return output as Partial<T>;
};
