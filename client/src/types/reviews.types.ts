export type ReviewPatient = {
  name: string;
};

export type ReviewDoctor = {
  id: string;
  name: string;
};

export type ReviewAppointmentSchedule = {
  id?: string;
  startDateTime?: string | Date;
  endDateTime?: string | Date;
};

export type ReviewAppointment = {
  id: string;
  status?: string;
  schedule?: ReviewAppointmentSchedule | null;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patient?: ReviewPatient | null;
  doctor?: ReviewDoctor | null;
  appointment?: ReviewAppointment | null;
};

export type ReviewsQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  doctorId?: string;
  rating?: {
    gte?: number;
    lte?: number;
  };
  include?: string;
};

export const DEFAULT_MY_REVIEWS_LIST_PARAMS: ReviewsQueryParams = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export type ICreateReviewPayload = {
  appointmentId: string;
  rating: number;
  comment?: string;
};

export type IUpdateReviewPayload = {
  rating?: number;
  comment?: string;
};
