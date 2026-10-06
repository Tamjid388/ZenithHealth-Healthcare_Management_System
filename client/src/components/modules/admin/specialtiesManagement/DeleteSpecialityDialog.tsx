"use client";

import { deleteSpecialityAction } from "@/app/(dashboardLayout)/admin/dashboard/specialties-management/_action";
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

type DeleteSpecialityDialogProps = {
  specialityId: string | null;
  specialityTitle: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DeleteSpecialityDialog = ({
  specialityId,
  specialityTitle,
  open,
  onOpenChange,
}: DeleteSpecialityDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => deleteSpecialityAction(id),
  });

  const handleDelete = async () => {
    if (!specialityId) {
      return;
    }

    try {
      const result = await mutateAsync(specialityId);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["specialities"] });
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError((error as Error).message || "Failed to delete speciality");
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
          <AlertDialogTitle>Delete speciality</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {specialityTitle ?? "this speciality"}? Doctors linked to
            it will keep their accounts but lose this speciality tag. This
            cannot be undone.
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
            disabled={isPending || !specialityId}
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

export default DeleteSpecialityDialog;
