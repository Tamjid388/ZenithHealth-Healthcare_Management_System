"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CreateSpecialityForm } from "@/components/modules/admin/specialtiesManagement/CreateSpecialityForm";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

export const CreateSpecialityModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Create Speciality
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create speciality</DialogTitle>
          <DialogDescription>
            Add a new medical speciality with a title, description, and
            optional icon.
          </DialogDescription>
        </DialogHeader>
        <CreateSpecialityForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateSpecialityModal;
