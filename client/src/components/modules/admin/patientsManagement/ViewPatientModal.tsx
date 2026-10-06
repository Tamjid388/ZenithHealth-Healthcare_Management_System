"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPatientById } from "@/services/patients.service";

type ViewPatientModalProps = {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

export const ViewPatientModal = ({
  patientId,
  open,
  onOpenChange,
}: ViewPatientModalProps) => {
  const {
    data: patientResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }
      return getPatientById(patientId);
    },
    enabled: open && Boolean(patientId),
    staleTime: 1000 * 30,
  });

  const patient = patientResponse?.data;
  const stats = patient
    ? [
        { label: "Appointments", count: patient.appointments?.length ?? 0 },
        { label: "Prescriptions", count: patient.prescriptions?.length ?? 0 },
        { label: "Reviews", count: patient.reviews?.length ?? 0 },
        { label: "Medical reports", count: patient.medicalReports?.length ?? 0 },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient details</DialogTitle>
          <DialogDescription>
            Profile and medical record overview.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="destructive" className="text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load patient details."}
          </Alert>
        ) : null}

        {!isPending && !isError && patient ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {patient.profilePhoto ? (
                  <AvatarImage src={patient.profilePhoto} alt={patient.name} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{patient.name}</p>
                <p className="text-sm text-muted-foreground">{patient.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border p-3"
                >
                  <p className="text-xl font-semibold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <dl className="divide-y divide-border rounded-lg border border-border px-4">
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="text-sm font-medium">
                  {patient.user?.status ? (
                    <Badge
                      variant={
                        patient.user.status === "ACTIVE"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {patient.user.status}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Contact</dt>
                <dd className="text-sm font-medium">
                  {patient.contactNumber ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd className="text-sm font-medium text-right">
                  {patient.address ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Member since</dt>
                <dd className="text-sm font-medium">
                  {formatDate(patient.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPatientModal;
