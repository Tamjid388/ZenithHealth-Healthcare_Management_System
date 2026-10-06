import { AdminsTable } from "@/components/modules/admin/adminsManagement/AdminsTable";
import { CreateAdminModal } from "@/components/modules/admin/adminsManagement/CreateAdminModal";
import { getUserInfo } from "@/services/auth.service";
import { getAdmins } from "@/services/admins.service";
import { DEFAULT_ADMINS_LIST_PARAMS } from "@/types/admins.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface AdminsManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AdminsManagementPage({
  searchParams,
}: AdminsManagementPageProps) {
  const initialSearchParams = await searchParams;
  const userInfo = await getUserInfo();
  const canManage = userInfo?.role === "SUPER_ADMIN";
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admins", DEFAULT_ADMINS_LIST_PARAMS],
    queryFn: () => getAdmins(DEFAULT_ADMINS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              Admins
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform administrators and their access status.
            </p>
          </div>
          {canManage ? <CreateAdminModal /> : null}
        </div>
        <AdminsTable
          initialSearchParams={initialSearchParams}
          canManage={canManage}
        />
      </div>
    </HydrationBoundary>
  );
}

export default AdminsManagementPage;
