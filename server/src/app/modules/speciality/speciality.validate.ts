import { z } from "zod";

const CreateSpecialityZodSchema=z.object({
    title:z.string("Title is required"),
    description:z.string().optional(),
})
export const SpecialityZodValidation={
    CreateSpecialityZodSchema,
}