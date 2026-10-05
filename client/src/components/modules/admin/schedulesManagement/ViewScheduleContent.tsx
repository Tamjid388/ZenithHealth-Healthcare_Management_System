"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleDetails } from "@/types/schedules.types";

type ViewScheduleContentProps = {
  schedule: ScheduleDetails;
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

export const ViewScheduleContent = ({ schedule }: ViewScheduleContentProps) => {
  const appointments = schedule.appointments ?? [];
  const doctorSchedules = schedule.doctorSchedules ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem
          label="Start"
          value={formatDateTime(schedule.startDateTime)}
        />
        <DetailItem label="End" value={formatDateTime(schedule.endDateTime)} />
        <DetailItem
          label="Duration"
          value={formatDuration(schedule.startDateTime, schedule.endDateTime)}
        />
        <DetailItem
          label="Created"
          value={formatDateTime(schedule.createdAt)}
        />
        <DetailItem
          label="Updated"
          value={formatDateTime(schedule.updatedAt)}
        />
        <DetailItem label="ID" value={schedule.id} />
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">Doctor assignments</h4>
        {doctorSchedules.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Booked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorSchedules.map((item) => (
                  <TableRow
                    key={`${item.doctorId}-${item.scheduleId}`}
                  >
                    <TableCell>{item.doctor?.name ?? "—"}</TableCell>
                    <TableCell>{item.doctor?.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.isBooked ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No doctors assigned to this slot.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">Appointments</h4>
        {appointments.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.patient?.name ?? "—"}
                    </TableCell>
                    <TableCell>{appointment.doctor?.name ?? "—"}</TableCell>
                    <TableCell>{appointment.status ?? "—"}</TableCell>
                    <TableCell>
                      {formatDateTime(appointment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No appointments for this slot.
          </p>
        )}
      </section>
    </div>
  );
};

export default ViewScheduleContent;
