"use client";

import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { fieldValidator } from "@/components/shared/form/fieldValidator";
import { Alert, Button } from "@/components/ui";
import { updateMyProfile } from "@/services/profile.service";
import type { TMyProfile } from "@/types/user.types";
import {
  stripEmptyStrings,
  updateProfileZodSchema,
  type TUpdateProfile,
} from "@/zod/profile.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type EditProfileFormProps = {
  profile: TMyProfile;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const EditProfileForm = ({
  profile,
  onSuccess,
  onCancel,
}: EditProfileFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TUpdateProfile) => updateMyProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user", "me"], updated);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const form = useForm({
    defaultValues: {
      name: profile.name,
      profilePhoto:
        profile.image ??
        profile.patient?.profilePhoto ??
        profile.doctor?.profilePhoto ??
        profile.admin?.profilePhoto ??
        profile.admins?.[0]?.profilePhoto ??
        "",
      contactNumber:
        profile.patient?.contactNumber ??
        profile.doctor?.contactNumber ??
        profile.admin?.contactNumber ??
        profile.admins?.[0]?.contactNumber ??
        "",
      address: profile.patient?.address ?? profile.doctor?.address ?? "",
    } as TUpdateProfile,
    validators: {
      onSubmit: updateProfileZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const cleaned = stripEmptyStrings(value) as TUpdateProfile;
        if (Object.keys(cleaned).length === 0) {
          setServerError("Change at least one field to update your profile");
          return;
        }
        await mutateAsync(cleaned);
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError(
          (error as Error).message || "Failed to update profile",
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
        name="name"
        validators={{ onChange: fieldValidator(updateProfileZodSchema.shape.name) }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Name"
            placeholder="Your full name"
          />
        )}
      </form.Field>

      <form.Field
        name="contactNumber"
        validators={{
          onChange: fieldValidator(updateProfileZodSchema.shape.contactNumber),
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
        name="address"
        validators={{ onChange: fieldValidator(updateProfileZodSchema.shape.address) }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Address"
            placeholder="House, road, area"
          />
        )}
      </form.Field>

      <form.Field
        name="profilePhoto"
        validators={{
          onChange: fieldValidator(updateProfileZodSchema.shape.profilePhoto),
        }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Profile photo URL"
            type="url"
            placeholder="https://…"
          />
        )}
      </form.Field>

      <div className="rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm">
        <span className="text-muted-foreground">Email: </span>
        <span className="font-medium">{profile.email}</span>
        <span className="text-muted-foreground"> (contact support to change)</span>
      </div>

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

export default EditProfileForm;
