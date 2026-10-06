import { PatientsTable } from "@/components/modules/admin/patientsManagement/PatientsTable";
import { getPatients } from "@/services/patients.service";
import { DEFAULT_PATIENTS_LIST_PARAMS } from "@/types/patients.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface PatientsManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function PatientsManagementPage({
  searchParams,
}: PatientsManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["patients", DEFAULT_PATIENTS_LIST_PARAMS],
    queryFn: () => getPatients(DEFAULT_PATIENTS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
            Patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered patients on the platform.
          </p>
        </div>
        <PatientsTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default PatientsManagementPage;
