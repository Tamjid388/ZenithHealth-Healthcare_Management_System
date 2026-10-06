"use client";

import { createSpecialityAction } from "@/app/(dashboardLayout)/admin/dashboard/specialties-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  createSpecialityZodSchema,
  specialityFieldsZodSchema,
  TCreateSpecialityInput,
} from "@/zod/speciality.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type CreateSpecialityFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const defaultValues: TCreateSpecialityInput = {
  title: "",
  description: "",
  icon: null,
};

export const CreateSpecialityForm = ({
  onSuccess,
  onCancel,
}: CreateSpecialityFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TCreateSpecialityInput) =>
      createSpecialityAction(data),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createSpecialityZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["specialities"] });
        form.reset();
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError(
          (error as Error).message || "Failed to create speciality",
        );
      }
    },
  });

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="title"
        validators={{ onChange: specialityFieldsZodSchema.shape.title }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Title"
            placeholder="e.g. Cardiology"
          />
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{ onChange: specialityFieldsZodSchema.shape.description }}
      >
        {(field) => {
          const firstError =
            field.state.meta.isTouched && field.state.meta.errors.length > 0
              ? field.state.meta.errors[0]
              : null;
          return (
            <div className="space-y-1.5">
              <label
                htmlFor={field.name}
                className={cn(firstError ? "text-red-500" : "text-gray-900")}
              >
                Description
              </label>
              <Textarea
                id={field.name}
                name={field.name}
                value={(field.state.value ?? "") as string}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="What this speciality covers..."
                rows={4}
                aria-invalid={firstError !== null}
                className={cn(
                  firstError &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
              />
              {firstError ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {String(firstError)}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="icon"
        validators={{ onChange: createSpecialityZodSchema.shape.icon }}
      >
        {(field) => {
          const firstError =
            field.state.meta.isTouched && field.state.meta.errors.length > 0
              ? field.state.meta.errors[0]
              : null;
          const selectedFile = field.state.value as File | null;
          return (
            <div className="space-y-1.5">
              <label
                htmlFor={field.name}
                className={cn(firstError ? "text-red-500" : "text-gray-900")}
              >
                Icon <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="file"
                id={field.name}
                name={field.name}
                accept="image/*"
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.files?.[0] ?? null)
                }
                aria-invalid={firstError !== null}
                className={cn(
                  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm font-normal text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-zh-blue-deep/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zh-blue-deep focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  firstError &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
              />
              {selectedFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              ) : null}
              {firstError ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {String(firstError)}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      {serverError ? (
        <Alert variant="destructive" className="text-sm text-red-500">
          {serverError}
        </Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <AppSubmitButton
              disabled={!canSubmit || isSubmitting}
              isPending={isSubmitting}
              className="sm:w-auto"
            >
              Create Speciality
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateSpecialityForm;
