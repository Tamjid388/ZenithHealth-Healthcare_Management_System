"use client";

import { EditProfileDialog } from "@/components/modules/profile/EditProfileDialog";
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Skeleton } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMyProfile } from "@/services/profile.service";
import type { TMyProfile } from "@/types/user.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Expand, Key, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const formatRole = (role: string) =>
  role.toLowerCase().replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 transition-colors">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right break-all">{value}</dd>
    </div>
  );
}

function MyProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

function DoctorSection({ profile }: { profile: TMyProfile }) {
  const doctor = profile.doctor;
  if (!doctor) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Professional</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <InfoRow label="Designation" value={doctor.designation ?? "—"} />
          <InfoRow label="Workplace" value={doctor.currentWorkingPlace ?? "—"} />
          <InfoRow label="Registration No." value={doctor.registrationNumber ?? "—"} />
          <InfoRow label="Experience" value={doctor.experience !== undefined ? `${doctor.experience} yrs` : "—"} />
          <InfoRow label="Appointment fee" value={doctor.appointmentFee !== undefined ? `${doctor.appointmentFee}` : "—"} />
          <InfoRow label="Qualifications" value={doctor.qualifications ?? "—"} />
          <InfoRow label="Average rating" value={doctor.averageRating !== undefined ? `${doctor.averageRating}` : "—"} />
        </dl>
        {doctor.doctorSpecialities && doctor.doctorSpecialities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {doctor.doctorSpecialities.map((item) => (
              <Badge key={`${item.doctorId}-${item.specialityId}`} variant="secondary">
                {item.speciality?.title ?? "Speciality"}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PatientSection({ profile }: { profile: TMyProfile }) {
  const patient = profile.patient;
  if (!patient) return null;
  const stats = [
    { label: "Appointments", count: patient.appointments?.length ?? 0, href: "/dashboard/my-appointments" },
    { label: "Prescriptions", count: patient.prescriptions?.length ?? 0, href: "/dashboard/my-prescriptions" },
    { label: "Health records", count: patient.medicalReports?.length ?? 0, href: "/dashboard/health-records" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Medical overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-lg border border-border p-4 transition-colors duration-200 hover:bg-accent cursor-pointer"
            >
              <p className="text-2xl font-semibold">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          ))}
        </div>
        {(patient.contactNumber || patient.address) && (
          <dl className="mt-4 divide-y divide-border border-t border-border">
            <InfoRow label="Contact" value={patient.contactNumber ?? "—"} />
            <InfoRow label="Address" value={patient.address ?? "—"} />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

export const MyProfileContent = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMyProfile,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) {
    return <MyProfileSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">Failed to load your profile. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  const profile: TMyProfile = data;
  const adminProfile = profile.admin ?? profile.admins?.[0];
  const photo =
    profile.image ??
    profile.patient?.profilePhoto ??
    profile.doctor?.profilePhoto ??
    adminProfile?.profilePhoto ??
    null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          {photo ? (
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              aria-label={`View profile photo of ${profile.name}`}
              title="View photo"
              className="group relative shrink-0 cursor-pointer rounded-full transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="size-16">
                <AvatarImage src={photo} alt={profile.name} />
                <AvatarFallback className="text-xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors duration-200 group-hover:bg-black/45 group-focus-visible:bg-black/45"
              >
                <Expand className="size-5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
              </span>
            </button>
          ) : (
            <Avatar className="size-16 shrink-0">
              <AvatarFallback className="text-xl font-semibold">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1 basis-48">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2>
              <Badge variant="secondary">{formatRole(profile.role)}</Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.status && (
                <Badge variant="outline" className="text-xs">{profile.status}</Badge>
              )}
              <Badge variant={profile.emailVerified ? "secondary" : "destructive"} className="text-xs">
                {profile.emailVerified ? "Email verified" : "Email not verified"}
              </Badge>
              {profile.needPasswordChange && <Badge variant="destructive" className="text-xs">Password change required</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="cursor-pointer">
              <Pencil className="mr-2 size-4" aria-hidden="true" />
              Edit profile
            </Button>
            <Link href="/change-password">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Key className="mr-2 size-4" aria-hidden="true" />
                Change password
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <InfoRow label="Name" value={profile.name} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Role" value={formatRole(profile.role)} />
            <InfoRow label="Status" value={profile.status ?? "—"} />
            <InfoRow label="Member since" value={formatDate(profile.createdAt)} />
            <InfoRow label="Last updated" value={formatDate(profile.updatedAt)} />
          </dl>
        </CardContent>
      </Card>

      <DoctorSection profile={profile} />
      <PatientSection profile={profile} />

      <EditProfileDialog profile={profile} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-md overflow-hidden border-0 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Profile photo of {profile.name}</DialogTitle>
            <DialogDescription>
              Large preview of {profile.name}&apos;s profile photo.
            </DialogDescription>
          </DialogHeader>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={`Profile photo of ${profile.name}`}
              className="max-h-[80vh] w-full object-contain bg-muted"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyProfileContent;
