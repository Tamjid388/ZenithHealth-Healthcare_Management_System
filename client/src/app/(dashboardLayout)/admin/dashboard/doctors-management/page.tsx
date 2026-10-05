import { CreateDoctorModal } from "@/components/modules/admin/doctorsManagement/CreateDoctorModal";
import { DoctorsTable } from "@/components/modules/admin/doctorsManagement/DoctorsTable";
import { getDoctors } from "@/services/doctors.service";
import { DEFAULT_DOCTORS_LIST_PARAMS } from "@/types/doctors.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface DoctorsManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function DoctorsManagementPage({
  searchParams,
}: DoctorsManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors", DEFAULT_DOCTORS_LIST_PARAMS],
    queryFn: () => getDoctors(DEFAULT_DOCTORS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              Doctors
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Registered doctors on the platform.
            </p>
          </div>
          <CreateDoctorModal />
        </div>
        <DoctorsTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default DoctorsManagementPage;
