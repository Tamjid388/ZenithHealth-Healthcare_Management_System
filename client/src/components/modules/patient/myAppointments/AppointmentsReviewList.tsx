"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ReviewForm } from "@/components/modules/reviews/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyAppointments } from "@/services/appointments.service";
import {
  DEFAULT_MY_APPOINTMENTS_LIST_PARAMS,
  MyAppointment,
} from "@/types/appointments.types";

const PAGE_SIZE = DEFAULT_MY_APPOINTMENTS_LIST_PARAMS.limit ?? 10;

function formatDateTime(value?: string | Date) {
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
}

function AppointmentReviewCard({
  appointment,
  reviewed,
  onSubmitted,
}: {
  appointment: MyAppointment;
  reviewed: boolean;
  onSubmitted: (appointmentId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-2xl bg-white ring-1 ring-zh-blue-deep/10">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-lg text-zh-blue-deep">
              {appointment.doctor?.name ?? "Clinician"}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-zh-ink/65">
              <CalendarClock className="size-4" aria-hidden="true" />
              {formatDateTime(appointment.schedule?.startDateTime)}
            </p>
          </div>
          <Badge
            variant={appointment.status === "COMPLETED" ? "default" : "secondary"}
            className="rounded-full"
          >
            {appointment.status}
          </Badge>
        </div>

        {reviewed ? (
          <p className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-600/20">
            <BadgeCheck className="size-4" aria-hidden="true" />
            Review submitted — thank you
          </p>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="h-11 cursor-pointer rounded-xl"
            >
              <Star className="size-4" aria-hidden="true" />
              {open ? "Hide review form" : "Write a review"}
            </Button>
            {open ? (
              <div className="rounded-xl bg-zh-mist/60 p-4">
                <ReviewForm
                  appointmentId={appointment.id}
                  doctorName={appointment.doctor?.name}
                  onSubmitted={onSubmitted}
                />
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AppointmentsReviewList() {
  const [page, setPage] = useState(1);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const queryParams = useMemo(
    () => ({ ...DEFAULT_MY_APPOINTMENTS_LIST_PARAMS, page, limit: PAGE_SIZE }),
    [page],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["my-appointments", queryParams],
    queryFn: () => getMyAppointments(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30 * 3,
  });

  const appointments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const completed = appointments.filter((item) => item.status === "COMPLETED");

  const markSubmitted = (appointmentId: string) => {
    setReviewedIds((previous) =>
      previous.includes(appointmentId)
        ? previous
        : [...previous, appointmentId],
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
          My Appointments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave a rating for your completed visits. Only completed appointments
          can be reviewed.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-destructive/20">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="size-5" aria-hidden="true" />
          </span>
          <p className="max-w-md text-sm text-zh-ink/75">
            {error instanceof Error
              ? error.message
              : "Failed to load appointments. Please try again."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && completed.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-zh-ink/65 ring-1 ring-zh-blue-deep/10">
          No completed visits yet. Your finished appointments will appear here
          for review.
        </p>
      ) : null}

      {!isLoading && !isError && completed.length > 0 ? (
        <ul className="space-y-4">
          {completed.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentReviewCard
                appointment={appointment}
                reviewed={reviewedIds.includes(appointment.id)}
                onSubmitted={markSubmitted}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-11 cursor-pointer rounded-xl"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <p className="text-sm text-zh-ink/60" aria-live="polite">
            Page {page} of {totalPages}
            {isFetching ? " — updating…" : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="h-11 cursor-pointer rounded-xl"
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
