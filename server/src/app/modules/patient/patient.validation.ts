import z from "zod";

export const PatientValidation = {
    // No body schemas needed for read-only endpoints yet.
    // Kept for future mutations (validateRequest requires a schema).
    patientIdParamsSchema: z.object({
        id: z.string().min(1, "Patient id is required"),
    }),
};
