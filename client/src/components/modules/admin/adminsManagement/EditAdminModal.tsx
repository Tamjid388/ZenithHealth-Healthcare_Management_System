"use client";

import { EditAdminForm } from "@/components/modules/admin/adminsManagement/EditAdminForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

type EditAdminModalProps = {
  adminId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditAdminModal = ({
  adminId,
  open,
  onOpenChange,
}: EditAdminModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit admin</DialogTitle>
          <DialogDescription>
            Update admin profile details.
          </DialogDescription>
        </DialogHeader>

        {adminId && open ? (
          <EditAdminForm
            key={adminId}
            adminId={adminId}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminModal;
