"use client";

import { EditDoctorForm } from "@/components/modules/admin/doctorsManagement/EditDoctorForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

type EditDoctorModalProps = {
  doctorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditDoctorModal = ({
  doctorId,
  open,
  onOpenChange,
}: EditDoctorModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit doctor</DialogTitle>
          <DialogDescription>
            Update doctor profile details and specialities.
          </DialogDescription>
        </DialogHeader>

        {doctorId && open ? (
          <EditDoctorForm
            key={doctorId}
            doctorId={doctorId}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditDoctorModal;
