"use client";

import { createAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { fieldValidator } from "@/components/shared/form/fieldValidator";
import { Alert, Button } from "@/components/ui";
import type { ICreateAdminPayload } from "@/types/admins.types";
import {
  createAdminZodSchema,
  stripEmptyStrings,
  type TCreateAdminInput,
} from "@/zod/admin.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type CreateAdminFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const CreateAdminForm = ({
  onSuccess,
  onCancel,
}: CreateAdminFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: ICreateAdminPayload) => createAdminAction(data),
  });

  const form = useForm({
    defaultValues: {
      password: "",
      admin: {
        name: "",
        email: "",
        profilePhoto: "",
        contactNumber: "",
        address: "",
      },
    } as TCreateAdminInput,
    validators: {
      onSubmit: createAdminZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(
          stripEmptyStrings(value) as ICreateAdminPayload,
        );
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["admins"] });
        form.reset();
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError(
          (error as Error).message || "Failed to create admin",
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
        name="admin.name"
        validators={{ onChange: createAdminZodSchema.shape.admin.shape.name }}
      >
        {(field) => (
          <AppField field={field} label="Name" placeholder="Admin full name" />
        )}
      </form.Field>

      <form.Field
        name="admin.email"
        validators={{ onChange: createAdminZodSchema.shape.admin.shape.email }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Email"
            type="email"
            placeholder="admin@example.com"
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: createAdminZodSchema.shape.password }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 6 characters"
            append={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" aria-hidden="true" />
                ) : (
                  <EyeIcon className="size-4" aria-hidden="true" />
                )}
              </Button>
            }
          />
        )}
      </form.Field>

      <form.Field
        name="admin.contactNumber"
        validators={{
          onChange: fieldValidator(
            createAdminZodSchema.shape.admin.shape.contactNumber,
          ),
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Contact number"
            type="tel"
            placeholder="01XXXXXXXXX"
          />
        )}
      </form.Field>

      <form.Field
        name="admin.address"
        validators={{
          onChange: fieldValidator(
            createAdminZodSchema.shape.admin.shape.address,
          ),
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Address"
            placeholder="House, road, area"
          />
        )}
      </form.Field>

      {serverError ? (
        <Alert variant="destructive" className="text-sm text-red-500">
          {serverError}
        </Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer"
        >
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
              Create admin
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateAdminForm;
