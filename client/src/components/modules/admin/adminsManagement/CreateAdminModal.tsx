"use client";

import { useState } from "react";

import { CreateAdminForm } from "@/components/modules/admin/adminsManagement/CreateAdminForm";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { Plus } from "lucide-react";

export const CreateAdminModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="cursor-pointer">
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Create admin
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create admin</DialogTitle>
            <DialogDescription>
              Add a new admin. They will sign in with this email and password.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <CreateAdminForm
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAdminModal;
