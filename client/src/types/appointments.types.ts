export type AppointmentDoctor = {
  id: string;
  name: string;
  email?: string | null;
  designation?: string | null;
  appointmentFee?: number | null;
  user?: {
    status?: string | null;
  } | null;
};

export type AppointmentPatient = {
  id: string;
  name: string;
  email: string;
  contactNumber?: string | null;
};

export type AppointmentSchedule = {
  id: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
};

export type AppointmentPayment = {
  id: string;
  amount: number;
  status: string;
};

export type MyAppointment = {
  id: string;
  status: string;
  paymentStatus?: string | null;
  videoCallingId?: string | null;
  createdAt: string | Date;
  doctorId?: string | null;
  scheduleId?: string | null;
  doctor?: AppointmentDoctor | null;
  patient?: AppointmentPatient | null;
  schedule?: AppointmentSchedule | null;
  payment?: AppointmentPayment | null;
};

export type MyAppointmentsQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  status?: string;
  paymentStatus?: string;
  doctorId?: string;
  scheduleId?: string;
};

export const DEFAULT_MY_APPOINTMENTS_LIST_PARAMS: MyAppointmentsQueryParams = {
  page: 1,
  limit: 10,
};

export type BookAppointmentInput = {
  doctorId: string;
  scheduleId: string;
};

export type BookedAppointment = {
  appointment: MyAppointment;
  paymentData: AppointmentPayment;
};
