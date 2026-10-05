"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import type { MyDoctorSchedule } from "@/types/doctor-schedules.types";

type ViewMyScheduleModalProps = {
  schedule: MyDoctorSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const ViewMyScheduleModal = ({
  schedule,
  open,
  onOpenChange,
}: ViewMyScheduleModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule details</DialogTitle>
          <DialogDescription>
            Slot time and booking status for this schedule.
          </DialogDescription>
        </DialogHeader>

        {!schedule ? (
          <p className="text-sm text-muted-foreground">Schedule not found.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {schedule.isBooked ? "Booked" : "Free"}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Start"
                value={formatDateTime(schedule.schedule?.startDateTime)}
              />
              <DetailItem
                label="End"
                value={formatDateTime(schedule.schedule?.endDateTime)}
              />
              <DetailItem
                label="Duration"
                value={formatDuration(
                  schedule.schedule?.startDateTime,
                  schedule.schedule?.endDateTime,
                )}
              />
              <DetailItem
                label="Claimed"
                value={formatDateTime(schedule.createdAt)}
              />
              <DetailItem
                label="Updated"
                value={formatDateTime(schedule.updatedAt)}
              />
              <DetailItem label="Schedule ID" value={schedule.scheduleId} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewMyScheduleModal;
