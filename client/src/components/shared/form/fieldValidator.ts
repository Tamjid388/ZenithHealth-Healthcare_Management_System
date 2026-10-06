import type * as z from "zod";

// Wrap a Zod schema as a TanStack Form field validator. Needed for
// optional schemas: passing them bare fails type-check because the
// schema input (string | undefined) no longer matches the field value
// (string) under this repo's @tanstack/react-form version.
export const fieldValidator = (schema: z.ZodType) => {
  return ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value);
    return result.success ? undefined : result.error.message;
  };
};
