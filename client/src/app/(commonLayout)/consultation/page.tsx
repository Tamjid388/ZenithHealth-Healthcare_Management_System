import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { DoctorList } from "@/components/modules/consultation/DoctorList";
import { getDoctors } from "@/services/doctors.service";
import { getSpecialities } from "@/services/specialities.service";
import { DEFAULT_DOCTORS_LIST_PARAMS } from "@/types/doctors.types";


async function ConsultationPage() {
  const queryClient = new QueryClient();
  const initialDoctorsParams = {
    ...DEFAULT_DOCTORS_LIST_PARAMS,
    page: 1,
    limit: 9,
  };
  const initialSpecialitiesParams = { page: 1, limit: 100 };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["doctors", initialDoctorsParams],
      queryFn: () => getDoctors(initialDoctorsParams),
      staleTime: 1000 * 30 * 3,
    }),
    queryClient.prefetchQuery({
      queryKey: ["specialities", initialSpecialitiesParams],
      queryFn: () => getSpecialities(initialSpecialitiesParams),
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorList />
    </HydrationBoundary>
  );
}

export default ConsultationPage;
