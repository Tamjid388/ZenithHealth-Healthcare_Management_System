import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { AppointmentsTable } from "@/components/modules/appointments/AppointmentsTable";
import { AppointmentsReviewList } from "@/components/modules/patient/myAppointments/AppointmentsReviewList";
import { getMyAppointments } from "@/services/appointments.service";
import { DEFAULT_MY_APPOINTMENTS_LIST_PARAMS } from "@/types/appointments.types";

async function MyAppointmentsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["my-appointments", DEFAULT_MY_APPOINTMENTS_LIST_PARAMS],
    queryFn: () => getMyAppointments(DEFAULT_MY_APPOINTMENTS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8 p-6">
        <div className="space-y-4">
          <div>
            <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
              My Appointments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All your bookings. View details or cancel a scheduled visit.
            </p>
          </div>
          <AppointmentsTable
            queryKeyPrefix="my-appointments"
            searchPlaceholder="Search by doctor name or email..."
          />
        </div>
        <AppointmentsReviewList />
      </div>
    </HydrationBoundary>
  );
}

export default MyAppointmentsPage;
