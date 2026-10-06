import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { AppointmentsTable } from "@/components/modules/appointments/AppointmentsTable";
import { getMyAppointments } from "@/services/appointments.service";
import { DEFAULT_MY_APPOINTMENTS_LIST_PARAMS } from "@/types/appointments.types";

async function DoctorAppointmentsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctor-appointments", DEFAULT_MY_APPOINTMENTS_LIST_PARAMS],
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
            Patient bookings on your claimed slots. View details or cancel a
            scheduled visit.
          </p>
        </div>
        <AppointmentsTable
          queryKeyPrefix="doctor-appointments"
          showPatientColumn
          searchPlaceholder="Search by doctor name or email..."
          emptyMessage="No appointments booked on your slots yet."
        />
      </div>
    </HydrationBoundary>
  );
}

export default DoctorAppointmentsPage;
