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

export type AdminDoctorScheduleDoctor = {
  id?: string;
  name?: string;
  email?: string;
  user?: {
    status?: string;
  };
};

export type AdminDoctorSchedule = {
  doctorId: string;
  scheduleId: string;
  isBooked: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  schedule?: MyDoctorScheduleSlot;
  doctor?: AdminDoctorScheduleDoctor;
};

export type AdminDoctorSchedulesQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isBooked?: boolean | string;
  doctorId?: string;
  scheduleId?: string;
};

export const DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS: AdminDoctorSchedulesQueryParams =
  {
    page: 1,
    limit: 10,
  };

export type AdminDoctorScheduleDetails = AdminDoctorSchedule;
