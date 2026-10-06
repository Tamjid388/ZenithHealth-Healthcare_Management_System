"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import type { MyAppointment } from "@/types/appointments.types";

type AppointmentDetailsModalProps = {
  appointment: MyAppointment | null;
  showPatient?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDateTime = (value?: string | Date | null) => {
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

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {label}
    </p>
    <p className="text-sm break-all text-foreground">{value ?? "—"}</p>
  </div>
);

export const AppointmentDetailsModal = ({
  appointment,
  showPatient = false,
  open,
  onOpenChange,
}: AppointmentDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            Schedule, people, and payment status for this appointment.
          </DialogDescription>
        </DialogHeader>

        {!appointment ? (
          <p className="text-sm text-muted-foreground">
            Appointment not found.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  appointment.status === "SCHEDULED"
                    ? "default"
                    : "secondary"
                }
                className="rounded-full"
              >
                {appointment.status}
              </Badge>
              {appointment.paymentStatus ? (
                <Badge variant="outline" className="rounded-full">
                  {appointment.paymentStatus}
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Doctor"
                value={appointment.doctor?.name ?? "—"}
              />
              {showPatient ? (
                <DetailItem
                  label="Patient"
                  value={
                    appointment.patient
                      ? `${appointment.patient.name} (${appointment.patient.email})`
                      : "—"
                  }
                />
              ) : null}
              <DetailItem
                label="Starts"
                value={formatDateTime(appointment.schedule?.startDateTime)}
              />
              <DetailItem
                label="Ends"
                value={formatDateTime(appointment.schedule?.endDateTime)}
              />
              <DetailItem
                label="Fee"
                value={
                  appointment.payment
                    ? `৳${appointment.payment.amount.toLocaleString("en-BD")}`
                    : appointment.doctor?.appointmentFee != null
                      ? `৳${appointment.doctor.appointmentFee.toLocaleString("en-BD")}`
                      : "—"
                }
              />
              <DetailItem
                label="Booked on"
                value={formatDateTime(appointment.createdAt)}
              />
              <DetailItem
                label="Video calling ID"
                value={appointment.videoCallingId ?? "—"}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
