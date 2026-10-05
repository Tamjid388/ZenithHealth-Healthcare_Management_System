"use client";

import { deleteDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
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

type DeleteDoctorDialogProps = {
  doctorId: string | null;
  doctorName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DeleteDoctorDialog = ({
  doctorId,
  doctorName,
  open,
  onOpenChange,
}: DeleteDoctorDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => deleteDoctorAction(id),
  });

  const handleDelete = async () => {
    if (!doctorId) {
      return;
    }

    try {
      const result = await mutateAsync(doctorId);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError((error as Error).message || "Failed to delete doctor");
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
          <AlertDialogTitle>Delete doctor</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {doctorName ?? "this doctor"}? This will soft-delete the
            doctor and revoke their sessions.
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
            disabled={isPending || !doctorId}
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

export default DeleteDoctorDialog;
