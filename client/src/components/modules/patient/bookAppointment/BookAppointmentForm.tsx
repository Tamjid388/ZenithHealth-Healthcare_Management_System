"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { bookAppointmentAction } from "@/app/(dashboardLayout)/(patientRouteGroup)/(patientDashboardLayout)/(dashboard)/dashboard/book-appointments/_action";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, Button } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDoctorById, getDoctors } from "@/services/doctors.service";
import {
  bookAppointmentZodSchema,
  type TBookAppointmentInput,
} from "@/zod/appointment.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";

const DOCTORS_PICKER_PARAMS = { page: 1, limit: 50 };

const formatSlotDay = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const formatSlotTime = (start: string | Date, end: string | Date) =>
  `${new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} – ${new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

type BookAppointmentFormProps = {
  initialDoctorId?: string;
};

const defaultValues: TBookAppointmentInput = {
  doctorId: "",
  scheduleId: "",
};

export const BookAppointmentForm = ({
  initialDoctorId = "",
}: BookAppointmentFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");

  const { data: doctorsResponse, isPending: isLoadingDoctors } = useQuery({
    queryKey: ["doctors", DOCTORS_PICKER_PARAMS],
    queryFn: () => getDoctors(DOCTORS_PICKER_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  const doctors = useMemo(() => {
    const all = doctorsResponse?.data ?? [];
    const term = doctorSearch.trim().toLowerCase();
    if (!term) {
      return all;
    }
    return all.filter((doctor) =>
      doctor.name.toLowerCase().includes(term),
    );
  }, [doctorsResponse, doctorSearch]);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TBookAppointmentInput) =>
      bookAppointmentAction(data),
  });

  const form = useForm({
    defaultValues: { ...defaultValues, doctorId: initialDoctorId },
    validators: {
      onSubmit: bookAppointmentZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        setServerError(null);
        setBooked(true);
      } catch (error) {
        unstable_rethrow(error);
        setServerError(
          (error as Error).message || "Failed to book appointment",
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
      className="space-y-6"
    >
      {booked ? (
        <div className="space-y-4 rounded-2xl bg-emerald-50 px-6 py-8 text-center ring-1 ring-emerald-600/20">
          <p className="font-heading text-xl text-emerald-900">
            Appointment booked!
          </p>
          <p className="text-sm text-emerald-800">
            Your time slot is reserved. Payment stays unpaid until the payment
            step is added.
          </p>
          <Link href="/dashboard/my-appointments">
            <Button type="button" className="cursor-pointer rounded-xl">
              View my appointments
            </Button>
          </Link>
        </div>
      ) : null}

      {/* Step 1 — doctor */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg text-zh-blue-deep">
          1. Choose a doctor
        </h2>
        <input
          type="search"
          value={doctorSearch}
          onChange={(event) => setDoctorSearch(event.target.value)}
          placeholder="Search doctors by name..."
          aria-label="Search doctors by name"
          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        {isLoadingDoctors ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : null}
        {!isLoadingDoctors && doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No doctors found. Try a different search.
          </p>
        ) : null}
        {!isLoadingDoctors && doctors.length > 0 ? (
          <form.Field name="doctorId">
            {(field) => (
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                {doctors.map((doctor) => {
                  const selected = field.state.value === doctor.id;
                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        field.handleChange(doctor.id);
                        form.setFieldValue("scheduleId", "");
                        setBooked(false);
                        setServerError(null);
                      }}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                        selected
                          ? "border-zh-blue bg-zh-foam/50"
                          : "border-zh-blue-deep/10 hover:bg-muted/50"
                      }`}
                    >
                      <span>
                        <span className="block font-semibold text-zh-ink">
                          {doctor.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-zh-ink/60">
                          {doctor.designation || "Physician"}
                          {doctor.currentWorkingPlace
                            ? ` · ${doctor.currentWorkingPlace}`
                            : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-zh-blue-deep">
                        ৳
                        {(doctor.appointmentFee ?? 0).toLocaleString("en-BD")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </form.Field>
        ) : null}
      </section>

      {/* Step 2 — slot */}
      <form.Subscribe
        selector={(state) =>
          [state.values.doctorId, state.values.scheduleId] as const
        }
      >
        {([doctorId, scheduleId]) =>
          doctorId ? (
            <DoctorSlots
              doctorId={doctorId}
              selectedScheduleId={scheduleId}
              onSelectSchedule={(id) => form.setFieldValue("scheduleId", id)}
            />
          ) : null
        }
      </form.Subscribe>

      {serverError ? (
        <Alert variant="destructive" className="text-sm text-red-500">
          {serverError}
        </Alert>
      ) : null}

      {!booked ? (
        <div className="space-y-2">
          <form.Subscribe
            selector={(state) =>
              [
                state.fieldMeta.doctorId?.errors ?? [],
                state.fieldMeta.scheduleId?.errors ?? [],
              ] as const
            }
          >
            {([doctorErrors, scheduleErrors]) => {
              const firstError = [...doctorErrors, ...scheduleErrors][0];
              return firstError ? (
                <p className="text-sm text-red-500" role="alert">
                  {typeof firstError === "string"
                    ? firstError
                    : (firstError as { message?: string })?.message ??
                      "Please choose a doctor and a time slot."}
                </p>
              ) : null;
            }}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) =>
              [state.canSubmit, state.isSubmitting] as const
            }
          >
            {([canSubmit, isSubmitting]) => (
              <AppSubmitButton
                disabled={!canSubmit || isSubmitting}
                isPending={isSubmitting}
              >
                Confirm booking
              </AppSubmitButton>
            )}
          </form.Subscribe>
        </div>
      ) : null}
    </form>
  );
};

