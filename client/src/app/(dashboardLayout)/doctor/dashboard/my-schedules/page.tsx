import { ClaimScheduleModal } from "@/components/modules/doctor/mySchedules/ClaimScheduleModal";
import { MySchedulesTable } from "@/components/modules/doctor/mySchedules/MySchedulesTable";
import { getMyDoctorSchedules } from "@/services/doctor-schedules.service";
import { DEFAULT_MY_SCHEDULES_LIST_PARAMS } from "@/types/doctor-schedules.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface MySchedulesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function MySchedulesPage({ searchParams }: MySchedulesPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-schedules", DEFAULT_MY_SCHEDULES_LIST_PARAMS],
    queryFn: () => getMyDoctorSchedules(DEFAULT_MY_SCHEDULES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              My Schedules
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Time slots you have claimed. Release unbooked slots or claim new
              ones.
            </p>
          </div>
          <ClaimScheduleModal />
        </div>
        <MySchedulesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default MySchedulesPage;
