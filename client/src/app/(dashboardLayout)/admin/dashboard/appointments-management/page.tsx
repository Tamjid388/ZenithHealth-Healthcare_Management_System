import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { AppointmentsTable } from "@/components/modules/appointments/AppointmentsTable";
import { getMyAppointments } from "@/services/appointments.service";
import { DEFAULT_MY_APPOINTMENTS_LIST_PARAMS } from "@/types/appointments.types";

async function AppointmentsManagementPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-appointments", DEFAULT_MY_APPOINTMENTS_LIST_PARAMS],
    queryFn: () => getMyAppointments(DEFAULT_MY_APPOINTMENTS_LIST_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every booking in the hospital. View details or cancel a scheduled
            visit.
          </p>
        </div>
        <AppointmentsTable
          queryKeyPrefix="admin-appointments"
          showPatientColumn
          searchPlaceholder="Search by doctor name or email..."
          emptyMessage="No appointments booked yet."
        />
      </div>
    </HydrationBoundary>
  );
}

export default AppointmentsManagementPage;
