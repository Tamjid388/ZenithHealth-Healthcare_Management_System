"use client";

import { getAdminByIdAction, updateAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { fieldValidator } from "@/components/shared/form/fieldValidator";
import { Alert, Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import type { Admin, IUpdateAdminPayload } from "@/types/admins.types";
import {
  stripEmptyStrings,
  updateAdminFieldsZodSchema,
  updateAdminZodSchema,
  type TUpdateAdminInput,
} from "@/zod/admin.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type EditAdminFormProps = {
  adminId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type EditAdminFormFieldsProps = {
  admin: Admin;
  adminId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const EditAdminFormFields = ({
  admin,
  adminId,
  onSuccess,
  onCancel,
}: EditAdminFormFieldsProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: IUpdateAdminPayload) =>
      updateAdminAction(adminId, data),
  });

  const form = useForm({
    defaultValues: {
      admin: {
        name: admin.name,
        profilePhoto: admin.profilePhoto ?? "",
        contactNumber: admin.contactNumber ?? "",
      },
    } as TUpdateAdminInput,
    validators: {
      onSubmit: updateAdminZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const cleaned = stripEmptyStrings(value) as IUpdateAdminPayload;
        if (!cleaned.admin) {
          setServerError("Change at least one field to update this admin");
          return;
        }
        const result = await mutateAsync(cleaned);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["admins"] });
        await queryClient.invalidateQueries({ queryKey: ["admin", adminId] });
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError(
          (error as Error).message || "Failed to update admin",
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
        validators={{
          onChange: fieldValidator(updateAdminFieldsZodSchema.shape.name),
        }}
      >
        {(field) => (
          <AppField field={field} label="Name" placeholder="Admin full name" />
        )}
      </form.Field>

      <form.Field
        name="admin.contactNumber"
        validators={{
          onChange: fieldValidator(
            updateAdminFieldsZodSchema.shape.contactNumber,
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

      <form.Field name="admin.profilePhoto">
        {(field) => (
          <AppField
            field={field}
            label="Profile photo URL"
            type="url"
            placeholder="https://…"
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
              Save changes
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export const EditAdminForm = ({
  adminId,
  onSuccess,
  onCancel,
}: EditAdminFormProps) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", adminId],
    queryFn: async () => {
      const result = await getAdminByIdAction(adminId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    staleTime: 1000 * 30,
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <Alert variant="destructive" className="text-sm">
        {error instanceof Error ? error.message : "Failed to load admin."}
      </Alert>
    );
  }

  return (
    <EditAdminFormFields
      key={data.data.id}
      admin={data.data}
      adminId={adminId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default EditAdminForm;
