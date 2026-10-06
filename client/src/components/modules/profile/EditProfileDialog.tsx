"use client";

import { EditProfileForm } from "@/components/modules/profile/EditProfileForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { TMyProfile } from "@/types/user.types";

type EditProfileDialogProps = {
  profile: TMyProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditProfileDialog = ({
  profile,
  open,
  onOpenChange,
}: EditProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your personal information.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <EditProfileForm
            key={profile.id}
            profile={profile}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
