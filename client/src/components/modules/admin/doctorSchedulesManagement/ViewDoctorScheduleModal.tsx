"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDoctorScheduleByIdAction } from "@/app/(dashboardLayout)/admin/dashboard/doctor-schedules-management/_action";
import { ViewDoctorScheduleContent } from "@/components/modules/admin/doctorSchedulesManagement/ViewDoctorScheduleContent";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

type ViewDoctorScheduleModalProps = {
  doctorId: string | null;
  scheduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ViewDoctorScheduleModal = ({
  doctorId,
  scheduleId,
  open,
  onOpenChange,
}: ViewDoctorScheduleModalProps) => {
  const {
    data: doctorScheduleResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-doctor-schedule", doctorId, scheduleId],
    queryFn: async () => {
      if (!doctorId || !scheduleId) {
        throw new Error("Doctor ID and schedule ID are required");
      }

      const result = await getAdminDoctorScheduleByIdAction(
        doctorId,
        scheduleId,
      );
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    enabled: open && Boolean(doctorId) && Boolean(scheduleId),
    staleTime: 1000 * 30,
  });

  const doctorSchedule = doctorScheduleResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor schedule details</DialogTitle>
          <DialogDescription>
            Doctor assignment and slot time for this schedule.
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
              : "Failed to load doctor schedule details."}
          </Alert>
        ) : null}

        {!isPending && !isError && doctorSchedule ? (
          <ViewDoctorScheduleContent doctorSchedule={doctorSchedule} />
        ) : null}

        {!isPending && !isError && !doctorSchedule ? (
          <Alert variant="destructive" className="text-sm">
            Doctor schedule not found.
          </Alert>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewDoctorScheduleModal;
