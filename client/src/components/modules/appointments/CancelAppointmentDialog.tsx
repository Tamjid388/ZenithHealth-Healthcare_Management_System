"use client";

import { cancelAppointmentAction } from "@/app/(dashboardLayout)/(patientRouteGroup)/(patientDashboardLayout)/(dashboard)/dashboard/my-appointments/_action";
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
import type { MyAppointment } from "@/types/appointments.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type CancelAppointmentDialogProps = {
  appointment: MyAppointment | null;
  invalidateKeys?: string[][];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CancelAppointmentDialog = ({
  appointment,
  invalidateKeys = [["my-appointments"]],
  open,
  onOpenChange,
}: CancelAppointmentDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => cancelAppointmentAction(id),
  });

  const handleCancel = async () => {
    if (!appointment || appointment.status !== "SCHEDULED") {
      return;
    }

    try {
      const result = await mutateAsync(appointment.id);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await Promise.all(
        invalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError(
        (error as Error).message || "Failed to cancel appointment",
      );
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
          <AlertDialogTitle>Cancel appointment</AlertDialogTitle>
          <AlertDialogDescription>
            {`Cancel the appointment with ${appointment?.doctor?.name ?? "this clinician"}? The time slot becomes available again. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {serverError ? (
          <Alert variant="destructive" className="text-sm text-red-500">
            {serverError}
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending || !appointment}
            onClick={(event) => {
              event.preventDefault();
              void handleCancel();
            }}
          >
            {isPending ? "Canceling..." : "Cancel appointment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelAppointmentDialog;
