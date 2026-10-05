"use client";

import {
  getScheduleByIdAction,
  updateScheduleAction,
} from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button } from "@/components/ui";
import { ScheduleDetails } from "@/types/schedules.types";
import {
  scheduleFieldsZodSchema,
  TUpdateScheduleInput,
  updateScheduleZodSchema,
} from "@/zod/schedule.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type EditScheduleFormProps = {
  scheduleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const toDateInputValue = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const buildDefaultValues = (
  schedule: ScheduleDetails,
): TUpdateScheduleInput => ({
  startDate: toDateInputValue(schedule.startDateTime),
  endDate: toDateInputValue(schedule.endDateTime),
  startTime: toTimeInputValue(schedule.startDateTime),
  endTime: toTimeInputValue(schedule.endDateTime),
});

type EditScheduleFormFieldsProps = {
  schedule: ScheduleDetails;
  scheduleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const EditScheduleFormFields = ({
  schedule,
  scheduleId,
  onSuccess,
  onCancel,
}: EditScheduleFormFieldsProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TUpdateScheduleInput) =>
      updateScheduleAction(scheduleId, data),
  });

  const form = useForm({
    defaultValues: buildDefaultValues(schedule),
    validators: {
      onSubmit: updateScheduleZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ["schedules"] });
        await queryClient.invalidateQueries({
          queryKey: ["schedule", scheduleId],
        });
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to update schedule");
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
              Save changes
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export const EditScheduleForm = ({
  scheduleId,
  onSuccess,
  onCancel,
}: EditScheduleFormProps) => {
  const {
    data: scheduleResponse,
    isPending: isSchedulePending,
    isError: isScheduleError,
    error: scheduleError,
  } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const result = await getScheduleByIdAction(scheduleId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    staleTime: 1000 * 30,
  });

  const schedule = scheduleResponse?.data;

  if (isSchedulePending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading schedule details...
      </p>
    );
  }

  if (isScheduleError) {
    return (
      <Alert variant="destructive" className="text-sm">
        {scheduleError instanceof Error
          ? scheduleError.message
          : "Failed to load schedule details."}
      </Alert>
    );
  }

  if (!schedule) {
    return (
      <Alert variant="destructive" className="text-sm">
        Schedule not found.
      </Alert>
    );
  }

  return (
    <EditScheduleFormFields
      key={schedule.id}
      schedule={schedule}
      scheduleId={scheduleId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default EditScheduleForm;
