"use client";

import { Badge } from "@/components/ui/badge";
import { AdminDoctorSchedule } from "@/types/doctor-schedules.types";

type ViewDoctorScheduleContentProps = {
  doctorSchedule: AdminDoctorSchedule;
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

const formatDuration = (start?: string | Date, end?: string | Date) => {
  if (!start || !end) {
    return "—";
  }

  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "—";
  }

  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  if (minutes <= 0) {
    return "—";
  }

  return `${minutes} min`;
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm text-foreground">{value ?? "—"}</p>
  </div>
);

export const ViewDoctorScheduleContent = ({
  doctorSchedule,
}: ViewDoctorScheduleContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {doctorSchedule.isBooked ? "Booked" : "Free"}
        </Badge>
        {doctorSchedule.doctor?.user?.status ? (
          <Badge variant="outline">{doctorSchedule.doctor.user.status}</Badge>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Doctor" value={doctorSchedule.doctor?.name} />
        <DetailItem label="Doctor email" value={doctorSchedule.doctor?.email} />
        <DetailItem label="Doctor ID" value={doctorSchedule.doctorId} />
        <DetailItem
          label="Start"
          value={formatDateTime(doctorSchedule.schedule?.startDateTime)}
        />
        <DetailItem
          label="End"
          value={formatDateTime(doctorSchedule.schedule?.endDateTime)}
        />
        <DetailItem
          label="Duration"
          value={formatDuration(
            doctorSchedule.schedule?.startDateTime,
            doctorSchedule.schedule?.endDateTime,
          )}
        />
        <DetailItem label="Schedule ID" value={doctorSchedule.scheduleId} />
        <DetailItem
          label="Assigned"
          value={formatDateTime(doctorSchedule.createdAt)}
        />
        <DetailItem
          label="Updated"
          value={formatDateTime(doctorSchedule.updatedAt)}
        />
      </div>
    </div>
  );
};

export default ViewDoctorScheduleContent;
