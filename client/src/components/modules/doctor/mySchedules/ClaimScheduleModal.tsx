"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { ClaimScheduleForm } from "@/components/modules/doctor/mySchedules/ClaimScheduleForm";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export const ClaimScheduleModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Claim Schedule
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Claim schedules</DialogTitle>
          <DialogDescription>
            Select available time slots to add them to your schedules.
          </DialogDescription>
        </DialogHeader>
        <ClaimScheduleForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClaimScheduleModal;
