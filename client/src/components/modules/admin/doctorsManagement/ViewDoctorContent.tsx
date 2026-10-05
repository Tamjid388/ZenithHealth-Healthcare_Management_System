"use client";

import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IDoctorDetails } from "@/types/doctors.types";

type ViewDoctorContentProps = {
  doctor: IDoctorDetails;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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

export const ViewDoctorContent = ({ doctor }: ViewDoctorContentProps) => {
  const specialities =
    doctor.doctorSpecialities
      ?.map((item) => item.speciality?.title)
      .filter((title): title is string => Boolean(title)) ?? [];

  const appointments = doctor.appointments ?? [];
  const schedules = doctor.doctorSchedules ?? [];
  const reviews = doctor.reviews ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar size="lg" className="size-16">
          {doctor.profilePhoto ? (
            <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
          ) : null}
          <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{doctor.name}</h3>
            <Badge variant="outline">{doctor.user.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{doctor.email}</p>
          <p className="inline-flex items-center gap-1 text-sm">
            <Star className="size-3 fill-zh-blue text-zh-blue" aria-hidden />
            {(doctor.averageRating ?? 0).toFixed(1)} average rating
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Designation" value={doctor.designation} />
        <DetailItem
          label="Working place"
          value={doctor.currentWorkingPlace}
        />
        <DetailItem
          label="Registration #"
          value={doctor.registrationNumber}
        />
        <DetailItem label="Gender" value={doctor.gender} />
        <DetailItem
          label="Experience"
          value={
            doctor.experience == null ? undefined : `${doctor.experience} yrs`
          }
        />
        <DetailItem
          label="Appointment fee"
          value={`৳${doctor.appointmentFee}`}
        />
        <DetailItem label="Contact" value={doctor.contactNumber} />
        <DetailItem label="Address" value={doctor.address} />
        <DetailItem label="Qualifications" value={doctor.qualifications} />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Specialities</h4>
        {specialities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specialities.map((title) => (
              <Badge key={title} variant="secondary">
                {title}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No specialities listed.</p>
        )}
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">Appointments</h4>
        {appointments.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.patient?.name ?? "—"}
                    </TableCell>
                    <TableCell>{appointment.status ?? "—"}</TableCell>
                    <TableCell>
                      {formatDateTime(appointment.schedule?.startDateTime)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(appointment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">Schedules</h4>
        {schedules.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Booked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((item, index) => (
                  <TableRow key={item.id ?? `${item.schedule?.id}-${index}`}>
                    <TableCell>
                      {formatDateTime(item.schedule?.startDateTime)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(item.schedule?.endDateTime)}
                    </TableCell>
                    <TableCell>{item.isBooked ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No schedules found.</p>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-medium">Reviews</h4>
        {reviews.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.rating ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment ?? "—"}
                    </TableCell>
                    <TableCell>{formatDateTime(review.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews found.</p>
        )}
      </section>
    </div>
  );
};

export default ViewDoctorContent;
