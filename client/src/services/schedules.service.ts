"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  DEFAULT_SCHEDULES_LIST_PARAMS,
  Schedule,
  ScheduleDetails,
  SchedulesQueryParams,
} from "@/types/schedules.types";

export const getSchedules = async (
  params: SchedulesQueryParams = DEFAULT_SCHEDULES_LIST_PARAMS,
): Promise<ApiResponse<Schedule[]>> => {
  return httpClient.get("/schedule", {
    params: params as Record<string, unknown>,
  });
};

export const getScheduleById = async (
  id: string,
): Promise<ApiResponse<ScheduleDetails>> => {
  return httpClient.get(`/schedule/${id}`);
};
