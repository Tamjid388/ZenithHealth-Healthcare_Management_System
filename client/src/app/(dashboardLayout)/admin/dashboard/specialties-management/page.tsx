import { CreateSpecialityModal } from "@/components/modules/admin/specialtiesManagement/CreateSpecialityModal";
import { SpecialitiesTable } from "@/components/modules/admin/specialtiesManagement/SpecialitiesTable";
import { getSpecialities } from "@/services/specialities.service";
import { DEFAULT_SPECIALITIES_LIST_PARAMS } from "@/types/specialities.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

interface SpecialtiesManagementPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function SpecialtiesManagementPage({
  searchParams,
}: SpecialtiesManagementPageProps) {
  const initialSearchParams = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["specialities", DEFAULT_SPECIALITIES_LIST_PARAMS],
    queryFn: () => getSpecialities(DEFAULT_SPECIALITIES_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              Specialties
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Medical specialities patients can browse doctors by.
            </p>
          </div>
          <CreateSpecialityModal />
        </div>
        <SpecialitiesTable initialSearchParams={initialSearchParams} />
      </div>
    </HydrationBoundary>
  );
}

export default SpecialtiesManagementPage;
