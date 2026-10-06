import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { BookAppointmentForm } from "@/components/modules/patient/bookAppointment/BookAppointmentForm";
import { getDoctors } from "@/services/doctors.service";

const DOCTORS_PICKER_PARAMS = { page: 1, limit: 50 };

interface BookAppointmentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function BookAppointmentsPage({ searchParams }: BookAppointmentsPageProps) {
  const params = await searchParams;
  const doctorParam = params.doctorId;
  const initialDoctorId = Array.isArray(doctorParam)
    ? (doctorParam[0] ?? "")
    : (doctorParam ?? "");

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors", DOCTORS_PICKER_PARAMS],
    queryFn: () => getDoctors(DOCTORS_PICKER_PARAMS),
    staleTime: 1000 * 30 * 3,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-zh-blue-deep">
            Book Appointment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a doctor, pick an open time, and confirm your booking.
          </p>
        </div>
        <BookAppointmentForm initialDoctorId={initialDoctorId} />
      </div>
    </HydrationBoundary>
  );
}

export default BookAppointmentsPage;
