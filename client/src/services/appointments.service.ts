'use server'

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import {
  DEFAULT_MY_APPOINTMENTS_LIST_PARAMS,
  MyAppointment,
  MyAppointmentsQueryParams,
} from "@/types/appointments.types";

export const getMyAppointments = async (
  params: MyAppointmentsQueryParams = DEFAULT_MY_APPOINTMENTS_LIST_PARAMS,
): Promise<ApiResponse<MyAppointment[]>> => {
  return httpClient.get("/appointments/my", {
    params: params as Record<string, unknown>,
  });
};

export const getAppointmentById = async (
  id: string,
): Promise<ApiResponse<MyAppointment>> => {
  return httpClient.get(`/appointments/${id}`);
};
