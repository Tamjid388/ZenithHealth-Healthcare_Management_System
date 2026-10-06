"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { Speciality } from "@/types/specialities.types";

type ViewSpecialityModalProps = {
  speciality: Speciality | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDateTime = (value?: string | Date) => {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm text-foreground">{value ?? "—"}</p>
  </div>
);

export const ViewSpecialityModal = ({
  speciality,
  open,
  onOpenChange,
}: ViewSpecialityModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Speciality details</DialogTitle>
          <DialogDescription>
            Title, description, and icon for this speciality.
          </DialogDescription>
        </DialogHeader>

        {!speciality ? (
          <p className="text-sm text-muted-foreground">
            Speciality not found.
          </p>
        ) : (
          <div className="space-y-6">
            {speciality.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={speciality.icon}
                alt={speciality.title}
                className="h-40 w-full rounded-lg object-cover ring-1 ring-zh-blue-deep/10"
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Title" value={speciality.title} />
              <DetailItem
                label="Created"
                value={formatDateTime(speciality.createdAt)}
              />
              <DetailItem
                label="Updated"
                value={formatDateTime(speciality.updatedAt)}
              />
              <DetailItem label="ID" value={speciality.id} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {speciality.description || "—"}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSpecialityModal;
