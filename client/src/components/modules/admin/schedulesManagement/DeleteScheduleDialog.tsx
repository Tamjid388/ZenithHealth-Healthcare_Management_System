"use client";

import { deleteScheduleAction } from "@/app/(dashboardLayout)/admin/dashboard/schedules-management/_action";
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
import { Alert } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type DeleteScheduleDialogProps = {
  scheduleId: string | null;
  scheduleLabel: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DeleteScheduleDialog = ({
  scheduleId,
  scheduleLabel,
  open,
  onOpenChange,
}: DeleteScheduleDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => deleteScheduleAction(id),
  });

  const handleDelete = async () => {
    if (!scheduleId) {
      return;
    }

    try {
      const result = await mutateAsync(scheduleId);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError((error as Error).message || "Failed to delete schedule");
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
          <AlertDialogTitle>Delete schedule</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {scheduleLabel ?? "this schedule slot"}? This cannot be
            undone and will also remove any doctor assignments for this slot.
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
            disabled={isPending || !scheduleId}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteScheduleDialog;
