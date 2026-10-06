"use client";

import { changePasswordAction } from "@/app/(dashboardLayout)/(commonProtectedLayout)/change-password/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import {
  changePasswordZodSchema,
  type TChangePassword,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

export const ChangePasswordForm = () => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TChangePassword) => changePasswordAction(data),
  });

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as TChangePassword,
    validators: {
      onSubmit: changePasswordZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          setSuccessMessage(null);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        form.reset();
        setServerError(null);
        setSuccessMessage(result.message);
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Password change failed");
        setSuccessMessage(null);
      }
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
        <CardDescription>
          Choose a new password. Minimum 8 characters, different from the
          current one.
        </CardDescription>
      </CardHeader>

      <CardContent>
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
            name="currentPassword"
            validators={{ onChange: changePasswordZodSchema.shape.currentPassword }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Current password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                append={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowCurrentPassword((value) => !value)}
                  >
                    {showCurrentPassword ? (
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
            name="newPassword"
            validators={{ onChange: changePasswordZodSchema.shape.newPassword }}
          >
            {(field) => (
              <AppField
                field={field}
                label="New password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter a new password"
                append={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowNewPassword((value) => !value)}
                  >
                    {showNewPassword ? (
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
            name="confirmPassword"
            validators={{ onChange: changePasswordZodSchema.shape.confirmPassword }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Confirm new password"
                type="password"
                placeholder="Repeat the new password"
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                disabled={!canSubmit || isSubmitting}
                isPending={isSubmitting}
              >
                Update password
              </AppSubmitButton>
            )}
          </form.Subscribe>

          {serverError ? (
            <Alert variant="destructive" className="text-sm text-red-500">
              {serverError}
            </Alert>
          ) : null}
          {successMessage ? (
            <Alert className="text-sm text-green-700">{successMessage}</Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
