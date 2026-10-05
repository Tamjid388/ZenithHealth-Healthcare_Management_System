export type MyDoctorScheduleSlot = {
  id: string;
  startDateTime: string | Date;
  endDateTime: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type MyDoctorSchedule = {
  doctorId: string;
  scheduleId: string;
  isBooked: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  schedule?: MyDoctorScheduleSlot;
  doctor?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type MyDoctorSchedulesQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isBooked?: boolean | string;
  scheduleId?: string;
  doctorId?: string;
};

export const DEFAULT_MY_SCHEDULES_LIST_PARAMS: MyDoctorSchedulesQueryParams = {
  page: 1,
  limit: 10,
};
