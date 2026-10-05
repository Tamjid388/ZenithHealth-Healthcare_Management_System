"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
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
