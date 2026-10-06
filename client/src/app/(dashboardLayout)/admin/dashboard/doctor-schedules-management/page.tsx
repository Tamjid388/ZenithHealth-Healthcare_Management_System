import { DoctorSchedulesTable } from "@/components/modules/admin/doctorSchedulesManagement/DoctorSchedulesTable";
import { getAdminDoctorSchedules } from "@/services/doctor-schedules.service";
import { DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS } from "@/types/doctor-schedules.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface DoctorSchedulesManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function DoctorSchedulesManagementPage({
  searchParams,
}: DoctorSchedulesManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      "admin-doctor-schedules",
      DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS,
    ],
    queryFn: () =>
      getAdminDoctorSchedules(DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              Doctor Schedules
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Doctor assignments across time slots. Read-only for admins;
              doctors manage their own schedules.
            </p>
          </div>
        </div>
        <DoctorSchedulesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default DoctorSchedulesManagementPage;
