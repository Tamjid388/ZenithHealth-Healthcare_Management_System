"use client";

import { EditScheduleForm } from "@/components/modules/admin/schedulesManagement/EditScheduleForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

type EditScheduleModalProps = {
  scheduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditScheduleModal = ({
  scheduleId,
  open,
  onOpenChange,
}: EditScheduleModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit schedule</DialogTitle>
          <DialogDescription>
            Update the start and end time for this slot.
          </DialogDescription>
        </DialogHeader>

        {scheduleId && open ? (
          <EditScheduleForm
            key={scheduleId}
            scheduleId={scheduleId}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleModal;
