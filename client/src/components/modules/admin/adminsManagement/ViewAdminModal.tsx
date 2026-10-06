"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminByIdAction } from "@/app/(dashboardLayout)/admin/dashboard/admins-management/_action";
import {
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ViewAdminModalProps = {
  adminId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ViewAdminModal = ({
  adminId,
  open,
  onOpenChange,
}: ViewAdminModalProps) => {
  const {
    data: adminResponse,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", adminId],
    queryFn: async () => {
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      const result = await getAdminByIdAction(adminId);
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    enabled: open && Boolean(adminId),
    staleTime: 1000 * 30,
  });

  const admin = adminResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admin details</DialogTitle>
          <DialogDescription>
            Account and contact information.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {isError ? (
          <Alert variant="destructive" className="text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load admin details."}
          </Alert>
        ) : null}

        {!isPending && !isError && admin ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {admin.profilePhoto ? (
                  <AvatarImage src={admin.profilePhoto} alt={admin.name} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">
                  {admin.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{admin.name}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
            </div>
            <dl className="divide-y divide-border rounded-lg border border-border px-4">
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Role</dt>
                <dd className="text-sm font-medium">
                  {admin.user?.role ? (
                    <Badge variant="secondary">
                      {admin.user.role.toLowerCase().replace("_", " ")}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="text-sm font-medium">{admin.user?.status ?? "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Contact</dt>
                <dd className="text-sm font-medium">{admin.contactNumber ?? "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-muted-foreground">Email verified</dt>
                <dd className="text-sm font-medium">
                  {admin.user?.emailVerified ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewAdminModal;
