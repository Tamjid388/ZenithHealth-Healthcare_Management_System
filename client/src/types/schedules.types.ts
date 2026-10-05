export type ScheduleRangeFilter = {
  gte?: string;
  lte?: string;
};

export type Schedule = {
  id: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SchedulesQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDateTime?: ScheduleRangeFilter;
  endDateTime?: ScheduleRangeFilter;
};

export const DEFAULT_SCHEDULES_LIST_PARAMS: SchedulesQueryParams = {
  page: 1,
  limit: 10,
};

export type ScheduleAppointment = {
  id?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string | Date;
  doctor?: {
    id?: string;
    name?: string;
    email?: string;
  };
  patient?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type ScheduleDoctorAssignment = {
  doctorId: string;
  scheduleId: string;
  isBooked?: boolean;
  doctor?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type ScheduleDetails = Schedule & {
  appointments?: ScheduleAppointment[];
  doctorSchedules?: ScheduleDoctorAssignment[];
};
