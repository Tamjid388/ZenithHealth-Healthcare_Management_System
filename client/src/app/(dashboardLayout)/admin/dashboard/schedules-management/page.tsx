import { CreateScheduleModal } from "@/components/modules/admin/schedulesManagement/CreateScheduleModal";
import { SchedulesTable } from "@/components/modules/admin/schedulesManagement/SchedulesTable";
import { getSchedules } from "@/services/schedules.service";
import { DEFAULT_SCHEDULES_LIST_PARAMS } from "@/types/schedules.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface SchedulesManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SchedulesManagementPage({
  searchParams,
}: SchedulesManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["schedules", DEFAULT_SCHEDULES_LIST_PARAMS],
    queryFn: () => getSchedules(DEFAULT_SCHEDULES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              Schedules
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Time slots available for doctor assignments.
            </p>
          </div>
          <CreateScheduleModal />
        </div>
        <SchedulesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default SchedulesManagementPage;