const DoctorSlots = ({
  doctorId,
  selectedScheduleId,
  onSelectSchedule,
}: {
  doctorId: string;
  selectedScheduleId: string;
  onSelectSchedule: (scheduleId: string) => void;
}) => {
  const [now] = useState(() => Date.now());
  const {
    data: doctorResponse,
    isPending: isLoadingSlots,
    isError: isSlotsError,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    staleTime: 1000 * 30,
  });

  const openSlots = useMemo(() => {
    return (doctorResponse?.data?.doctorSchedules ?? [])
      .filter((item) => {
        const start = item.schedule?.startDateTime;
        const end = item.schedule?.endDateTime;
        if (!start || !end) {
          return false;
        }
        return !item.isBooked && new Date(end).getTime() >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.schedule!.startDateTime as string).getTime() -
          new Date(b.schedule!.startDateTime as string).getTime(),
      );
  }, [doctorResponse, now]);

  if (isLoadingSlots) {
    return (
      <section className="space-y-3">
        <h2 className="font-heading text-lg text-zh-blue-deep">
          2. Pick a time
        </h2>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    );
  }

  if (isSlotsError) {
    return (
      <Alert variant="destructive" className="text-sm text-red-500">
        Failed to load this doctor&apos;s availability. Please try again.
      </Alert>
    );
  }

  if (openSlots.length === 0) {
    return (
      <p className="rounded-xl bg-zh-mist/60 px-4 py-6 text-center text-sm text-zh-ink/60">
        No open slots for this doctor right now. Pick another clinician.
      </p>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg text-zh-blue-deep">2. Pick a time</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {openSlots.map((item) => {
          const scheduleId = item.schedule?.id;
          if (!scheduleId) {
            return null;
          }
          const selected = selectedScheduleId === scheduleId;
          return (
            <button
              key={scheduleId}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectSchedule(scheduleId)}
              className={`cursor-pointer rounded-xl border p-3.5 text-left transition-colors ${
                selected
                  ? "border-emerald-600 bg-emerald-50/60"
                  : "border-emerald-600/20 bg-emerald-50/30 hover:bg-emerald-50/60"
              }`}
            >
              <span className="block text-sm font-semibold text-zh-ink">
                {formatSlotDay(item.schedule!.startDateTime as string)}
              </span>
              <span className="mt-0.5 block text-[13px] text-zh-ink/65">
                {formatSlotTime(
                  item.schedule!.startDateTime as string,
                  item.schedule!.endDateTime as string,
                )}
              </span>
              <span className="mt-2">
                <Badge className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {selected ? "Selected" : "Available"}
                </Badge>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Fee ৳
        {(doctorResponse?.data?.appointmentFee ?? 0).toLocaleString("en-BD")}{" "}
        per visit · booked as UNPAID.
      </p>
    </section>
  );
};

export default BookAppointmentForm;
