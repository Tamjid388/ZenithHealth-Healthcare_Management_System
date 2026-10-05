"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CreateDoctorForm } from "@/components/modules/admin/doctorsManagement/CreateDoctorForm";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export const CreateDoctorModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Create Doctor
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Doctor</DialogTitle>
          <DialogDescription>
            Add a registered doctor to the platform.
          </DialogDescription>
        </DialogHeader>
        <CreateDoctorForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateDoctorModal;
