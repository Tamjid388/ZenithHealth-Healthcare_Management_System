"use client";

import { useQuery } from "@tanstack/react-query";

import { getScheduleByIdAction } from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action";
import { ViewScheduleContent } from "@/components/modules/admin/schedulesManagement/ViewScheduleContent";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

type ViewScheduleModalProps = {
  scheduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ViewScheduleModal = ({
  scheduleId,
  open,
  onOpenChange,
}: ViewScheduleModalProps) => {
  const {
    data: scheduleResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      if (!scheduleId) {
        throw new Error("Schedule ID is required");
      }

      const result = await getScheduleByIdAction(scheduleId);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    enabled: open && Boolean(scheduleId),
    staleTime: 1000 * 30,
  });

  const schedule = scheduleResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule details</DialogTitle>
          <DialogDescription>
            Slot time, assigned doctors, and appointments.
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
              : "Failed to load schedule details."}
          </Alert>
        ) : null}

        {!isPending && !isError && schedule ? (
          <ViewScheduleContent schedule={schedule} />
        ) : null}

        {!isPending && !isError && !schedule ? (
          <Alert variant="destructive" className="text-sm">
            Schedule not found.
          </Alert>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleModal;
