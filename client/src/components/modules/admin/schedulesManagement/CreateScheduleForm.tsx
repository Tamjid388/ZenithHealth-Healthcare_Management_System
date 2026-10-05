"use client";

import { createScheduleAction } from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button } from "@/components/ui";
import {
  createScheduleZodSchema,
  scheduleFieldsZodSchema,
  TCreateScheduleInput,
} from "@/zod/schedule.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type CreateScheduleFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = toDateInputValue(new Date());

const defaultValues: TCreateScheduleInput = {
  startDate: today,
  endDate: today,
  startTime: "09:00",
  endTime: "17:00",
};

export const CreateScheduleForm = ({
  onSuccess,
  onCancel,
}: CreateScheduleFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TCreateScheduleInput) =>
      createScheduleAction(data),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createScheduleZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["schedules"] });
        form.reset();
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to create schedule");
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
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="startDate"
          validators={{ onChange: scheduleFieldsZodSchema.shape.startDate }}
        >
          {(field) => (
            <AppField field={field} label="Start date" type="date" />
          )}
        </form.Field>

        <form.Field
          name="endDate"
          validators={{ onChange: scheduleFieldsZodSchema.shape.endDate }}
        >
          {(field) => (
            <AppField field={field} label="End date" type="date" />
          )}
        </form.Field>

        <form.Field
          name="startTime"
          validators={{ onChange: scheduleFieldsZodSchema.shape.startTime }}
        >
          {(field) => (
            <AppField field={field} label="Start time" type="time" />
          )}
        </form.Field>

        <form.Field
          name="endTime"
          validators={{ onChange: scheduleFieldsZodSchema.shape.endTime }}
        >
          {(field) => (
            <AppField field={field} label="End time" type="time" />
          )}
        </form.Field>
      </div>

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
              Create Schedule
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateScheduleForm;
