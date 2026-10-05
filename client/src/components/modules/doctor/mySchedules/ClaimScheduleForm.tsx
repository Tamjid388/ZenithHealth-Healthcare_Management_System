"use client";

import { createMyDoctorScheduleAction } from "@/app/(dashboardLayout)/doctor/dashboard/my-schedules/_action";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { getSchedules } from "@/services/schedules.service";
import {
  createMyDoctorScheduleZodSchema,
  type TCreateMyDoctorScheduleInput,
} from "@/zod/doctor-schedule.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useMemo, useState } from "react";

type ClaimScheduleFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const formatDateTime = (value?: string | Date) => {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const defaultValues: TCreateMyDoctorScheduleInput = {
  scheduleIds: [],
};

export const ClaimScheduleForm = ({
  onSuccess,
  onCancel,
}: ClaimScheduleFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const availableParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      startDateTime: { gte: new Date().toISOString() },
    }),
    [],
  );

  const {
    data: schedulesResponse,
    isPending: isLoadingSchedules,
    isError: isSchedulesError,
  } = useQuery({
    queryKey: ["schedules", availableParams],
    queryFn: () => getSchedules(availableParams),
    staleTime: 1000 * 30,
  });

  const availableSchedules = schedulesResponse?.data ?? [];

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TCreateMyDoctorScheduleInput) =>
      createMyDoctorScheduleAction(data),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createMyDoctorScheduleZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
        form.reset();
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to claim schedule");
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
      {isLoadingSchedules ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : null}

      {!isLoadingSchedules && isSchedulesError ? (
        <Alert variant="destructive" className="text-sm text-red-500">
          Failed to load available schedules. Please try again.
        </Alert>
      ) : null}

      {!isLoadingSchedules && !isSchedulesError && availableSchedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No available schedules to claim right now.
        </p>
      ) : null}

      {!isLoadingSchedules &&
      !isSchedulesError &&
      availableSchedules.length > 0 ? (
        <form.Field name="scheduleIds">
          {(field) => {
            const selectedIds = field.state.value ?? [];
            const toggleId = (id: string, checked: boolean) => {
              const nextIds = checked
                ? [...selectedIds, id]
                : selectedIds.filter((item) => item !== id);
              field.handleChange(nextIds);
            };

            return (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {availableSchedules.map((schedule) => {
                  const checked = selectedIds.includes(schedule.id);
                  return (
                    <label
                      key={schedule.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(checkedState) =>
                          toggleId(schedule.id, checkedState === true)
                        }
                      />
                      <span className="flex-1">
                        {formatDateTime(schedule.startDateTime)}
                        {" – "}
                        {formatDateTime(schedule.endDateTime)}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          }}
        </form.Field>
      ) : null}

      <form.Subscribe selector={(state) => state.values.scheduleIds as string[]}>
        {(scheduleIds) => (
          <p className="text-sm text-muted-foreground">
            {scheduleIds.length > 0
              ? `${scheduleIds.length} slot${scheduleIds.length > 1 ? "s" : ""} selected`
              : "Select at least one slot"}
          </p>
        )}
      </form.Subscribe>

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
              disabled={!canSubmit || isSubmitting || isLoadingSchedules}
              isPending={isSubmitting}
              className="sm:w-auto"
            >
              Claim Selected
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default ClaimScheduleForm;
