"use client";

import { deleteAdminAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
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

type DeleteAdminDialogProps = {
  adminId: string | null;
  adminName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DeleteAdminDialog = ({
  adminId,
  adminName,
  open,
  onOpenChange,
}: DeleteAdminDialogProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => deleteAdminAction(id),
  });

  const handleDelete = async () => {
    if (!adminId) {
      return;
    }

    try {
      const result = await mutateAsync(adminId);
      if (!result.success) {
        setServerError(result.message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      setServerError(null);
      onOpenChange(false);
    } catch (error) {
      unstable_rethrow(error);
      setServerError((error as Error).message || "Failed to delete admin");
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
          <AlertDialogTitle>Delete admin</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {adminName ?? "this admin"}? This will soft-delete the
            admin and sign them out immediately.
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
            disabled={isPending || !adminId}
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

export default DeleteAdminDialog;
