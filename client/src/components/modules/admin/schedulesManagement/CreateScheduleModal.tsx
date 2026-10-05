"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CreateScheduleForm } from "@/components/modules/admin/schedulesManagement/CreateScheduleForm";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export const CreateScheduleModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Create Schedule
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create schedule</DialogTitle>
          <DialogDescription>
            Generate 30-minute slots for each day between the start and end
            dates, within the selected times.
          </DialogDescription>
        </DialogHeader>
        <CreateScheduleForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleModal;
