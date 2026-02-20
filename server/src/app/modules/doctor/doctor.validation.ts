import z from "zod";

export const updateDoctorZodSchema=z.object({
    name:z.string("Minimum 3 character needed").min(3)
}).partial()