"use client";

import { deleteMyDoctorScheduleAction } from "@/app/(dashboardLayout)/doctor/dashboard/my-schedules/_action";
import { Alert } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type ReleaseScheduleDialogProps = {
  scheduleId: string | null;
  scheduleLabel: string | null;
  isBooked: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ReleaseScheduleDialog = ({
  scheduleId,
  scheduleLabel,
  isBooked,
  open,
  onOpenChange,
}: ReleaseScheduleDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => deleteMyDoctorScheduleAction(id),
  });

  const handleRelease = async () => {
    if (!scheduleId || isBooked) {
      return;
    }

    try {
      const result = await mutateAsync(scheduleId);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError((error as Error).message || "Failed to release schedule");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setServerError(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release schedule</AlertDialogTitle>
          <AlertDialogDescription>
            {isBooked
              ? `This slot (${scheduleLabel ?? "selected slot"}) is already booked and cannot be released.`
              : `Release ${scheduleLabel ?? "this schedule slot"}? This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {serverError ? (
          <Alert variant="destructive" className="text-sm text-red-500">
            {serverError}
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending || !scheduleId || isBooked}
            onClick={(event) => {
              event.preventDefault();
              void handleRelease();
            }}
          >
            {isPending ? "Releasing..." : "Release"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReleaseScheduleDialog;
