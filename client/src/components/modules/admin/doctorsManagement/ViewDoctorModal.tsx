"use client";

import { useQuery } from "@tanstack/react-query";

import { getDoctorByIdAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
import { ViewDoctorContent } from "@/components/modules/admin/doctorsManagement/ViewDoctorContent";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

type ViewDoctorModalProps = {
  doctorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ViewDoctorModal = ({
  doctorId,
  open,
  onOpenChange,
}: ViewDoctorModalProps) => {
  const {
    data: doctorResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      if (!doctorId) {
        throw new Error("Doctor ID is required");
      }

      const result = await getDoctorByIdAction(doctorId);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    enabled: open && Boolean(doctorId),
    staleTime: 1000 * 30,
  });

  const doctor = doctorResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor details</DialogTitle>
          <DialogDescription>
            Full profile, appointments, schedules, and reviews.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="destructive" className="text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load doctor details."}
          </Alert>
        ) : null}

        {!isPending && !isError && doctor ? (
          <ViewDoctorContent doctor={doctor} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewDoctorModal;
