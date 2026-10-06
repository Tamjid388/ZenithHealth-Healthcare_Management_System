"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { unstable_rethrow } from "next/navigation";

import { createReviewAction } from "@/app/(dashboardLayout)/(patientRouteGroup)/(patientDashboardLayout)/(dashboard)/dashboard/my-appointments/_action";
import { Alert, Textarea } from "@/components/ui";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { cn } from "@/lib/utils";
import { createReviewZodSchema } from "@/zod/review.validation";
import { fieldValidator } from "@/components/shared/form/fieldValidator";

type ReviewFormProps = {
  appointmentId: string;
  doctorName?: string;
  onSubmitted?: (appointmentId: string) => void;
};

function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-6 transition-colors",
              star <= shown
                ? "fill-zh-blue text-zh-blue"
                : "fill-zh-foam text-zh-foam",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({
  appointmentId,
  doctorName,
  onSubmitted,
}: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      rating: number;
      comment?: string;
    }) => createReviewAction(data),
  });

  const form = useForm({
    defaultValues: {
      appointmentId,
      rating: 0,
      comment: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createReviewZodSchema.safeParse(value);
        return result.success ? undefined : result.error.message;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync({
          appointmentId: value.appointmentId,
          rating: value.rating,
          comment: value.comment?.trim() ? value.comment.trim() : undefined,
        });
        if (!result.success) {
          setServerError(result.message);
          if (result.alreadyReviewed) {
            onSubmitted?.(value.appointmentId);
          }
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        await queryClient.invalidateQueries({ queryKey: ["doctor"] });
        form.reset();
        setServerError(null);
        onSubmitted?.(value.appointmentId);
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to submit review");
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
        name="rating"
        validators={{
          onChange: createReviewZodSchema.shape.rating,
        }}
      >
        {(field) => {
          const firstError =
            field.state.meta.isTouched && field.state.meta.errors.length > 0
              ? field.state.meta.errors[0]
              : null;
          return (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-900">
                Your rating{doctorName ? ` for ${doctorName}` : ""}
              </p>
              <StarRatingInput
                value={field.state.value ?? 0}
                onChange={(rating) => field.handleChange(rating)}
              />
              {firstError ? (
                <p className="text-sm text-red-500" role="alert">
                  {typeof firstError === "string"
                    ? firstError
                    : "Select a rating between 1 and 5"}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="comment"
        validators={{
          onChange: fieldValidator(createReviewZodSchema.shape.comment),
        }}
      >
        {(field) => {
          const firstError =
            field.state.meta.isTouched && field.state.meta.errors.length > 0
              ? field.state.meta.errors[0]
              : null;
          return (
            <div className="space-y-1.5">
              <label htmlFor={`${appointmentId}-comment`} className="text-sm font-medium text-gray-900">
                Comment <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <Textarea
                id={`${appointmentId}-comment`}
                placeholder="How was your visit?"
                rows={3}
                maxLength={1000}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={firstError !== null}
                aria-describedby={
                  firstError ? `${appointmentId}-comment-error` : undefined
                }
              />
              {firstError ? (
                <p
                  id={`${appointmentId}-comment-error`}
                  className="text-sm text-red-500"
                  role="alert"
                >
                  {typeof firstError === "string"
                    ? firstError
                    : "Comment must be at most 1000 characters"}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <AppSubmitButton
            disabled={!canSubmit || isSubmitting}
            isPending={isSubmitting}
          >
            Submit review
          </AppSubmitButton>
        )}
      </form.Subscribe>

      {serverError ? (
        <Alert variant="destructive" className="text-sm text-red-500">
          {serverError}
        </Alert>
      ) : null}

    </form>
  );
}
