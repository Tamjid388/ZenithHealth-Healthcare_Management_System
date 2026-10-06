"use client";

import { EditSpecialityForm } from "@/components/modules/admin/specialtiesManagement/EditSpecialityForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { Speciality } from "@/types/specialities.types";

type EditSpecialityModalProps = {
  speciality: Speciality | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditSpecialityModal = ({
  speciality,
  open,
  onOpenChange,
}: EditSpecialityModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit speciality</DialogTitle>
          <DialogDescription>
            Update the title, description, and icon for this speciality.
          </DialogDescription>
        </DialogHeader>

        {speciality && open ? (
          <EditSpecialityForm
            key={speciality.id}
            speciality={speciality}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditSpecialityModal;
