"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  AdminDoctorSchedule,
  AdminDoctorScheduleDetails,
  AdminDoctorSchedulesQueryParams,
  DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS,
  DEFAULT_MY_SCHEDULES_LIST_PARAMS,
  MyDoctorSchedule,
  MyDoctorSchedulesQueryParams,
} from "@/types/doctor-schedules.types";

export const getMyDoctorSchedules = async (
  params: MyDoctorSchedulesQueryParams = DEFAULT_MY_SCHEDULES_LIST_PARAMS,
): Promise<ApiResponse<MyDoctorSchedule[]>> => {
  return httpClient.get("/doctor-schedules/my", {
    params: params as Record<string, unknown>,
  });
};

export const getAdminDoctorSchedules = async (
  params: AdminDoctorSchedulesQueryParams = DEFAULT_ADMIN_DOCTOR_SCHEDULES_LIST_PARAMS,
): Promise<ApiResponse<AdminDoctorSchedule[]>> => {
  return httpClient.get("/doctor-schedules", {
    params: params as Record<string, unknown>,
  });
};

export const getAdminDoctorScheduleById = async (
  doctorId: string,
  scheduleId: string,
): Promise<ApiResponse<AdminDoctorScheduleDetails>> => {
  return httpClient.get(`/doctor-schedules/${doctorId}/${scheduleId}`);
};
