import * as z from "zod";

// Blank means "no change": accept "" at the schema level so untouched
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

export const updateProfileZodSchema = z.object({
  name: optionalText(2, "Name must be at least 2 characters long", 50),
  profilePhoto: z.string().optional(),
  contactNumber: optionalText(11, "Contact number must be 11-14 digits", 14),
  address: z
    .string()
    .max(255, { message: "Address must be at most 255 characters long" })
    .optional(),
});

export type TUpdateProfile = z.infer<typeof updateProfileZodSchema>;

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
